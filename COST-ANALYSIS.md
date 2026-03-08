# RepoIQ Cost Analysis & AWS vs Alternatives Comparison

## Executive Summary

RepoIQ is built on a **serverless-first architecture** using AWS managed services, resulting in **zero cost at rest** and pay-per-use scaling. This document compares our AWS stack against alternatives for each service used.

---

## 1. AI Model Inference

### What We Use: Amazon Bedrock (Nova Pro / Lite / Micro)

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Context Window |
|-------|----------------------|------------------------|----------------|
| Amazon Nova Pro | $0.80 | $3.20 | 300K |
| Amazon Nova Lite | $0.06 | $0.24 | 300K |
| Amazon Nova Micro | $0.035 | $0.14 | 128K |

### Alternatives Comparison

| Provider | Model | Input/1M | Output/1M | Verdict |
|----------|-------|----------|-----------|---------|
| **AWS Bedrock (Nova Pro)** | Nova Pro | $0.80 | $3.20 | Best price-performance for our use case |
| Google Vertex AI | Gemini 1.5 Pro | $1.25 | $5.00 | 56% more expensive |
| Azure OpenAI | GPT-4o | $2.50 | $10.00 | 3x more expensive |
| OpenAI Direct | GPT-4o | $2.50 | $10.00 | No enterprise SLA |
| Anthropic Direct | Claude 3.5 Sonnet | $3.00 | $15.00 | 4x more expensive |

### Cost Per Analysis (RepoIQ)

| Operation | Tokens Used | Cost (Nova Pro) | Cost (Nova Lite) |
|-----------|------------|-----------------|------------------|
| Full repo analysis | ~80K in / ~8K out | $0.089 | $0.007 |
| Chat message | ~2K in / ~500 out | $0.003 | $0.0003 |
| Fix suggestion | ~5K in / ~1K out | $0.007 | $0.0006 |
| Quiz generation | ~3K in / ~4K out | $0.015 | $0.001 |
| Diagram generation | ~3K in / ~2K out | $0.009 | $0.0007 |

**Average cost per full user session**: ~$0.12 (Nova Pro) or ~$0.01 (Nova Lite)

---

## 2. Database

### What We Use: Amazon DynamoDB (On-Demand)

| Feature | DynamoDB | MongoDB Atlas | Supabase (Postgres) | Firebase Firestore |
|---------|----------|---------------|--------------------|--------------------|
| **Free Tier** | 25 GB + 25 RCU/WCU | 512 MB | 500 MB | 1 GB |
| **Pricing Model** | Per request | Per cluster | Per compute hour | Per read/write |
| **Read (per 1M)** | $0.25 | ~$0.10/hr (M0) | $0 (included) | $0.06 |
| **Write (per 1M)** | $1.25 | ~$0.10/hr (M0) | $0 (included) | $0.18 |
| **Latency** | <10ms | 10-50ms | 20-100ms | 10-30ms |
| **Auto-scaling** | Yes (instant) | Yes (minutes) | Manual | Yes |
| **Zero cost at rest** | Yes | No ($57/mo min) | No ($25/mo min) | Yes |
| **Serverless** | Native | Atlas Serverless | No | Yes |

**Why DynamoDB wins for RepoIQ**: Zero cost when idle, instant scaling, <10ms reads for real-time chat, native AWS integration with Bedrock.

### RepoIQ DynamoDB Cost Estimate

| Users/Month | Reads/Month | Writes/Month | Monthly Cost |
|-------------|-------------|--------------|-------------|
| 100 | ~500K | ~100K | **$0.25** (free tier covers it) |
| 1,000 | ~5M | ~1M | **$2.50** |
| 10,000 | ~50M | ~10M | **$25.00** |
| 100,000 | ~500M | ~100M | **$250.00** |

---

## 3. File Storage

### What We Use: Amazon S3

| Feature | S3 Standard | Google Cloud Storage | Azure Blob | Cloudflare R2 |
|---------|-------------|---------------------|------------|---------------|
| **Free Tier** | 5 GB (12 mo) | 5 GB | 5 GB (12 mo) | 10 GB forever |
| **Storage/GB/mo** | $0.023 | $0.020 | $0.018 | $0.015 |
| **PUT (per 1K)** | $0.005 | $0.005 | $0.005 | Free |
| **GET (per 1K)** | $0.0004 | $0.0004 | $0.004 | Free |
| **Egress** | $0.09/GB | $0.12/GB | $0.087/GB | Free |

**Why S3 for RepoIQ**: Same AWS VPC as DynamoDB/Bedrock (zero inter-service latency), established tooling, and our storage needs are minimal (~100MB per 1000 analyses).

### RepoIQ S3 Cost Estimate

| Users/Month | Storage | Monthly Cost |
|-------------|---------|-------------|
| 100 | ~10 MB | **$0.00** (free tier) |
| 1,000 | ~100 MB | **$0.01** |
| 10,000 | ~1 GB | **$0.03** |

---

## 4. Authentication

### What We Use: AWS Amplify (Cognito)

| Feature | Cognito | Auth0 | Firebase Auth | Clerk |
|---------|---------|-------|---------------|-------|
| **Free Tier** | 50,000 MAU | 7,500 MAU | Unlimited | 10,000 MAU |
| **Cost After Free** | $0.0055/MAU | $0.07/MAU | $0.01/verify | $0.02/MAU |
| **Social Login** | Yes | Yes | Yes | Yes |
| **MFA** | Free | Paid | Free | Free |
| **Custom Domain** | Yes | Paid | No | Paid |

**Why Cognito**: 50K free MAU is more than enough for a hackathon/MVP. Native AWS integration. Zero additional SDK needed.

---

## 5. Hosting & Deployment

### What We Use: Vercel (Free Tier)

| Feature | Vercel | AWS Amplify Hosting | Netlify | Railway |
|---------|--------|-------------------|---------|---------|
| **Free Tier** | 100 GB BW | 15 GB BW | 100 GB BW | $5 credit |
| **Serverless Functions** | Yes | Yes | Yes | Yes |
| **Edge Functions** | Yes | CloudFront | Yes | No |
| **Build Minutes** | 6000/mo | 1000/mo | 300/mo | Usage-based |
| **Custom Domain** | Free | Free | Free | Free |
| **Git Deploy** | Yes | Yes | Yes | Yes |
| **Price (Pro)** | $20/mo | $12/mo | $19/mo | $5/mo |

**Why Vercel**: Best Next.js support (they built it), generous free tier, instant global CDN, zero-config deployment.

---

## Total Monthly Cost Estimates

### Prototype / Hackathon (< 100 users)

| Service | Monthly Cost |
|---------|-------------|
| AWS Bedrock | ~$5 (50 analyses) |
| DynamoDB | $0 (free tier) |
| S3 | $0 (free tier) |
| Cognito | $0 (free tier) |
| Vercel | $0 (free tier) |
| **Total** | **~$5/month** |

### Pilot (100-1,000 users)

| Service | Monthly Cost |
|---------|-------------|
| AWS Bedrock | ~$50 (500 analyses) |
| DynamoDB | ~$3 |
| S3 | ~$0.01 |
| Cognito | $0 (free tier) |
| Vercel | $0 (free tier) |
| **Total** | **~$53/month** |

### Scale (10,000 users)

| Service | Monthly Cost |
|---------|-------------|
| AWS Bedrock | ~$500 (5,000 analyses) |
| DynamoDB | ~$25 |
| S3 | ~$0.03 |
| Cognito | $0 (free tier) |
| Vercel Pro | $20 |
| **Total** | **~$545/month** |

### Enterprise (100,000 users)

| Service | Monthly Cost |
|---------|-------------|
| AWS Bedrock | ~$5,000 |
| DynamoDB | ~$250 |
| S3 | ~$1 |
| Cognito | ~$275 |
| Vercel Enterprise | ~$100 |
| **Total** | **~$5,626/month** |

---

## Scalability

| Component | Scaling Method | Limit |
|-----------|---------------|-------|
| **Bedrock** | Auto-scales per request | Configurable concurrency quotas |
| **DynamoDB** | On-demand auto-scaling | Virtually unlimited (40K RCU/WCU default) |
| **S3** | Infinite scaling | No practical limit |
| **Cognito** | Auto-scales | Millions of users |
| **Vercel** | Edge + Serverless | Global CDN, auto-scales |
| **GitHub API** | Rate limited | 5,000 req/hr with token |

### Key Scalability Advantages

1. **Zero infrastructure management** -- All services are fully managed
2. **Pay-per-use** -- No idle costs (except Vercel Pro at $20/mo)
3. **No cold starts** -- DynamoDB on-demand has no warm-up
4. **Global edge** -- Vercel CDN serves static assets from nearest PoP
5. **Horizontal scaling** -- Each API route is an independent serverless function

---

## Cost Optimization Strategies

1. **Use Nova Lite for chat/fix/quiz** -- 10x cheaper than Nova Pro
2. **Cache analysis results** -- Same repo URL returns cached report
3. **DynamoDB TTL** -- Auto-delete old sessions after 30 days
4. **S3 Lifecycle** -- Move old files to Glacier after 90 days
5. **Bedrock provisioned throughput** -- Bulk discounts at scale
6. **Reserved capacity** -- DynamoDB reserved capacity saves 50%+ at scale

---

## Revenue Model vs Cost

| Plan | Price | Avg Analyses | Cost per User | Margin |
|------|-------|-------------|---------------|--------|
| **Free** | $0 | 3 | $0.36 | -$0.36 (acquisition) |
| **Pro** | $9.99/mo | 50 | $6.00 | +$3.99 (40% margin) |
| **Enterprise** | Custom | Unlimited | Variable | 60%+ margin |

At **1,000 Pro users**, monthly revenue is $9,990 against ~$6,000 in costs = **$3,990 profit**.

---

*All prices as of March 2026. AWS prices may vary by region. Vercel pricing based on their Hobby/Pro plans.*
