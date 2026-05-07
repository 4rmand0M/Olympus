
-- 1. Renombrar tabla profiles a usuarios
ALTER TABLE IF EXISTS public.profiles RENAME TO usuarios;

-- 2. Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  leido BOOLEAN NOT NULL DEFAULT false,
  tipo TEXT DEFAULT 'info', -- info, aviso, exito, error
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a usuarios autenticados en notificaciones" ON public.notificaciones FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Tabla de Actividades (Tareas Recientes)
CREATE TABLE IF NOT EXISTS public.actividades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mensaje TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'sistema', -- factura, cliente, producto, sistema
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a usuarios autenticados en actividades" ON public.actividades FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Actualizar referencias en facturas
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facturas' AND column_name = 'usuario_id') THEN
    -- Ya existe la referencia, pero por si acaso actualizamos el nombre de la FK si es necesario (el renombramiento de tabla suele manejar esto)
  END IF;
END $$;
