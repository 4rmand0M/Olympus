-- Migración para corregir columna itbis faltante y limpiar datos
-- OLYMPUS ERP v3.6

-- 1. Asegurar que la columna itbis exista en la tabla facturas
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='facturas' AND column_name='itbis') THEN
        ALTER TABLE public.facturas ADD COLUMN itbis DECIMAL(12,2) DEFAULT 0;
    END IF;
END $$;

-- 2. Limpiar caracteres extraños en la columna moneda
UPDATE public.facturas SET moneda = 'RD$' WHERE moneda LIKE 'RD%';
UPDATE public.configuracion SET moneda = 'RD$' WHERE moneda LIKE 'RD%';

-- 3. Asegurar que balance sea consistente
UPDATE public.clientes SET balance = 0 WHERE balance IS NULL;

-- 4. Refrescar el caché del esquema para PostgREST
NOTIFY pgrst, 'reload schema';
