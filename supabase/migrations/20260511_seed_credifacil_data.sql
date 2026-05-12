-- ======================================================
-- SEED DATA PARA CREDIFACIL (FINANCIERA) v3.2 - CORREGIDO V4
-- ======================================================

-- 1. CONFIGURACIÓN
INSERT INTO public.configuracion (nombre_empresa, rnc, direccion, telefono, email, itbis_porcentaje, moneda, prefijo_factura)
VALUES ('CREDIFACIL SOLUCIONES FINANCIERAS', '132-88990-1', 'Av. Winston Churchill #123, Santo Domingo', '809-555-0100', 'contacto@credifacil.com.do', 18.00, 'RD$', 'PR-')
ON CONFLICT (id) DO UPDATE SET nombre_empresa = EXCLUDED.nombre_empresa;

-- 2. SUCURSALES
INSERT INTO public.sucursales (id, nombre, direccion, telefono) VALUES
('10000000-0000-0000-0000-000000000001', 'SEDE CENTRAL - PIANTINI', 'Distrito Nacional', '809-555-1001'),
('10000000-0000-0000-0000-000000000002', 'SUCURSAL NORTE - SANTIAGO', 'Av. 27 de Febrero', '809-555-1002'),
('10000000-0000-0000-0000-000000000003', 'SUCURSAL ESTE - BÁVARO', 'Plaza San Juan', '809-555-1003')
ON CONFLICT (id) DO NOTHING;

-- 3. CLIENTES (PRESTATARIOS)
INSERT INTO public.clientes (nombre, rnc, telefono, email, direccion, balance_cxc) VALUES
('Juan Pérez', '001-0000000-1', '809-111-2222', 'juan.perez@email.com', 'Calle A #5, Los Ríos', 45000.00),
('María García', '001-2223333-4', '829-333-4444', 'm.garcia@email.com', 'Av. Independencia #10', 0.00),
('Comercializadora del Sur', '101-55566-7', '809-444-5555', 'ventas@comercialsur.do', 'Villa Juana', 250000.00),
('Pedro Martínez', '001-9988776-5', '849-000-1111', 'pedro@email.com', 'Ensanche Naco', 12500.00),
('Lucía Fernández', '402-1112223-3', '809-888-7777', 'lucia.f@email.com', 'Bella Vista', 0.00);

-- 4. PRODUCTOS (SERVICIOS FINANCIEROS)
-- Sin referencia a proveedores
INSERT INTO public.productos (codigo, nombre, precio, stock) VALUES
('PRE-001', 'Préstamo Personal Consumo', 1.00, 9999),
('PRE-002', 'Préstamo para Vehículos', 1.00, 9999),
('PRE-003', 'Línea de Crédito Comercial', 1.00, 9999),
('SER-004', 'Seguro de Vida (Garantía)', 1200.00, 9999),
('SER-005', 'Gastos Legales y Cierre', 3500.00, 9999),
('PRE-006', 'Préstamo Hipotecario', 1.00, 9999),
('PRE-007', 'Microcrédito Express', 1.00, 9999),
('SER-008', 'Consulta Buró de Crédito', 450.00, 9999)
ON CONFLICT (codigo) DO NOTHING;

-- 5. FACTURAS / TRANSACCIONES
DO $$
DECLARE
    v_cliente_id UUID;
    v_sucursal_id UUID;
    v_factura_id UUID;
    v_prod_prestamo UUID;
    v_prod_seguro UUID;
BEGIN
    SELECT id INTO v_cliente_id FROM public.clientes LIMIT 1;
    SELECT id INTO v_sucursal_id FROM public.sucursales LIMIT 1;
    SELECT id INTO v_prod_prestamo FROM public.productos WHERE codigo = 'PRE-001' LIMIT 1;
    SELECT id INTO v_prod_seguro FROM public.productos WHERE codigo = 'SER-004' LIMIT 1;

    IF v_cliente_id IS NOT NULL AND v_prod_prestamo IS NOT NULL THEN
        -- Transacción 1: Desembolso
        INSERT INTO public.facturas (numero_factura, tipo_doc, fecha, cliente_id, subtotal, impuesto, total, metodo_pago, estado, sucursal_id)
        VALUES ('PR-001', 'FA', CURRENT_DATE - INTERVAL '10 days', v_cliente_id, 46200.00, 216.00, 46416.00, 'Contado', 'Pagada', v_sucursal_id)
        RETURNING id INTO v_factura_id;

        INSERT INTO public.factura_items (factura_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (v_factura_id, v_prod_prestamo, 1, 45000.00, 45000.00);

        INSERT INTO public.factura_items (factura_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (v_factura_id, v_prod_seguro, 1, 1200.00, 1200.00);
    END IF;
END $$;

-- 6. GASTOS OPERATIVOS
-- Sin referencia a proveedores
INSERT INTO public.gastos (descripcion, categoria, monto, fecha) VALUES
('Mantenimiento Buró de Crédito', 'Servicios Externos', 5200.00, CURRENT_DATE - INTERVAL '5 days'),
('Honorarios Legales', 'Legales', 15000.00, CURRENT_DATE - INTERVAL '15 days'),
('Alquiler Oficina Piantini', 'Infraestructura', 45000.00, CURRENT_DATE - INTERVAL '20 days');

-- 7. NOTIFICACIONES
INSERT INTO public.notificaciones (titulo, descripcion, tipo) VALUES
('Cuota Vencida', 'El cliente Juan Pérez tiene 5 días de retraso en su cuota.', 'danger'),
('Solicitud Pendiente', 'Nueva solicitud de préstamo pendiente de aprobación.', 'info');
