import { defineData } from '@aws-amplify/backend';
// TODO: Verify correct import path for type/a in Amplify Gen 2
import { type ClientSchema, a } from '@aws-amplify/backend';

/**
 * Amplify Gen 2 data configuration
 * Defines all DynamoDB tables with fields, keys, and GSIs
 *
 * Tables:
 *   1. Users     — user profiles, quota, plan info
 *   2. Sessions  — repo analysis sessions
 *   3. Messages  — chat messages per concept per session
 *   4. Gaps      — knowledge gap tracking per concept
 *   5. Analytics — event tracking
 */

const schema = a.schema({
  // ──────────────────────────────────────────────
  // 1. Users table
  // PK: user_id
  // ──────────────────────────────────────────────
  User: a
    .model({
      user_id: a.id().required(),
      email: a.string().required(),
      name: a.string().required(),
      plan: a.enum(['free', 'pro']),
      quota_used: a.integer().required(),
      quota_limit: a.integer().required(),
      role: a.enum(['student', 'admin']),
      streak_days: a.integer().required(),
      created_at: a.datetime().required(),
      last_active: a.datetime().required(),
    })
    .identifier(['user_id'])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['admins']).to(['read', 'update']),
    ]),

  // ──────────────────────────────────────────────
  // 2. Sessions table
  // PK: session_id
  // GSI: user_id + created_at (list sessions by user)
  // ──────────────────────────────────────────────
  Session: a
    .model({
      session_id: a.id().required(),
      user_id: a.string().required(),
      repo_url: a.string().required(),
      repo_name: a.string().required(),
      status: a.enum(['ingesting', 'indexing', 'analyzing', 'complete', 'failed']),
      s3_prefix: a.string().required(),
      kb_data_source_id: a.string(),
      report: a.json(),
      file_count: a.integer().required(),
      languages: a.string().array(),
      teach_mode_started: a.boolean().required(),
      teach_mode_completed: a.boolean().required(),
      created_at: a.datetime().required(),
      completed_at: a.datetime(),
    })
    .identifier(['session_id'])
    .secondaryIndexes((index) => [
      index('user_id').sortKeys(['created_at']).name('byUserCreated'),
    ])
    .authorization((allow) => [
      allow.owner().identityClaim('sub'),
      allow.groups(['admins']).to(['read']),
    ]),

  // ──────────────────────────────────────────────
  // 3. Messages table
  // PK: message_id
  // GSI: session_id + created_at (list messages in a session)
  // GSI: concept_id + created_at (list messages per concept)
  // ──────────────────────────────────────────────
  Message: a
    .model({
      message_id: a.id().required(),
      session_id: a.string().required(),
      user_id: a.string().required(),
      concept_id: a.string().required(),
      role: a.enum(['user', 'assistant']),
      content: a.string().required(),
      code_reference: a.json(),
      is_hint: a.boolean().required(),
      created_at: a.datetime().required(),
    })
    .identifier(['message_id'])
    .secondaryIndexes((index) => [
      index('session_id').sortKeys(['created_at']).name('bySessionCreated'),
      index('concept_id').sortKeys(['created_at']).name('byConceptCreated'),
    ])
    .authorization((allow) => [
      allow.owner().identityClaim('sub'),
      allow.groups(['admins']).to(['read']),
    ]),

  // ──────────────────────────────────────────────
  // 4. Gaps table
  // PK: gap_id
  // GSI: session_id + order_index (list gaps for a session in order)
  // ──────────────────────────────────────────────
  Gap: a
    .model({
      gap_id: a.id().required(),
      session_id: a.string().required(),
      user_id: a.string().required(),
      concept_name: a.string().required(),
      concept_file: a.string().required(),
      concept_lines: a.integer().array(),
      order_index: a.integer().required(),
      understood: a.boolean().required(),
      score: a.integer(),
      attempts: a.integer().required(),
      started_at: a.datetime(),
      completed_at: a.datetime(),
    })
    .identifier(['gap_id'])
    .secondaryIndexes((index) => [
      index('session_id').sortKeys(['order_index']).name('bySessionOrder'),
    ])
    .authorization((allow) => [
      allow.owner().identityClaim('sub'),
      allow.groups(['admins']).to(['read']),
    ]),

  // ──────────────────────────────────────────────
  // 5. Analytics table
  // PK: event_id
  // GSI: event_type + created_at (query events by type)
  // GSI: user_id + created_at (query events by user)
  // ──────────────────────────────────────────────
  AnalyticsEvent: a
    .model({
      event_id: a.id().required(),
      event_type: a.enum([
        'repo_submitted',
        'report_viewed',
        'teach_started',
        'concept_complete',
        'upgrade_clicked',
        'bug_viewed',
      ]),
      user_id: a.string(),
      session_id: a.string(),
      metadata: a.json(),
      created_at: a.datetime().required(),
    })
    .identifier(['event_id'])
    .secondaryIndexes((index) => [
      index('event_type').sortKeys(['created_at']).name('byEventTypeCreated'),
      index('user_id').sortKeys(['created_at']).name('byUserCreated'),
    ])
    .authorization((allow) => [
      allow.groups(['admins']).to(['read', 'create']),
      allow.authenticated().to(['create']),
    ]),
});

// TODO: Verify ClientSchema export pattern matches Amplify Gen 2 docs
export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
