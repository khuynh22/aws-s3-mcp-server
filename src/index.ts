#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { z } from 'zod';
import pino from 'pino';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino/file',
    options: { destination: 2 }, // stderr
  },
});

// Validate required environment variables
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

if (!AWS_REGION) {
  logger.error('AWS_REGION environment variable is required');
  process.exit(1);
}

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  logger.error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables are required');
  process.exit(1);
}

// Check if write operations are allowed
const ALLOW_WRITE = process.env.ALLOW_WRITE === 'true';

// Initialize S3 client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Zod schemas for input validation
const ListObjectsSchema = z.object({
  bucket: z.string().min(1, 'Bucket name is required'),
  prefix: z.string().optional(),
  maxKeys: z.number().int().positive().max(1000).optional(),
});

const PresignGetSchema = z.object({
  bucket: z.string().min(1, 'Bucket name is required'),
  key: z.string().min(1, 'Object key is required'),
  expiresIn: z.number().int().positive().max(604800).optional().default(3600), // Max 7 days
});

const PresignPutSchema = z.object({
  bucket: z.string().min(1, 'Bucket name is required'),
  key: z.string().min(1, 'Object key is required'),
  expiresIn: z.number().int().positive().max(604800).optional().default(3600), // Max 7 days
  contentType: z.string().optional(),
});

// Create MCP server
const server = new Server(
  {
    name: 'aws-s3-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools: Array<{
    name: string;
    description: string;
    inputSchema: {
      type: string;
      properties: Record<string, unknown>;
      required?: string[];
    };
  }> = [
    {
      name: 's3_list_buckets',
      description: 'List all S3 buckets in the AWS account',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 's3_list_objects',
      description: 'List objects in an S3 bucket with optional prefix filtering',
      inputSchema: {
        type: 'object',
        properties: {
          bucket: {
            type: 'string',
            description: 'The name of the S3 bucket',
          },
          prefix: {
            type: 'string',
            description: 'Optional prefix to filter objects',
          },
          maxKeys: {
            type: 'number',
            description: 'Maximum number of keys to return (1-1000)',
          },
        },
        required: ['bucket'],
      },
    },
    {
      name: 's3_presign_get',
      description: 'Generate a presigned URL for downloading an object from S3',
      inputSchema: {
        type: 'object',
        properties: {
          bucket: {
            type: 'string',
            description: 'The name of the S3 bucket',
          },
          key: {
            type: 'string',
            description: 'The object key',
          },
          expiresIn: {
            type: 'number',
            description: 'URL expiration time in seconds (default: 3600, max: 604800)',
          },
        },
        required: ['bucket', 'key'],
      },
    },
  ];

  if (ALLOW_WRITE) {
    tools.push({
      name: 's3_presign_put',
      description: 'Generate a presigned URL for uploading an object to S3',
      inputSchema: {
        type: 'object',
        properties: {
          bucket: {
            type: 'string',
            description: 'The name of the S3 bucket',
          },
          key: {
            type: 'string',
            description: 'The object key',
          },
          expiresIn: {
            type: 'number',
            description: 'URL expiration time in seconds (default: 3600, max: 604800)',
          },
          contentType: {
            type: 'string',
            description: 'Content type of the object to upload',
          },
        },
        required: ['bucket', 'key'],
      },
    });
  }

  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 's3_list_buckets': {
        logger.info('Listing S3 buckets');
        const command = new ListBucketsCommand({});
        const response = await s3Client.send(command);
        
        const buckets = response.Buckets?.map(bucket => ({
          name: bucket.Name,
          creationDate: bucket.CreationDate?.toISOString(),
        })) || [];

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(buckets, null, 2),
            },
          ],
        };
      }

      case 's3_list_objects': {
        const params = ListObjectsSchema.parse(args);
        logger.info({ bucket: params.bucket, prefix: params.prefix }, 'Listing S3 objects');

        const command = new ListObjectsV2Command({
          Bucket: params.bucket,
          Prefix: params.prefix,
          MaxKeys: params.maxKeys,
        });

        const response = await s3Client.send(command);
        
        const objects = response.Contents?.map(obj => ({
          key: obj.Key,
          size: obj.Size,
          lastModified: obj.LastModified?.toISOString(),
          etag: obj.ETag,
        })) || [];

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                objects,
                isTruncated: response.IsTruncated,
                keyCount: response.KeyCount,
              }, null, 2),
            },
          ],
        };
      }

      case 's3_presign_get': {
        const params = PresignGetSchema.parse(args);
        logger.info({ bucket: params.bucket, key: params.key }, 'Generating presigned GET URL');

        const command = new GetObjectCommand({
          Bucket: params.bucket,
          Key: params.key,
        });

        const url = await getSignedUrl(s3Client, command, {
          expiresIn: params.expiresIn,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                url,
                expiresIn: params.expiresIn,
                bucket: params.bucket,
                key: params.key,
              }, null, 2),
            },
          ],
        };
      }

      case 's3_presign_put': {
        if (!ALLOW_WRITE) {
          throw new Error('Write operations are disabled. Set ALLOW_WRITE=true in .env to enable.');
        }

        const params = PresignPutSchema.parse(args);
        logger.info({ bucket: params.bucket, key: params.key }, 'Generating presigned PUT URL');

        const command = new PutObjectCommand({
          Bucket: params.bucket,
          Key: params.key,
          ContentType: params.contentType,
        });

        const url = await getSignedUrl(s3Client, command, {
          expiresIn: params.expiresIn,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                url,
                expiresIn: params.expiresIn,
                bucket: params.bucket,
                key: params.key,
                contentType: params.contentType,
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error({ error, tool: name }, 'Error executing tool');
    
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: 'text',
            text: `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  logger.info('Starting AWS S3 MCP Server');
  logger.info({ writeEnabled: ALLOW_WRITE, region: AWS_REGION }, 'Configuration');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('AWS S3 MCP Server started successfully');
}

main().catch((error) => {
  logger.error({ error }, 'Fatal error');
  process.exit(1);
});
