-- Fix security issues

-- 1. Add RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (
    user_id = auth.uid()
);

-- 2. Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;