#!/usr/bin/env node

/**
 * Quick test script to verify AWS S3 connection and list buckets
 * Usage: node quick-test.js
 */

import { S3Client, ListBucketsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate environment variables
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('❌ Error: AWS credentials not found in environment variables');
  console.error('Make sure .env file exists with AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
  process.exit(1);
}

if (!process.env.AWS_REGION) {
  console.error('❌ Error: AWS_REGION not found in environment variables');
  process.exit(1);
}

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testConnection() {
  console.log('🔧 Testing AWS S3 connection...\n');
  console.log(`Region: ${process.env.AWS_REGION}`);
  console.log(`Access Key: ${process.env.AWS_ACCESS_KEY_ID.substring(0, 8)}...`);
  console.log('');

  try {
    // Test 1: List buckets
    console.log('📦 Listing S3 buckets...');
    const listBucketsCommand = new ListBucketsCommand({});
    const bucketsResponse = await s3Client.send(listBucketsCommand);

    if (!bucketsResponse.Buckets || bucketsResponse.Buckets.length === 0) {
      console.log('   No buckets found in your account');
    } else {
      console.log(`   ✓ Found ${bucketsResponse.Buckets.length} bucket(s):\n`);
      bucketsResponse.Buckets.forEach((bucket, index) => {
        console.log(`   ${index + 1}. ${bucket.Name}`);
        console.log(`      Created: ${bucket.CreationDate?.toISOString()}`);
      });
    }

    // Test 2: List objects in first bucket (if exists)
    if (bucketsResponse.Buckets && bucketsResponse.Buckets.length > 0) {
      const firstBucket = bucketsResponse.Buckets[0].Name;
      console.log(`\n📄 Listing objects in '${firstBucket}'...`);

      const listObjectsCommand = new ListObjectsV2Command({
        Bucket: firstBucket,
        MaxKeys: 5,
      });

      try {
        const objectsResponse = await s3Client.send(listObjectsCommand);

        if (!objectsResponse.Contents || objectsResponse.Contents.length === 0) {
          console.log('   Bucket is empty');
        } else {
          console.log(`   ✓ Found ${objectsResponse.KeyCount} object(s) (showing first 5):\n`);
          objectsResponse.Contents.forEach((obj, index) => {
            console.log(`   ${index + 1}. ${obj.Key}`);
            console.log(`      Size: ${obj.Size} bytes`);
            console.log(`      Modified: ${obj.LastModified?.toISOString()}`);
          });

          // Test 3: Generate presigned URL for first object
          if (objectsResponse.Contents[0]) {
            const firstObject = objectsResponse.Contents[0];
            console.log(`\n🔗 Generating presigned URL for '${firstObject.Key}'...`);

            const getObjectCommand = new GetObjectCommand({
              Bucket: firstBucket,
              Key: firstObject.Key,
            });

            const presignedUrl = await getSignedUrl(s3Client, getObjectCommand, {
              expiresIn: 3600,
            });

            console.log('   ✓ Presigned URL generated successfully');
            console.log(`   URL length: ${presignedUrl.length} characters`);
            console.log(`   Expires in: 3600 seconds (1 hour)`);
          }
        }
      } catch (error) {
        if (error.name === 'AccessDenied') {
          console.log('   ⚠ Access denied - check IAM permissions for ListObjects');
        } else if (error.message && error.message.includes('endpoint')) {
          console.log('   ⚠ Bucket is in a different region - skipping object listing');
          console.log(`   (This is normal if your buckets are in different regions)`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ All tests passed! AWS S3 connection is working correctly.');
    console.log('\nYou can now:');
    console.log('1. Start the MCP server: npm start');
    console.log('2. Configure Claude Desktop (see SETUP_GUIDE.md)');
    console.log('3. Test with Claude: "List my S3 buckets"');

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.name === 'InvalidAccessKeyId') {
      console.error('\nThe AWS Access Key ID is invalid. Please check your credentials.');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('\nThe AWS Secret Access Key is invalid. Please check your credentials.');
    } else if (error.name === 'AccessDenied') {
      console.error('\nAccess denied. Please check IAM permissions.');
    }

    process.exit(1);
  }
}

// Run the test
testConnection();
