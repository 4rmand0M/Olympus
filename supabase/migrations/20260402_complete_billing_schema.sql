
-- Expandiendo el esquema para el Sistema de Facturación OLYMPUS

-- 1. Asegurar tabla de perfiles (Profiles) para Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'facturador',
  sucursal TEXT NOT NULL DEFAULT 'Sede Central',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Tabla de Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  rnc TEXT,
  telefono TEXT,
  email TEXT,
  ciudad TEXT,
  direccion TEXT,
  estado TEXT NOT NULL DEFAULT 'Activo',
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a usuarios autenticados en clientes" ON public.clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Tabla de Productos
CREATE TABLE IF NOT EXISTS public.productos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  categoria TEXT,
  unidad TEXT DEFAULT 'UNIDAD',
  precio DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a usuarios autenticados en productos" ON public.productos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Tabla de Facturas
CREATE TABLE IF NOT EXISTS public.facturas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_factura TEXT NOT NULL UNIQUE,
  tipo_doc TEXT NOT NULL DEFAULT 'FA', -- FA: Factura, PE: Pedido, CO: Cotización
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  impuesto DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  moneda TEXT NOT NULL DEFAULT 'RDS',
  estado TEXT NOT NULL DEFAULT 'Activo', -- Activo, Pendiente, Cancelado
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a usuarios autenticados en facturas" ON public.facturas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Detalles de Factura (Items)
CREATE TABLE IF NOT EXISTS public.factura_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  factura_id UUID NOT NULL REFERENCES public.facturas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES public.productos(id) ON DELETE SET NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.factura_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a usuarios autenticados en factura_items" ON public.factura_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_clientes BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_productos BEFORE UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_facturas BEFORE UPDATE ON public.facturas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
