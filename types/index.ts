// ============================================================
// InkQuest - Shared Types
// ============================================================

export type Rarity = 'common' | 'rare' | 'epic';
export type UserRole = 'user' | 'admin';
export type BookingStatus = 'pending' | 'contacted' | 'booked' | 'cancelled';

export interface User {
  id: string;
  email?: string;
  guest_id?: string;
  created_at: string;
  role: UserRole;
}

export interface Tattoo {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  rarity: Rarity;
  base_price?: number;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
}

export interface Location {
  id: string;
  tattoo_id: string;
  lat: number;
  lng: number;
  hint_text?: string;
  qr_uuid: string;
  is_active: boolean;
  created_at: string;
  tattoo?: Tattoo; // joined
}

export interface Scan {
  id: string;
  user_id?: string;
  guest_id?: string;
  location_id: string;
  scanned_at: string;
  is_valid: boolean;
  location?: Location; // joined
}

export interface Reward {
  id: string;
  name: string;
  required_scans: number;
  discount_percentage: number;
  is_active: boolean;
}

export interface Booking {
  id: string;
  user_id: string;
  tattoo_id: string;
  reward_id?: string;
  status: BookingStatus;
  notes?: string;
  created_at: string;
  tattoo?: Tattoo;
  user?: User;
}

// API response types
export interface ScanApiPayload {
  qr_uuid: string;
  user_lat: number;
  user_lng: number;
  user_id?: string;
  guest_id?: string;
}

export interface ScanApiSuccess {
  success: true;
  scan_id: string;
  tattoo: Tattoo;
  location: Location;
  is_duplicate: boolean;
}

export interface ScanApiError {
  success: false;
  error: string;
  code: 'TOO_FAR' | 'NOT_FOUND' | 'DUPLICATE' | 'INVALID' | 'SERVER_ERROR';
  distance_meters?: number;
}

export type ScanApiResponse = ScanApiSuccess | ScanApiError;

export interface AdminStats {
  total_users: number;
  total_scans: number;
  pending_bookings: number;
  recent_bookings: Booking[];
}
