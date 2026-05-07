
-- SCRIPT DE REPARACIÓN DE POLÍTICAS RLS - OLYMPUS BILLING SYSTEM
-- Problema: Las políticas solo permitían acceso a 'authenticated', 
-- pero la app usa el rol 'anon' cuando no hay sesión activa.
-- Solución: Permitir accesso tanto a 'anon' como a 'authenticated'.

-- ========== CLIENTES ==========
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados en clientes" ON public.clientes;
DROP POLICY IF EXISTS "Permitir todo anon en clientes" ON public.clientes;
CREATE POLICY "Permitir todo a usuarios autenticados en clientes" ON public.clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo anon en clientes" ON public.clientes FOR ALL TO anon USING (true) WITH CHECK (true);

-- ========== PRODUCTOS ==========
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados en productos" ON public.productos;
DROP POLICY IF EXISTS "Permitir todo anon en productos" ON public.productos;
CREATE POLICY "Permitir todo a usuarios autenticados en productos" ON public.productos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo anon en productos" ON public.productos FOR ALL TO anon USING (true) WITH CHECK (true);

-- ========== FACTURAS ==========
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados en facturas" ON public.facturas;
DROP POLICY IF EXISTS "Permitir todo anon en facturas" ON public.facturas;
CREATE POLICY "Permitir todo a usuarios autenticados en facturas" ON public.facturas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo anon en facturas" ON public.facturas FOR ALL TO anon USING (true) WITH CHECK (true);

-- ========== FACTURA_ITEMS ==========
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados en factura_items" ON public.factura_items;
DROP POLICY IF EXISTS "Permitir todo anon en factura_items" ON public.factura_items;
CREATE POLICY "Permitir todo a usuarios autenticados en factura_items" ON public.factura_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo anon en factura_items" ON public.factura_items FOR ALL TO anon USING (true) WITH CHECK (true);

-- ========== USUARIOS ==========
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados en usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir todo anon en usuarios" ON public.usuarios;
CREATE POLICY "Permitir todo a usuarios autenticados en usuarios" ON public.usuarios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo anon en usuarios" ON public.usuarios FOR ALL TO anon USING (true) WITH CHECK (true);

-- ========== NOTIFICACIONES ==========
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados en notificaciones" ON public.notificaciones;
DROP POLICY IF EXISTS "Permitir todo anon en notificaciones" ON public.notificaciones;
CREATE POLICY "Permitir todo a usuarios autenticados en notificaciones" ON public.notificaciones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo anon en notificaciones" ON public.notificaciones FOR ALL TO anon USING (true) WITH CHECK (true);

-- ========== ACTIVIDADES ==========
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados en actividades" ON public.actividades;
DROP POLICY IF EXISTS "Permitir todo anon en actividades" ON public.actividades;
CREATE POLICY "Permitir todo a usuarios autenticados en actividades" ON public.actividades FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo anon en actividades" ON public.actividades FOR ALL TO anon USING (true) WITH CHECK (true);

-- ========== PERMISOS DIRECTOS ==========
GRANT ALL ON TABLE public.usuarios TO anon, authenticated;
GRANT ALL ON TABLE public.clientes TO anon, authenticated;
GRANT ALL ON TABLE public.productos TO anon, authenticated;
GRANT ALL ON TABLE public.facturas TO anon, authenticated;
GRANT ALL ON TABLE public.factura_items TO anon, authenticated;
GRANT ALL ON TABLE public.notificaciones TO anon, authenticated;
GRANT ALL ON TABLE public.actividades TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
