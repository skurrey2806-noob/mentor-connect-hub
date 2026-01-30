-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'mentor');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled');

-- Create enum for transaction type
CREATE TYPE public.transaction_type AS ENUM ('credit', 'debit', 'withdrawal', 'refund');

-- Create enum for withdrawal status
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Profiles table (basic user info)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Mentor profiles (extended info for mentors)
CREATE TABLE public.mentor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    headline TEXT NOT NULL,
    bio TEXT,
    location TEXT,
    skills TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{"English"}',
    hourly_rate INTEGER NOT NULL DEFAULT 0,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    average_rating NUMERIC(2,1) DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mentor experiences (work history)
CREATE TABLE public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mentor education
CREATE TABLE public.education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT,
    start_year INTEGER,
    end_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mentor achievements
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Categories for mentoring areas
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Many-to-many: Mentor categories
CREATE TABLE public.mentor_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    UNIQUE (mentor_id, category_id)
);

-- Services offered by mentors
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL DEFAULT 30, -- in minutes
    price INTEGER NOT NULL DEFAULT 0, -- in INR
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mentor availability (weekly schedule)
CREATE TABLE public.availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (mentor_id, day_of_week, start_time)
);

-- Bookings
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL DEFAULT 30,
    status booking_status NOT NULL DEFAULT 'pending',
    meeting_link TEXT,
    notes TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Wallets
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    balance INTEGER NOT NULL DEFAULT 0, -- Token balance
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
    type transaction_type NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    reference_id UUID, -- Can reference booking_id or withdrawal_id
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payout methods for mentors
CREATE TABLE public.payout_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    method_type TEXT NOT NULL DEFAULT 'bank', -- 'bank', 'upi'
    account_name TEXT NOT NULL,
    account_number TEXT,
    bank_name TEXT,
    ifsc_code TEXT,
    upi_id TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Withdrawals
CREATE TABLE public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    payout_method_id UUID REFERENCES public.payout_methods(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    status withdrawal_status NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get mentor_id from user_id
CREATE OR REPLACE FUNCTION public.get_mentor_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.mentor_profiles WHERE user_id = _user_id
$$;

-- RLS Policies

-- Profiles: Users can view all profiles, but only update their own
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User roles: Only visible to the user themselves
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mentor profiles: Anyone can view, mentors can update their own
CREATE POLICY "Anyone can view mentor profiles" ON public.mentor_profiles FOR SELECT USING (true);
CREATE POLICY "Mentors can insert own profile" ON public.mentor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Mentors can update own profile" ON public.mentor_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Experiences: Anyone can view, mentors can manage their own
CREATE POLICY "Anyone can view experiences" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Mentors can insert own experiences" ON public.experiences FOR INSERT WITH CHECK (mentor_id = public.get_mentor_id(auth.uid()));
CREATE POLICY "Mentors can update own experiences" ON public.experiences FOR UPDATE USING (mentor_id = public.get_mentor_id(auth.uid()));
CREATE POLICY "Mentors can delete own experiences" ON public.experiences FOR DELETE USING (mentor_id = public.get_mentor_id(auth.uid()));

-- Education: Anyone can view, mentors can manage their own
CREATE POLICY "Anyone can view education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Mentors can insert own education" ON public.education FOR INSERT WITH CHECK (mentor_id = public.get_mentor_id(auth.uid()));
CREATE POLICY "Mentors can update own education" ON public.education FOR UPDATE USING (mentor_id = public.get_mentor_id(auth.uid()));
CREATE POLICY "Mentors can delete own education" ON public.education FOR DELETE USING (mentor_id = public.get_mentor_id(auth.uid()));

-- Achievements: Anyone can view, mentors can manage their own
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Mentors can insert own achievements" ON public.achievements FOR INSERT WITH CHECK (mentor_id = public.get_mentor_id(auth.uid()));
CREATE POLICY "Mentors can update own achievements" ON public.achievements FOR UPDATE USING (mentor_id = public.get_mentor_id(auth.uid()));
CREATE POLICY "Mentors can delete own achievements" ON public.achievements FOR DELETE USING (mentor_id = public.get_mentor_id(auth.uid()));

-- Categories: Anyone can view
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);

-- Mentor categories: Anyone can view, mentors can manage their own
CREATE POLICY "Anyone can view mentor categories" ON public.mentor_categories FOR SELECT USING (true);
CREATE POLICY "Mentors can manage own categories" ON public.mentor_categories FOR ALL USING (mentor_id = public.get_mentor_id(auth.uid()));

-- Services: Anyone can view active, mentors can manage their own
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true OR mentor_id = public.get_mentor_id(auth.uid()));
CREATE POLICY "Mentors can insert own services" ON public.services FOR INSERT WITH CHECK (mentor_id = public.get_mentor_id(auth.uid()));
CREATE POLICY "Mentors can update own services" ON public.services FOR UPDATE USING (mentor_id = public.get_mentor_id(auth.uid()));
CREATE POLICY "Mentors can delete own services" ON public.services FOR DELETE USING (mentor_id = public.get_mentor_id(auth.uid()));

-- Availability: Anyone can view, mentors can manage their own
CREATE POLICY "Anyone can view availability" ON public.availability FOR SELECT USING (true);
CREATE POLICY "Mentors can manage own availability" ON public.availability FOR ALL USING (mentor_id = public.get_mentor_id(auth.uid()));

-- Bookings: Users can see their own, mentors can see theirs
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id OR mentor_id = public.get_mentor_id(auth.uid()));
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users and mentors can update bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id OR mentor_id = public.get_mentor_id(auth.uid()));

-- Reviews: Anyone can view, users can manage their own
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- Wallets: Users can only access their own
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);

-- Transactions: Users can only see their wallet's transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (
  wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (
  wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
);

-- Payout methods: Users can only access their own
CREATE POLICY "Users can view own payout methods" ON public.payout_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payout methods" ON public.payout_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payout methods" ON public.payout_methods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own payout methods" ON public.payout_methods FOR DELETE USING (auth.uid() = user_id);

-- Withdrawals: Users can only access their own
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mentor_profiles_updated_at BEFORE UPDATE ON public.mentor_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payout_methods_updated_at BEFORE UPDATE ON public.payout_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create wallet and profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), NEW.email);
    
    -- Create wallet
    INSERT INTO public.wallets (user_id, balance)
    VALUES (NEW.id, 100); -- Start with 100 tokens
    
    -- Assign default user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO public.categories (name, slug, icon) VALUES
    ('Design', 'design', 'Palette'),
    ('Software Development', 'sde', 'Code'),
    ('Product Management', 'product', 'Package'),
    ('Data Science', 'data-science', 'BarChart'),
    ('Marketing', 'marketing', 'Megaphone'),
    ('Finance', 'finance', 'IndianRupee'),
    ('JEE Preparation', 'jee', 'GraduationCap'),
    ('NEET Preparation', 'neet', 'Stethoscope'),
    ('Career Guidance', 'career', 'Compass'),
    ('Entrepreneurship', 'entrepreneurship', 'Rocket');

-- Function to update mentor's average rating
CREATE OR REPLACE FUNCTION public.update_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.mentor_profiles
    SET average_rating = (
        SELECT COALESCE(AVG(rating)::NUMERIC(2,1), 0)
        FROM public.reviews
        WHERE mentor_id = NEW.mentor_id
    )
    WHERE id = NEW.mentor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER on_review_created
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_mentor_rating();
