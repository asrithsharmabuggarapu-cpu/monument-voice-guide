-- Add missing translation columns to monuments table
ALTER TABLE public.monuments
ADD COLUMN IF NOT EXISTS model_url TEXT,
ADD COLUMN IF NOT EXISTS description_english TEXT,
ADD COLUMN IF NOT EXISTS description_hindi TEXT,
ADD COLUMN IF NOT EXISTS description_telugu TEXT,
ADD COLUMN IF NOT EXISTS historical_info_english TEXT,
ADD COLUMN IF NOT EXISTS historical_info_hindi TEXT,
ADD COLUMN IF NOT EXISTS historical_info_telugu TEXT;

-- Update existing data to populate new columns with existing data as defaults
UPDATE public.monuments
SET 
  description_english = COALESCE(description_english, description),
  historical_info_english = COALESCE(historical_info_english, historical_info)
WHERE description_english IS NULL OR historical_info_english IS NULL;

-- Create user_roles table for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update monuments RLS policies for admin access
DROP POLICY IF EXISTS "Users can update their own monuments" ON public.monuments;
DROP POLICY IF EXISTS "Authenticated users can insert monuments" ON public.monuments;

CREATE POLICY "Admins can manage all monuments"
ON public.monuments
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert monuments"
ON public.monuments
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update recommendations RLS policies
CREATE POLICY "Admins can manage recommendations"
ON public.recommendations
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert recommendations"
ON public.recommendations
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));