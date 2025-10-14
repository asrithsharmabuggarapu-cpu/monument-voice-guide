-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create monuments table
CREATE TABLE public.monuments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  historical_info TEXT,
  location TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  audio_telugu_url TEXT,
  audio_hindi_url TEXT,
  audio_english_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create monument_images table for user uploads
CREATE TABLE public.monument_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monument_id UUID REFERENCES public.monuments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recommendations table
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monument_id UUID REFERENCES public.monuments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('nearby_place', 'hotel')),
  name TEXT NOT NULL,
  description TEXT,
  distance TEXT,
  rating DECIMAL(2,1),
  contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  monument_id UUID REFERENCES public.monuments(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monuments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monument_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for monuments (public read, authenticated write)
CREATE POLICY "Anyone can view monuments"
  ON public.monuments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert monuments"
  ON public.monuments FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own monuments"
  ON public.monuments FOR UPDATE
  USING (auth.uid() = created_by);

-- RLS Policies for monument_images
CREATE POLICY "Users can view all monument images"
  ON public.monument_images FOR SELECT
  USING (true);

CREATE POLICY "Users can upload monument images"
  ON public.monument_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
  ON public.monument_images FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for recommendations (public read)
CREATE POLICY "Anyone can view recommendations"
  ON public.recommendations FOR SELECT
  USING (true);

-- RLS Policies for feedback
CREATE POLICY "Users can view all feedback"
  ON public.feedback FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON public.feedback FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
  ON public.feedback FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for monument images
INSERT INTO storage.buckets (id, name, public)
VALUES ('monument-images', 'monument-images', true);

-- Storage policies for monument images
CREATE POLICY "Anyone can view monument images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'monument-images');

CREATE POLICY "Authenticated users can upload monument images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'monument-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own uploads"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'monument-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'monument-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Insert sample monuments
INSERT INTO public.monuments (name, description, historical_info, location, category) VALUES
('Taj Mahal', 'An ivory-white marble mausoleum on the right bank of the river Yamuna', 'Built by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal. Construction began in 1632 and was completed in 1653.', 'Agra, Uttar Pradesh', 'Monument'),
('Charminar', 'A monument and mosque located in Hyderabad', 'Built in 1591 by Muhammad Quli Qutb Shah to commemorate the founding of Hyderabad and the end of a deadly plague.', 'Hyderabad, Telangana', 'Monument'),
('Golconda Fort', 'A historic fort and ruined city', 'Originally known as Mankal, Golconda Fort was built by the Kakatiyas and later enhanced by the Qutb Shahi dynasty in the 16th century.', 'Hyderabad, Telangana', 'Fort'),
('Red Fort', 'A historic fort in the city of Delhi', 'Constructed in 1639 by the fifth Mughal Emperor Shah Jahan as the palace of his fortified capital Shahjahanabad.', 'Delhi', 'Fort'),
('Qutub Minar', 'A minaret and victory tower that forms part of the Qutb complex', 'Built in the early 13th century by Qutb ud-Din Aibak, the first ruler of the Delhi Sultanate.', 'Delhi', 'Monument');

-- Insert sample recommendations
INSERT INTO public.recommendations (monument_id, type, name, description, distance, rating) VALUES
((SELECT id FROM public.monuments WHERE name = 'Taj Mahal' LIMIT 1), 'nearby_place', 'Agra Fort', 'Historic fort and former Mughal residence', '2.5 km', 4.5),
((SELECT id FROM public.monuments WHERE name = 'Taj Mahal' LIMIT 1), 'hotel', 'The Oberoi Amarvilas', 'Luxury hotel with Taj Mahal views', '600 m', 4.8),
((SELECT id FROM public.monuments WHERE name = 'Charminar' LIMIT 1), 'nearby_place', 'Mecca Masjid', 'One of the largest mosques in India', '200 m', 4.3),
((SELECT id FROM public.monuments WHERE name = 'Charminar' LIMIT 1), 'hotel', 'Taj Falaknuma Palace', 'Historic palace hotel', '5 km', 4.7),
((SELECT id FROM public.monuments WHERE name = 'Golconda Fort' LIMIT 1), 'nearby_place', 'Qutb Shahi Tombs', 'Historic royal tombs', '1 km', 4.4),
((SELECT id FROM public.monuments WHERE name = 'Golconda Fort' LIMIT 1), 'hotel', 'ITC Kohenur', 'Luxury business hotel', '8 km', 4.6);