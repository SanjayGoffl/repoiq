# RepoIQ Setup Guide

Complete setup instructions for running RepoIQ locally and deploying to production.

---

## Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** 9+ (comes with Node.js)
- **AWS Account** with Bedrock access enabled
- **GitHub Account** (for GitHub API token)
- **Git** installed

---

## 1. Clone & Install

```bash
git clone https://github.com/SanjayGoffl/repoiq.git
cd repoiq
npm install
```

---

## 2. AWS Setup

### 2a. Enable Amazon Bedrock Models

1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock)
2. Navigate to **Model access** in the left sidebar
3. Request access to these models:
   - `us.amazon.nova-pro-v1:0` (primary)
   - `amazon.nova-lite-v1:0` (fallback)
   - `amazon.nova-micro-v1:0` (fallback)
4. Wait for access to be granted (usually instant)

### 2b. Create IAM User

1. Go to [IAM Console](https://console.aws.amazon.com/iam)
2. Create a new user: `repoiq-service`
3. Attach these policies:
   - `AmazonBedrockFullAccess`
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`
4. Create access keys and save them

### 2c. Create DynamoDB Tables

Create these 6 tables in `us-east-1` (or your preferred region):

| Table Name | Partition Key | GSI |
|------------|--------------|-----|
| `RepoIQ_Users` | `user_id` (String) | -- |
| `RepoIQ_Sessions` | `session_id` (String) | `byUserCreated`: user_id (PK) + created_at (SK) |
| `RepoIQ_Messages` | `message_id` (String) | `bySessionCreated`: session_id (PK) + created_at (SK) |
| `RepoIQ_Gaps` | `gap_id` (String) | `bySessionOrder`: session_id (PK) + order_index (SK) |
| `RepoIQ_Analytics` | `event_id` (String) | -- |
| `RepoIQ_UserMemory` | `user_id` (String) | -- |

All tables: **On-demand** capacity mode (no provisioning needed).

### 2d. Create S3 Bucket

```
Bucket name: repoiq-storage
Region: us-east-1
Block all public access: Yes
```

---

## 3. GitHub Token (Optional but Recommended)

Without a token, GitHub API limits you to 60 requests/hour. With a token: 5,000/hour.

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. Create a new token with **Public Repositories (read-only)** access
3. Copy the token

---

## 4. OpenRouter API Key (Optional)

For parallel model inference (speed boost + fallback):

1. Go to [openrouter.ai](https://openrouter.ai)
2. Create a free account
3. Go to **Keys** and create an API key
4. Free models have generous rate limits

---

## 5. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# === REQUIRED ===

# AWS Credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Bedrock Models
BEDROCK_MODEL_ID=us.amazon.nova-pro-v1:0
BEDROCK_FALLBACK_MODEL_ID=amazon.nova-lite-v1:0
BEDROCK_FALLBACK_MODEL_ID_2=amazon.nova-micro-v1:0

# S3
S3_BUCKET_NAME=repoiq-storage
S3_REPO_PREFIX=repos/

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAX_REPO_SIZE_MB=50
NEXT_PUBLIC_FREE_QUOTA=10

# === OPTIONAL (but recommended) ===

# GitHub token for higher API rate limits
GITHUB_TOKEN=ghp_your_token_here

# OpenRouter for parallel inference
openrouter_api_key=sk-or-v1-your_key_here

# Bedrock Knowledge Base (if using RAG)
BEDROCK_KB_ID=
BEDROCK_KB_DATA_SOURCE_ID=
```

---

## 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 7. Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
cd repoiq
vercel login
vercel --prod
```

### Option B: GitHub Integration

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Import the `SanjayGoffl/repoiq` repository
3. Set **Root Directory** to `repoiq` (if repo has a subdirectory structure)
4. Add all environment variables from `.env.local`
5. Deploy

### Required Vercel Environment Variables

Add these in Vercel Dashboard > Project Settings > Environment Variables:

```
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
BEDROCK_MODEL_ID
BEDROCK_FALLBACK_MODEL_ID
BEDROCK_FALLBACK_MODEL_ID_2
S3_BUCKET_NAME
S3_REPO_PREFIX
NEXT_PUBLIC_MAX_REPO_SIZE_MB
NEXT_PUBLIC_FREE_QUOTA
GITHUB_TOKEN
openrouter_api_key
```

---

## 8. Verify Setup

1. Open the app and go to `/analyze`
2. Paste a small public GitHub repo URL (e.g., `https://github.com/vercel/next.js`)
3. You should see:
   - Files being fetched (ingesting status)
   - AI analysis running (analyzing status)
   - Full report with concepts, bugs, architecture

### Common Issues

| Issue | Fix |
|-------|-----|
| `AccessDeniedException` from Bedrock | Enable model access in AWS Bedrock console |
| `ResourceNotFoundException` from DynamoDB | Create the 6 tables listed above |
| `403` from GitHub API | Add `GITHUB_TOKEN` for higher rate limits |
| `Module not found: zustand` | Run `npm install` again |
| Vercel build fails | Ensure Root Directory is set to `repoiq` |

---

## Architecture Overview

```
User -> Next.js Frontend -> API Routes -> AWS Bedrock (AI)
                                       -> OpenRouter (parallel)
                                       -> DynamoDB (storage)
                                       -> GitHub API (files)
                                       -> S3 (file storage)
```

All API routes are serverless functions deployed to Vercel. No servers to manage.
