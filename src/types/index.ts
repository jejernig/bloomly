// Core application types for AI-powered Instagram content creation platform

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'professional' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface InstagramAccount {
  id: string;
  userId: string;
  instagramUserId: string;
  username: string;
  accessToken: string;
  expiresAt?: string;
  accountType: 'personal' | 'business' | 'creator';
  isActive: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  canvasData: CanvasState;
  thumbnailUrl?: string;
  templateId?: string;
  isTemplate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  canvasData: CanvasState;
  thumbnailUrl: string;
  isPremium: boolean;
  usageCount: number;
  tags: string[];
  createdAt: string;
}

export type TemplateCategory = 
  | 'product-showcase'
  | 'lifestyle'
  | 'sale-promotion'
  | 'quote-inspiration'
  | 'seasonal'
  | 'brand-story';

// Canvas and Design Types
export interface CanvasState {
  width: number;
  height: number;
  backgroundColor: string;
  objects: CanvasObject[];
  version: string;
}

export interface CanvasObject {
  id: string;
  type: 'text' | 'image' | 'shape' | 'background';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  properties: TextProperties | ImageProperties | ShapeProperties | BackgroundProperties;
}

export interface TextProperties {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  textShadow?: TextShadow;
}

export interface ImageProperties {
  src: string;
  originalSrc: string;
  filters: ImageFilter[];
  crop?: CropData;
  borderRadius: number;
}

export interface ShapeProperties {
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'line';
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius?: number;
}

export interface BackgroundProperties {
  type: 'solid' | 'gradient' | 'image' | 'pattern';
  value: string | GradientData | ImageData | PatternData;
}

export interface TextShadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface ImageFilter {
  type: 'brightness' | 'contrast' | 'saturation' | 'blur' | 'sepia' | 'vintage';
  value: number;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GradientData {
  type: 'linear' | 'radial';
  colors: Array<{ color: string; stop: number }>;
  angle?: number;
}

export interface ImageData {
  src: string;
  repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  size: 'cover' | 'contain' | 'auto';
  position: string;
}

export interface PatternData {
  type: string;
  color: string;
  size: number;
}

// AI Generation Types
export interface AIGeneration {
  id: string;
  userId: string;
  projectId?: string;
  generationType: AIGenerationType;
  prompt: string;
  resultData: any;
  tokensUsed: number;
  processingTimeMs: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export type AIGenerationType = 'text' | 'image' | 'caption' | 'hashtags' | 'style-transfer';

export interface GeneratedText {
  content: string;
  variations: string[];
  metadata: {
    wordCount: number;
    characterCount: number;
    readabilityScore: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  };
}

export interface GeneratedImage {
  url: string;
  variations: string[];
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
    style: string;
  };
}

export interface CaptionContext {
  productType?: string;
  brandVoice: BrandVoice;
  targetAudience: string;
  productFeatures?: string[];
  priceRange?: string;
  season?: string;
  occasion?: string;
}

export type BrandVoice = 'casual' | 'elegant' | 'playful' | 'professional' | 'edgy' | 'minimalist';

// Instagram Integration Types
export interface PublishedPost {
  id: string;
  userId: string;
  projectId: string;
  instagramAccountId: string;
  instagramPostId?: string;
  caption: string;
  hashtags: string[];
  scheduledFor?: string;
  publishedAt?: string;
  status: PostStatus;
  engagementData?: EngagementData;
  createdAt: string;
}

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';

export interface EngagementData {
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  saves: number;
  profileVisits: number;
  websiteClicks: number;
  engagementRate: number;
  lastUpdated: string;
}

// Brand Management Types
export interface BrandKit {
  id: string;
  userId: string;
  name: string;
  colors: BrandColor[];
  fonts: BrandFont[];
  logos: BrandLogo[];
  guidelines: BrandGuidelines;
  createdAt: string;
  updatedAt: string;
}

export interface BrandColor {
  name: string;
  hex: string;
  usage: 'primary' | 'secondary' | 'accent' | 'neutral';
}

export interface BrandFont {
  name: string;
  fontFamily: string;
  weights: string[];
  webFontUrl?: string;
  usage: 'heading' | 'body' | 'accent';
}

export interface BrandLogo {
  name: string;
  url: string;
  type: 'primary' | 'secondary' | 'mark' | 'wordmark';
  backgroundColor?: string;
}

export interface BrandGuidelines {
  voiceAndTone: string;
  keyMessages: string[];
  doNots: string[];
  targetAudience: string;
  brandPersonality: string[];
}

// Usage and Analytics Types
export interface UserUsage {
  id: string;
  userId: string;
  monthYear: string;
  aiGenerationsUsed: number;
  projectsCreated: number;
  postsPublished: number;
  createdAt: string;
}

export interface AnalyticsData {
  period: string;
  totalPosts: number;
  totalEngagement: number;
  averageEngagementRate: number;
  topPerformingPosts: PublishedPost[];
  engagementTrends: EngagementTrend[];
  audienceInsights: AudienceInsights;
}

export interface EngagementTrend {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
}

export interface AudienceInsights {
  totalFollowers: number;
  followerGrowth: number;
  demographics: {
    ageGroups: Array<{ range: string; percentage: number }>;
    genderSplit: Array<{ gender: string; percentage: number }>;
    locations: Array<{ location: string; percentage: number }>;
  };
  activeHours: Array<{ hour: number; activity: number }>;
}

// Mobile and Touch Types
export interface TouchGesture {
  type: 'tap' | 'pinch' | 'pan' | 'rotate' | 'longpress';
  startPosition: Point;
  currentPosition: Point;
  scale?: number;
  rotation?: number;
  velocity?: Point;
}

export interface Point {
  x: number;
  y: number;
}

// Canvas Editor Types
export interface DragPreviewData {
  type: 'text' | 'shape' | 'image';
  content: string;
  style?: Record<string, any>;
}

export interface DragState {
  isDragging: boolean;
  dragType: 'text' | 'shape' | 'image' | null;
  dragData: any;
  dropPosition: Point | null;
}

export interface LayerItem {
  id: string;
  name: string;
  type: 'text' | 'image' | 'shape' | 'background';
  visible: boolean;
  locked: boolean;
  zIndex: number;
  thumbnail?: string;
}

export interface PropertyPanelTab {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType<any>;
}

export interface CanvasSelection {
  objects: CanvasObject[];
  isMultiple: boolean;
  activeObject: CanvasObject | null;
}

export interface CanvasTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  skewY: number;
}

export interface CanvasHistory {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
  maxHistorySize: number;
}

export interface MobileEditorState {
  activePanel: 'sidebar' | 'layers' | 'properties' | null;
  isFullscreen: boolean;
  showQuickActions: boolean;
  bottomNavHeight: number;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: string;
  description: string;
}

// Performance and Optimization Types
export interface PerformanceMetrics {
  canvasLoadTime: number;
  renderTime: number;
  memoryUsage: number;
  deviceProfile: DeviceProfile;
}

export type DeviceProfile = 'high' | 'medium' | 'low';

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  activePanel: 'templates' | 'elements' | 'text' | 'images' | 'ai' | null;
  selectedObjectId: string | null;
  isLoading: boolean;
  error: AppError | null;
  canvasZoom: number;
  canvasPan: Point;
}

// Subscription and Billing Types
export interface Subscription {
  id: string;
  userId: string;
  tier: 'free' | 'professional' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface UsageLimits {
  aiGenerationsPerMonth: number;
  projectsLimit: number;
  templatesAccess: 'basic' | 'premium' | 'all';
  instagramAccountsLimit: number;
  brandKitsLimit: number;
  teamMembersLimit: number;
}

export const SUBSCRIPTION_LIMITS: Record<Subscription['tier'], UsageLimits> = {
  free: {
    aiGenerationsPerMonth: 5,
    projectsLimit: 3,
    templatesAccess: 'basic',
    instagramAccountsLimit: 1,
    brandKitsLimit: 0,
    teamMembersLimit: 1,
  },
  professional: {
    aiGenerationsPerMonth: 100,
    projectsLimit: 50,
    templatesAccess: 'premium',
    instagramAccountsLimit: 3,
    brandKitsLimit: 3,
    teamMembersLimit: 5,
  },
  enterprise: {
    aiGenerationsPerMonth: -1, // unlimited
    projectsLimit: -1, // unlimited
    templatesAccess: 'all',
    instagramAccountsLimit: -1, // unlimited
    brandKitsLimit: -1, // unlimited
    teamMembersLimit: -1, // unlimited
  },
};