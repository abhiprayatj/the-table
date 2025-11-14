-- Create learning_interest table
CREATE TABLE IF NOT EXISTS public.learning_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interest TEXT NOT NULL CHECK (char_length(interest) <= 30),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.learning_interest ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can insert, anyone can view
CREATE POLICY "Anyone can view learning interests"
  ON public.learning_interest FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert learning interests"
  ON public.learning_interest FOR INSERT
  WITH CHECK (true);

