import mongoose, { Schema } from 'mongoose';

const defaultSchemaOptions = {
  timestamps: true,
  minimize: false,
  strict: false, // Preserves dynamic nested AI payloads cleanly
};

// 1. Users Collection (Firebase Auth Synchronization)
const userSchema = new Schema(
  {
    id: { type: Schema.Types.Mixed },
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    role: { type: String, default: 'member' },
  },
  defaultSchemaOptions
);

// 1b. Allowed Users Whitelist Collection
const allowedUserSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    role: { type: String, required: true, default: 'member' },
    status: { type: String, required: true, default: 'active' },
    addedAt: { type: Date, default: Date.now },
    addedBy: { type: String },
  },
  defaultSchemaOptions
);

// 2. Accounts Collection
const accountSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.Mixed },
    name: { type: String, required: true },
    website: { type: String, required: true },
    industry: { type: String, required: true },
    country: { type: String, required: true },
    region: { type: String, required: true },
    priority: { type: String, required: true },
    owner: { type: String, required: true },
    researchDepth: { type: String, required: true },
    researchStatus: { type: String, required: true },
    opportunityScore: { type: Number, required: true, default: 0 },
    lastUpdated: { type: String, required: true },
    createdByEmail: { type: String },
    sharedWith: { type: [String], default: [] },
  },
  defaultSchemaOptions
);

// 3. Stakeholders Collection
const stakeholderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.Mixed },
    accountId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    title: { type: String, required: true },
    department: { type: String, required: true },
    linkedIn: { type: String, required: true },
    role: { type: String, required: true },
    influence: { type: String, required: true },
    status: { type: String, required: true },
    email: { type: String },
    company: { type: String },
    notes: { type: String },
    relationshipStatus: { type: String },
    reportsTo: { type: String },
    intelligence: { type: Schema.Types.Mixed },
    lastUpdated: { type: String },
  },
  defaultSchemaOptions
);

// 4. Opportunities Collection
const opportunitySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.Mixed },
    accountId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    service: { type: String, required: true },
    value: { type: String, required: true },
    probability: { type: Number, required: true, default: 0 },
  },
  defaultSchemaOptions
);

// 5. Documents Collection
const documentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.Mixed },
    accountId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    type: { type: String, required: true },
    uploadedAt: { type: String, required: true },
    status: { type: String, required: true },
    extractedText: { type: String },
    aiSummary: { type: String },
    detectedTopics: { type: Schema.Types.Mixed },
    detectedTechnologies: { type: Schema.Types.Mixed },
    detectedBusinessPriorities: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
  },
  defaultSchemaOptions
);

// 6. Templates Collection
const templateSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.Mixed },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
  },
  defaultSchemaOptions
);

// 7. Activities Collection
const activitySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.Mixed },
    timestamp: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    accountId: { type: String, index: true },
    accountName: { type: String },
  },
  defaultSchemaOptions
);

// 8. Settings Collection
const settingSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.Mixed },
    aiProvider: { type: String, required: true },
    geminiApiKey: { type: String, required: true },
    modelSelection: { type: String, required: true },
    defaultResearchDepth: { type: String, required: true },
    theme: { type: String, required: true },
  },
  defaultSchemaOptions
);

// 9. Notifications Collection
const notificationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.Mixed },
    title: { type: String, required: true },
    description: { type: String, required: true },
    read: { type: Boolean, required: true, default: false },
    timestamp: { type: String, required: true },
    type: { type: String, required: true },
    accountId: { type: String, index: true },
    accountName: { type: String },
    recipients: { type: Schema.Types.Mixed },
  },
  defaultSchemaOptions
);

// 10. Custom Researches Collection
const customResearchSchema = new Schema(
  {
    accountId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.Mixed },
    overview: { type: String, required: true },
    techLandscape: { type: Schema.Types.Mixed, required: true },
    strategicPriorities: { type: Schema.Types.Mixed, required: true },
    hiringTrends: { type: Schema.Types.Mixed, required: true },
    latestNews: { type: Schema.Types.Mixed, required: true },
    financialHighlights: { type: Schema.Types.Mixed, required: true },
    challenges: { type: Schema.Types.Mixed, required: true },
    buyingSignals: { type: Schema.Types.Mixed, required: true },
    summary: { type: String, required: true },
  },
  defaultSchemaOptions
);

// 11. Orchestrated Researches Collection
const orchestratedResearchSchema = new Schema(
  {
    accountId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.Mixed },
    pipeline: { type: Schema.Types.Mixed, required: true },
    scoring: { type: Schema.Types.Mixed, required: true },
    coverage: { type: Schema.Types.Mixed, required: true },
    researchQuality: { type: String },
    data: { type: Schema.Types.Mixed, required: true },
  },
  defaultSchemaOptions
);

// 12. Research Evidence Collection
const evidenceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.Mixed },
    accountId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    source: { type: String, required: true },
    sourceType: { type: String, required: true },
    url: { type: String },
    date: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String, required: true },
    confidence: { type: Number, required: true, default: 0 },
    status: { type: String, required: true },
    tags: { type: Schema.Types.Mixed, required: true },
    freshness: { type: String, required: true },
    reliability: { type: String, required: true },
    overallQuality: { type: String, required: true },
  },
  defaultSchemaOptions
);

export const UserModel = (mongoose.models.User || mongoose.model('User', userSchema, 'users')) as mongoose.Model<any>;
export const AllowedUserModel = (mongoose.models.AllowedUser || mongoose.model('AllowedUser', allowedUserSchema, 'allowed_users')) as mongoose.Model<any>;
export const AccountModel = (mongoose.models.Account || mongoose.model('Account', accountSchema, 'accounts')) as mongoose.Model<any>;
export const StakeholderModel = (mongoose.models.Stakeholder || mongoose.model('Stakeholder', stakeholderSchema, 'stakeholders')) as mongoose.Model<any>;
export const OpportunityModel = (mongoose.models.Opportunity || mongoose.model('Opportunity', opportunitySchema, 'opportunities')) as mongoose.Model<any>;
export const DocumentModel = (mongoose.models.Document || mongoose.model('Document', documentSchema, 'documents')) as mongoose.Model<any>;
export const TemplateModel = (mongoose.models.Template || mongoose.model('Template', templateSchema, 'templates')) as mongoose.Model<any>;
export const ActivityModel = (mongoose.models.Activity || mongoose.model('Activity', activitySchema, 'activities')) as mongoose.Model<any>;
export const SettingModel = (mongoose.models.Setting || mongoose.model('Setting', settingSchema, 'settings')) as mongoose.Model<any>;
export const NotificationModel = (mongoose.models.Notification || mongoose.model('Notification', notificationSchema, 'notifications')) as mongoose.Model<any>;
export const CustomResearchModel = (mongoose.models.CustomResearch || mongoose.model('CustomResearch', customResearchSchema, 'custom_researches')) as mongoose.Model<any>;
export const OrchestratedResearchModel = (mongoose.models.OrchestratedResearch || mongoose.model('OrchestratedResearch', orchestratedResearchSchema, 'orchestrated_researches')) as mongoose.Model<any>;
export const EvidenceModel = (mongoose.models.Evidence || mongoose.model('Evidence', evidenceSchema, 'evidence')) as mongoose.Model<any>;
