
-- 1. Asegurar que la tabla usuarios tenga los campos necesarios
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Corregir la función que sincroniza usuarios de Auth a la tabla pública
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (user_id, full_name, email, role, sucursal)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'facturador'),
    COALESCE(NEW.raw_user_meta_data->>'sucursal', 'Sede Central')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Asegurar que el trigger esté en la tabla correcta y con la función corregida
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Sincronizar usuarios existentes que no estén en la tabla de usuarios
INSERT INTO public.usuarios (user_id, full_name, email, role, sucursal)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', email), 
  email, 
  COALESCE(raw_user_meta_data->>'role', 'facturador'),
  COALESCE(raw_user_meta_data->>'sucursal', 'Sede Central')
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.usuarios);
