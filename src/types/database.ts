// Custom type definitions for MenTOR platform
// These complement the auto-generated Supabase types

export type UserRole = 'user' | 'mentor';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
export type TransactionType = 'credit' | 'debit' | 'withdrawal' | 'refund';
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface MentorProfile {
  id: string;
  user_id: string;
  headline: string;
  bio?: string;
  location?: string;
  skills: string[];
  languages: string[];
  hourly_rate: number;
  total_sessions: number;
  average_rating: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  mentor_id: string;
  company: string;
  role: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  created_at: string;
}

export interface Education {
  id: string;
  mentor_id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  mentor_id: string;
  title: string;
  description?: string;
  year?: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  created_at: string;
}

export interface Service {
  id: string;
  mentor_id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  mentor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  mentor_id: string;
  service_id?: string;
  scheduled_at: string;
  duration: number;
  status: BookingStatus;
  meeting_link?: string;
  notes?: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  user_id: string;
  mentor_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: TransactionType;
  amount: number;
  description?: string;
  reference_id?: string;
  created_at: string;
}

export interface PayoutMethod {
  id: string;
  user_id: string;
  method_type: string;
  account_name: string;
  account_number?: string;
  bank_name?: string;
  ifsc_code?: string;
  upi_id?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  payout_method_id?: string;
  amount: number;
  status: WithdrawalStatus;
  processed_at?: string;
  created_at: string;
}

// Extended types with relations
export interface MentorWithProfile extends MentorProfile {
  profile: Profile;
  experiences?: Experience[];
  education?: Education[];
  achievements?: Achievement[];
  services?: Service[];
  categories?: Category[];
}

export interface BookingWithDetails extends Booking {
  mentor?: MentorWithProfile;
  service?: Service;
  user?: Profile;
  review?: Review;
}
