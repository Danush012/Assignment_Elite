-- students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  fees_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  card_number TEXT NOT NULL,
  cardholder_name TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cvv TEXT NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- policies for students table
CREATE POLICY "Students can view all student records" 
ON public.students 
FOR SELECT 
USING (true);

CREATE POLICY "Students can update their own record" 
ON public.students 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own record" 
ON public.students 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- policies for payments table
CREATE POLICY "Students can view their own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM students WHERE id = student_id));

CREATE POLICY "Students can insert their own payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM students WHERE id = student_id));

-- function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger for automatic timestamp updates
CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- sample students data
INSERT INTO public.students (name, email, fees_paid) VALUES
('Alice Johnson', 'alice@example.com', false),
('Bob Smith', 'bob@example.com', true),
('Carol Davis', 'carol@example.com', false),
('David Wilson', 'david@example.com', true),
('Eva Brown', 'eva@example.com', false);

-- realtime for students table
ALTER TABLE public.students REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;