import { integer, pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

// 1. Users table (Firebase Auth Synchronization)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').default('member'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 1b. Allowed Users Whitelist table for Access Control
export const allowedUsers = pgTable('allowed_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').notNull().default('member'), // 'admin' | 'member'
  status: text('status').notNull().default('active'), // 'active' | 'suspended'
  addedAt: timestamp('added_at').defaultNow(),
  addedBy: text('added_by'),
});

// 2. Accounts table
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(), // e.g., acc_microsoft_1234
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  website: text('website').notNull(),
  industry: text('industry').notNull(),
  country: text('country').notNull(),
  region: text('region').notNull(),
  priority: text('priority').notNull(), // 'Low' | 'Medium' | 'High'
  owner: text('owner').notNull(),
  researchDepth: text('research_depth').notNull(), // 'Basic' | 'Standard' | 'Deep'
  researchStatus: text('research_status').notNull(), // 'Not Started' | 'In Progress' | 'Completed'
  opportunityScore: integer('opportunity_score').notNull().default(0),
  lastUpdated: text('last_updated').notNull(),
  createdByEmail: text('created_by_email'),
  sharedWith: jsonb('shared_with'), // Array of email strings, e.g. ["ketan.g@intellifysolutions.com"]
});

// 3. Stakeholders table
export const stakeholders = pgTable('stakeholders', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  title: text('title').notNull(),
  department: text('department').notNull(),
  linkedIn: text('linkedin').notNull(),
  role: text('role').notNull(), // 'Decision Maker' | 'Influencer' | 'Gatekeeper' | 'Champion' | 'End User'
  influence: text('influence').notNull(), // 'Low' | 'Medium' | 'High'
  status: text('status').notNull(), // 'Active' | 'Contacted' | 'Engaged' | 'No Contact'
  email: text('email'),
  company: text('company'),
  notes: text('notes'),
  relationshipStatus: text('relationship_status'), // 'Champion' | 'Warm' | 'Cold' | 'Unknown'
  reportsTo: text('reports_to'),
  intelligence: jsonb('intelligence'), // Nested StakeholderIntelligence object
  lastUpdated: text('last_updated'),
});

// 4. Opportunities table
export const opportunities = pgTable('opportunities', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  service: text('service').notNull(),
  value: text('value').notNull(),
  probability: integer('probability').notNull().default(0),
});

// 5. Documents table
export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  size: text('size').notNull(),
  type: text('type').notNull(),
  uploadedAt: text('uploaded_at').notNull(),
  status: text('status').notNull(), // 'Uploading' | 'Queued' | 'Processing' | 'Completed' | 'Failed'
  extractedText: text('extracted_text'),
  aiSummary: text('ai_summary'),
  detectedTopics: jsonb('detected_topics'),
  detectedTechnologies: jsonb('detected_technologies'),
  detectedBusinessPriorities: jsonb('detected_business_priorities'),
  metadata: jsonb('metadata'),
});

// 6. Templates table
export const templates = pgTable('templates', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'Email' | 'Workshop' | 'Meeting' | 'Prompt'
  description: text('description').notNull(),
  content: text('content').notNull(),
});

// 7. Activities table
export const activities = pgTable('activities', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  timestamp: text('timestamp').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull(),
  accountId: text('account_id'),
  accountName: text('account_name'),
});

// 8. Settings table
export const settings = pgTable('settings', {
  id: text('id').primaryKey(), // usually 'global' or user UID
  userId: integer('user_id').references(() => users.id),
  aiProvider: text('ai_provider').notNull(), // 'Gemini' | 'OpenAI' | 'Claude'
  geminiApiKey: text('gemini_api_key').notNull(),
  modelSelection: text('model_selection').notNull(),
  defaultResearchDepth: text('default_research_depth').notNull(),
  theme: text('theme').notNull(),
});

// 9. Notifications table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  read: boolean('read').notNull().default(false),
  timestamp: text('timestamp').notNull(),
  type: text('type').notNull(), // 'info' | 'success' | 'warning' | 'error' | 'signal' | 'research'
  accountId: text('account_id'),
  accountName: text('account_name'),
  recipients: jsonb('recipients'),
});

// 10. Custom Researches table (Legacy / Individual research details)
export const customResearches = pgTable('custom_researches', {
  accountId: text('account_id').primaryKey().references(() => accounts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id),
  overview: text('overview').notNull(),
  techLandscape: jsonb('tech_landscape').notNull(),
  strategicPriorities: jsonb('strategic_priorities').notNull(),
  hiringTrends: jsonb('hiring_trends').notNull(),
  latestNews: jsonb('latest_news').notNull(),
  financialHighlights: jsonb('financial_highlights').notNull(),
  challenges: jsonb('challenges').notNull(),
  buyingSignals: jsonb('buying_signals').notNull(),
  summary: text('summary').notNull(),
});

// 11. Orchestrated Researches table (Latest live researched data)
export const orchestratedResearches = pgTable('orchestrated_researches', {
  accountId: text('account_id').primaryKey().references(() => accounts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id),
  pipeline: jsonb('pipeline').notNull(),
  scoring: jsonb('scoring').notNull(),
  coverage: jsonb('coverage').notNull(),
  researchQuality: text('research_quality'), // 'A+' | 'A' | 'B' | 'C' | 'D'
  data: jsonb('data').notNull(),
});

// 12. Research Evidence table
export const evidence = pgTable('evidence', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  source: text('source').notNull(),
  sourceType: text('source_type').notNull(), // 'Website' | 'Annual Report' | etc.
  url: text('url'),
  date: text('date').notNull(),
  category: text('category').notNull(),
  content: text('content').notNull(),
  summary: text('summary').notNull(),
  confidence: integer('confidence').notNull().default(0),
  status: text('status').notNull(),
  tags: jsonb('tags').notNull(),
  freshness: text('freshness').notNull(),
  reliability: text('reliability').notNull(),
  overallQuality: text('overall_quality').notNull(),
});
