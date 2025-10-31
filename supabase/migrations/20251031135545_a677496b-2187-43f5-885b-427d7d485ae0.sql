-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'participant');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (false); -- Will be managed by admin functions only

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (false); -- Will be managed by admin functions only

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
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

-- Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 
  CASE 
    WHEN role = 'admin' THEN 'admin'::app_role
    WHEN role = 'moderator' THEN 'moderator'::app_role
    ELSE 'participant'::app_role
  END
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Update RLS policies that reference profiles.role to use has_role function
DROP POLICY IF EXISTS "Admins can update applications" ON public.host_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.host_applications;

CREATE POLICY "Admins can view all applications"
  ON public.host_applications
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') 
    OR auth.uid() = user_id
  );

CREATE POLICY "Admins can update applications"
  ON public.host_applications
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Remove role column from profiles table
ALTER TABLE public.profiles DROP COLUMN role;

-- Create function to grant admin role (for manual use)
CREATE OR REPLACE FUNCTION public.grant_admin_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;