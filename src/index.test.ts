import { describe, it } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';

// Import schemas for testing
const ListObjectsSchema = z.object({
  bucket: z.string().min(1, 'Bucket name is required'),
  prefix: z.string().optional(),
  maxKeys: z.number().int().positive().max(1000).optional(),
});

const PresignGetSchema = z.object({
  bucket: z.string().min(1, 'Bucket name is required'),
  key: z.string().min(1, 'Object key is required'),
  expiresIn: z.number().int().positive().max(604800).optional().default(3600),
});

const PresignPutSchema = z.object({
  bucket: z.string().min(1, 'Bucket name is required'),
  key: z.string().min(1, 'Object key is required'),
  expiresIn: z.number().int().positive().max(604800).optional().default(3600),
  contentType: z.string().optional(),
});

describe('Input validation schemas', () => {
  describe('ListObjectsSchema', () => {
    it('should validate correct input', () => {
      const result = ListObjectsSchema.safeParse({
        bucket: 'test-bucket',
        prefix: 'test/',
        maxKeys: 100,
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject empty bucket name', () => {
      const result = ListObjectsSchema.safeParse({
        bucket: '',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject maxKeys > 1000', () => {
      const result = ListObjectsSchema.safeParse({
        bucket: 'test-bucket',
        maxKeys: 1001,
      });
      assert.strictEqual(result.success, false);
    });

    it('should allow optional prefix and maxKeys', () => {
      const result = ListObjectsSchema.safeParse({
        bucket: 'test-bucket',
      });
      assert.strictEqual(result.success, true);
    });
  });

  describe('PresignGetSchema', () => {
    it('should validate correct input', () => {
      const result = PresignGetSchema.safeParse({
        bucket: 'test-bucket',
        key: 'test-key',
        expiresIn: 7200,
      });
      assert.strictEqual(result.success, true);
    });

    it('should apply default expiresIn', () => {
      const result = PresignGetSchema.parse({
        bucket: 'test-bucket',
        key: 'test-key',
      });
      assert.strictEqual(result.expiresIn, 3600);
    });

    it('should reject empty bucket', () => {
      const result = PresignGetSchema.safeParse({
        bucket: '',
        key: 'test-key',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject empty key', () => {
      const result = PresignGetSchema.safeParse({
        bucket: 'test-bucket',
        key: '',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject expiresIn > 604800', () => {
      const result = PresignGetSchema.safeParse({
        bucket: 'test-bucket',
        key: 'test-key',
        expiresIn: 604801,
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('PresignPutSchema', () => {
    it('should validate correct input with contentType', () => {
      const result = PresignPutSchema.safeParse({
        bucket: 'test-bucket',
        key: 'test-key',
        expiresIn: 7200,
        contentType: 'application/json',
      });
      assert.strictEqual(result.success, true);
    });

    it('should allow optional contentType', () => {
      const result = PresignPutSchema.safeParse({
        bucket: 'test-bucket',
        key: 'test-key',
      });
      assert.strictEqual(result.success, true);
    });

    it('should apply default expiresIn', () => {
      const result = PresignPutSchema.parse({
        bucket: 'test-bucket',
        key: 'test-key',
      });
      assert.strictEqual(result.expiresIn, 3600);
    });
  });
});
