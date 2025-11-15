-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- This migration enables the vector extension required for embeddings
-- Run this before pushing the schema with drizzle-kit
