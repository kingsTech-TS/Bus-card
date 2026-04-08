// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  role: "admin" | "user";
  is_active: boolean;
  created_at: string;
  avatar_url?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string; // Mapped from email input for OAuth2 backend compatibility
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}

export interface ChangeUsernameRequest {
  new_username: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// ─── Design / Cards ──────────────────────────────────────────────────────────

export type ElementType = "text" | "image" | "shape" | "qr";

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  zIndex?: number;
}

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  fontSize: number;
  fontFamily: string;
  fontStyle?: string;
  fontWeight?: string;
  fill: string;
  textAlign?: "left" | "center" | "right";
}

export interface ImageElement extends BaseElement {
  type: "image";
  url: string;
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  shapeType: "rect" | "circle" | "line";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface QRElement extends BaseElement {
  type: "qr";
  value: string;
  foreground?: string;
  background?: string;
}

export type DesignElement = TextElement | ImageElement | ShapeElement | QRElement;

export interface DesignSchema {
  width: number;
  height: number;
  dpi?: number;
  background?: string;
  elements: DesignElement[];
}

export interface Card {
  id: string;
  title: string;
  design: DesignSchema;
  owner_id: string;
  template_id?: string;
  created_at: string;
  updated_at: string;
  views?: number;
  downloads?: number;
}

export interface CardCreate {
  title: string;
  design: DesignSchema;
  template_id?: string;
}

export interface CardUpdate {
  title?: string;
  design?: DesignSchema;
}

// ─── Templates ───────────────────────────────────────────────────────────────

export interface Template {
  id: string;
  title: string;
  category?: string;
  tags?: string[];
  design: DesignSchema;
  thumbnail_url?: string;
  created_at: string;
}

// ─── Brand Kit ───────────────────────────────────────────────────────────────

export interface BrandColor {
  name: string;
  hex: string;
}

export interface BrandKit {
  id: string;
  name: string;
  colors: BrandColor[];
  fonts: string[];
  logo_url?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface BrandKitCreate {
  name: string;
  colors: BrandColor[];
  fonts: string[];
  logo_url?: string;
}

// ─── Assets ──────────────────────────────────────────────────────────────────

export interface Asset {
  id: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  owner_id: string;
  created_at: string;
}

// ─── Export ──────────────────────────────────────────────────────────────────

export type ExportFormat = "png" | "pdf";

export interface ExportTask {
  task_id: string;
  status: "pending" | "processing" | "done" | "failed";
  download_url?: string;
  error?: string;
}

export interface VCardData {
  vcard_string: string;
  qr_data_url?: string;
}

// ─── AI ──────────────────────────────────────────────────────────────────────

export interface AISuggestRequest {
  industry: string;
  name: string;
  style?: string;
}

export interface AITaglineRequest {
  name: string;
  industry: string;
}

export interface AIImproveTextRequest {
  text: string;
  tone?: string;
}

export interface AIDesignSuggestion {
  design: DesignSchema;
  description?: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface CardAnalytics {
  card_id: string;
  views: number;
  downloads: number;
  qr_scans: number;
  view_history: { date: string; count: number }[];
  download_history: { date: string; count: number }[];
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminUser extends User {
  card_count: number;
  last_login?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  created_at: string;
  username?: string;
  user?: string;
}

export interface AdminStats {
  total_users: number;
  total_cards: number;
  total_views: number;
  total_downloads: number;
  new_users_today: number;
  new_cards_today: number;
}

// ─── API Response ────────────────────────────────────────────────────────────

export interface APIError {
  detail: string | { msg: string; type: string }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
