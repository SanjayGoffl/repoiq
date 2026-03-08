# RepoIQ Requirements

## System Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| **Node.js** | 18.x | 20.x LTS |
| **npm** | 9.x | 10.x |
| **RAM** | 2 GB | 4 GB |
| **Disk** | 500 MB | 1 GB |
| **OS** | Windows 10+, macOS 12+, Ubuntu 20.04+ | Any modern OS |

---

## AWS Services Required

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Amazon Bedrock** | AI model inference (Nova Pro/Lite/Micro) | Pay per token |
| **Amazon DynamoDB** | Database (6 tables) | 25 GB + 25 WCU/RCU free |
| **Amazon S3** | File storage | 5 GB free for 12 months |
| **AWS IAM** | Access management | Free |
| **AWS Amplify** | Authentication (Cognito) | 50,000 MAU free |

---

## External Services

| Service | Purpose | Required |
|---------|---------|----------|
| **GitHub API** | Fetch repository files | Yes (free, token recommended) |
| **Vercel** | Hosting & deployment | Yes (free tier available) |
| **mermaid.ink** | Diagram rendering | Yes (free, no API key) |

---

## NPM Dependencies

### Production (17 packages)

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^15.1.0 | React framework |
| `react` | ^19.0.0 | UI library |
| `react-dom` | ^19.0.0 | React DOM renderer |
| `typescript` | ^5.7.0 | Type safety |
| `@aws-sdk/client-bedrock-runtime` | ^3.1000.0 | AWS Bedrock AI |
| `@aws-sdk/client-dynamodb` | ^3.1000.0 | DynamoDB client |
| `@aws-sdk/lib-dynamodb` | ^3.1000.0 | DynamoDB document client |
| `@aws-sdk/client-s3` | ^3.1000.0 | S3 client |
| `aws-amplify` | ^6.11.0 | Auth framework |
| `@aws-amplify/ui-react` | ^6.7.0 | Auth UI components |
| `@tanstack/react-query` | ^5.62.0 | Server state management |
| `zustand` | ^5.0.0 | Client state management |
| `framer-motion` | ^11.15.0 | Animations |
| `lucide-react` | ^0.468.0 | Icons |
| `shiki` | ^1.24.0 | Syntax highlighting |
| `sonner` | ^1.7.0 | Toast notifications |
| `date-fns` | ^4.1.0 | Date utilities |

### Radix UI Components (10 packages)

| Package | Purpose |
|---------|---------|
| `@radix-ui/react-accordion` | Expandable sections |
| `@radix-ui/react-avatar` | User avatars |
| `@radix-ui/react-dialog` | Modal dialogs |
| `@radix-ui/react-dropdown-menu` | Dropdown menus |
| `@radix-ui/react-label` | Form labels |
| `@radix-ui/react-progress` | Progress bars |
| `@radix-ui/react-separator` | Visual separators |
| `@radix-ui/react-slot` | Component composition |
| `@radix-ui/react-tabs` | Tab navigation |
| `@radix-ui/react-tooltip` | Tooltips |

### Styling Utilities (4 packages)

| Package | Purpose |
|---------|---------|
| `tailwind-merge` | Merge Tailwind classes |
| `class-variance-authority` | Component variants |
| `clsx` | Conditional classnames |
| `tailwindcss-animate` | Animation utilities |

### Dev Dependencies (7 packages)

| Package | Purpose |
|---------|---------|
| `tailwindcss` | ^3.4.0 |
| `autoprefixer` | ^10.4.0 |
| `postcss` | ^8.4.0 |
| `eslint` | ^9.0.0 |
| `eslint-config-next` | ^15.1.0 |
| `@types/node` | ^22.10.0 |
| `@types/react` | ^19.0.0 |
| `@types/react-dom` | ^19.0.0 |
| `@tailwindcss/typography` | ^0.5.0 |

---

## DynamoDB Table Schemas

### RepoIQ_Sessions
```
session_id       String    (Partition Key)
user_id          String
repo_url         String
repo_name        String
status           String    (ingesting|indexing|analyzing|complete|failed)
report           Map       (full analysis report JSON)
files_data       List      (file contents for code viewer)
languages        List      (detected languages)
file_count       Number
fetch_stats      Map       (GitHub fetch statistics)
created_at       String    (ISO 8601)
completed_at     String    (ISO 8601, nullable)

GSI: byUserCreated (user_id PK, created_at SK)
```

### RepoIQ_Gaps
```
gap_id           String    (Partition Key)
session_id       String
user_id          String
concept_name     String
concept_file     String
concept_lines    List<Number>
order_index      Number
understood       Boolean
score            Number    (nullable)
attempts         Number
started_at       String    (nullable)
completed_at     String    (nullable)

GSI: bySessionOrder (session_id PK, order_index SK)
```

### RepoIQ_Messages
```
message_id       String    (Partition Key)
session_id       String
user_id          String
concept_id       String
role             String    (user|assistant)
content          String
code_reference   Map       (nullable)
is_hint          Boolean
created_at       String

GSI: bySessionCreated (session_id PK, created_at SK)
```

### RepoIQ_UserMemory
```
user_id          String    (Partition Key)
memory_md        String    (Markdown learning profile)
last_updated     String
version          Number
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AWS_REGION` | Yes | `us-east-1` | AWS region |
| `AWS_ACCESS_KEY_ID` | Yes (prod) | -- | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Yes (prod) | -- | AWS secret key |
| `BEDROCK_MODEL_ID` | No | `us.amazon.nova-pro-v1:0` | Primary AI model |
| `BEDROCK_FALLBACK_MODEL_ID` | No | `amazon.nova-lite-v1:0` | Fallback model |
| `BEDROCK_FALLBACK_MODEL_ID_2` | No | `amazon.nova-micro-v1:0` | Second fallback |
| `S3_BUCKET_NAME` | No | `repoiq-storage` | S3 bucket name |
| `S3_REPO_PREFIX` | No | `repos/` | S3 key prefix |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | App URL |
| `NEXT_PUBLIC_MAX_REPO_SIZE_MB` | No | `50` | Max repo size |
| `NEXT_PUBLIC_FREE_QUOTA` | No | `10` | Free tier limit |
| `GITHUB_TOKEN` | No | -- | GitHub PAT for higher rate limits |
| `openrouter_api_key` | No | -- | OpenRouter for parallel inference |

---

## Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Edge | 90+ |

**Required browser APIs**: Fetch, Clipboard, Web Speech (for voice), sessionStorage, localStorage
