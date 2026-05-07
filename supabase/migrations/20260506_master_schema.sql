
-- ======================================================
-- ESTRUCTURA MAESTRA OLYMPUS ERP v3.3 (SIN RLS)
-- ======================================================

-- 1. TIPOS Y ENUMS
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'supervisor', 'facturador', 'vendedor', 'almacenista');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. CONFIGURACIÓN Y EMPRESA
CREATE TABLE IF NOT EXISTS public.configuracion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_empresa TEXT DEFAULT 'OLYMPUS S.R.L',
  rnc TEXT DEFAULT '130-45678-9',
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  itbis_porcentaje DECIMAL(5,2) DEFAULT 18.00,
  moneda TEXT DEFAULT 'RD$',
  secuencia_factura INTEGER DEFAULT 1,
  prefijo_factura TEXT DEFAULT 'FA-',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. SUCURSALES
CREATE TABLE IF NOT EXISTS public.sucursales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  direccion TEXT,
  telefono TEXT,
  estado TEXT DEFAULT 'Activo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. USUARIOS (PERFILES)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  username TEXT,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role public.app_role NOT NULL DEFAULT 'facturador',
  sucursal TEXT DEFAULT 'Sede Central',
  sucursal_id UUID REFERENCES public.sucursales(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. CLIENTES
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  rnc TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  ciudad TEXT,
  balance DECIMAL(12,2) DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'Activo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. PROVEEDORES
CREATE TABLE IF NOT EXISTS public.proveedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  rnc TEXT,
  contacto TEXT,
  telefono TEXT,
  email TEXT,
  balance_cxp DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. PRODUCTOS E INVENTARIO
CREATE TABLE IF NOT EXISTS public.productos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  categoria TEXT,
  unidad TEXT DEFAULT 'UNIDAD',
  precio_compra DECIMAL(12,2) DEFAULT 0,
  precio DECIMAL(12,2) DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  proveedor_id UUID REFERENCES public.proveedores(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. FACTURACIÓN
CREATE TABLE IF NOT EXISTS public.facturas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_factura TEXT NOT NULL UNIQUE,
  tipo_doc TEXT DEFAULT 'FA', 
  fecha DATE DEFAULT CURRENT_DATE,
  cliente_id UUID REFERENCES public.clientes(id),
  subtotal DECIMAL(12,2) DEFAULT 0,
  itbis DECIMAL(12,2) DEFAULT 0, 
  impuesto DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  moneda TEXT DEFAULT 'RDS', 
  metodo_pago TEXT DEFAULT 'Contado', 
  estado TEXT DEFAULT 'Pagada', 
  observaciones TEXT,
  usuario_id UUID REFERENCES public.usuarios(id),
  sucursal_id UUID REFERENCES public.sucursales(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.factura_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  factura_id UUID REFERENCES public.facturas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES public.productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  itbis_aplicado DECIMAL(12,2) DEFAULT 0,
  subtotal DECIMAL(12,2) NOT NULL
);

-- 9. CUENTAS POR COBRAR (CxC)
CREATE TABLE IF NOT EXISTS public.cuentas_cobrar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id),
  factura_id UUID REFERENCES public.facturas(id),
  monto_inicial DECIMAL(12,2) NOT NULL,
  monto_pendiente DECIMAL(12,2) NOT NULL,
  fecha_vencimiento DATE,
  estado TEXT DEFAULT 'Pendiente', 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. GASTOS
CREATE TABLE IF NOT EXISTS public.gastos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT NOT NULL,
  categoria TEXT, 
  monto DECIMAL(12,2) NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE,
  proveedor_id UUID REFERENCES public.proveedores(id),
  usuario_id UUID REFERENCES public.usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. MOVIMIENTOS DE INVENTARIO
CREATE TABLE IF NOT EXISTS public.movimientos_inventario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID REFERENCES public.productos(id),
  tipo TEXT NOT NULL, 
  cantidad INTEGER NOT NULL,
  referencia TEXT,
  usuario_id UUID REFERENCES public.usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 12. NOTIFICACIONES
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT DEFAULT 'info',
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 13. ACTIVIDADES (AUDITORÍA)
CREATE TABLE IF NOT EXISTS public.actividades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mensaje TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'sistema', 
  usuario_id UUID REFERENCES public.usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 14. SEGURIDAD (RLS DESACTIVADO)
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    LOOP
        -- DESACTIVAR RLS EN TODAS LAS TABLAS PARA EVITAR "PERMISSION DENIED"
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- Otorgar todos los permisos a usuarios autenticados y anónimos
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

-- 15. AUTOMATIZACIÓN (TRIGGERS)

-- Sincronización Auth -> Usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (user_id, email, full_name, role, sucursal)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'facturador'),
    COALESCE(NEW.raw_user_meta_data->>'sucursal', 'Sede Central')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Procesar Factura (CxC y Secuencia)
CREATE OR REPLACE FUNCTION public.procesar_factura_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.metodo_pago = 'Crédito' OR NEW.estado = 'Pendiente' THEN
        INSERT INTO public.cuentas_cobrar (cliente_id, factura_id, monto_inicial, monto_pendiente, fecha_vencimiento)
        VALUES (NEW.cliente_id, NEW.id, NEW.total, NEW.total, CURRENT_DATE + INTERVAL '30 days');
        UPDATE public.clientes SET balance_cxc = balance_cxc + NEW.total WHERE id = NEW.cliente_id;
    END IF;

    UPDATE public.configuracion SET secuencia_factura = secuencia_factura + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_procesar_factura ON public.facturas;
CREATE TRIGGER tr_procesar_factura AFTER INSERT ON public.facturas FOR EACH ROW EXECUTE FUNCTION public.procesar_factura_trigger();

-- Procesar Items (Stock)
CREATE OR REPLACE FUNCTION public.procesar_items_factura()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.productos SET stock = stock - NEW.cantidad WHERE id = NEW.producto_id;
    INSERT INTO public.movimientos_inventario (producto_id, tipo, cantidad, referencia)
    VALUES (NEW.producto_id, 'Salida', NEW.cantidad, 'Factura ID: ' || NEW.factura_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_procesar_items_factura ON public.factura_items;
CREATE TRIGGER tr_procesar_items_factura AFTER INSERT ON public.factura_items FOR EACH ROW EXECUTE FUNCTION public.procesar_items_factura();
