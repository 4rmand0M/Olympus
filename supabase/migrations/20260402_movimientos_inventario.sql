
-- Tabla para Movimientos de Inventario (entradas y salidas)
CREATE TABLE IF NOT EXISTS public.movimientos_inventario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID REFERENCES public.productos(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL DEFAULT 'Entrada', -- Entrada, Salida
  cantidad INTEGER NOT NULL DEFAULT 0,
  referencia TEXT, -- Número de factura, compra, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.movimientos_inventario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a autenticados en movimientos_inventario" ON public.movimientos_inventario FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo anon en movimientos_inventario" ON public.movimientos_inventario FOR ALL TO anon USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.movimientos_inventario TO anon, authenticated;
