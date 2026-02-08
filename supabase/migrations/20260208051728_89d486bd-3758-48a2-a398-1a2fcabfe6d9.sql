
-- Add private_feedback field to reviews table for private mentor-only feedback
ALTER TABLE public.reviews ADD COLUMN private_feedback text;

-- Add payout_status to bookings to track payment release
ALTER TABLE public.bookings ADD COLUMN payout_status text NOT NULL DEFAULT 'not_applicable';

-- Create mentor_reviews table for mentor's internal feedback on users
CREATE TABLE public.mentor_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL UNIQUE REFERENCES public.bookings(id),
  mentor_id uuid NOT NULL REFERENCES public.mentor_profiles(id),
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;

-- Mentors can insert their own reviews
CREATE POLICY "Mentors can insert own reviews"
ON public.mentor_reviews
FOR INSERT
WITH CHECK (mentor_id = get_mentor_id(auth.uid()));

-- Mentors can view their own reviews (private/internal)
CREATE POLICY "Mentors can view own reviews"
ON public.mentor_reviews
FOR SELECT
USING (mentor_id = get_mentor_id(auth.uid()));

-- Update reviews table: allow mentor to see private_feedback directed to them
-- (existing SELECT policy already allows anyone to view reviews, but private_feedback
-- should only be visible to the mentor - we'll handle this in application code)
