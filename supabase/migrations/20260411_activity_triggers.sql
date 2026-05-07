-- Auto-log para facturas
CREATE OR REPLACE FUNCTION log_factura_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.actividades (mensaje, tipo) 
    VALUES ('Factura creada: ' || NEW.numero_factura, 'factura');
    
    INSERT INTO public.notificaciones (titulo, descripcion, tipo)
    VALUES ('Nueva Factura', 'Se ha emitido la factura ' || NEW.numero_factura, 'exito');
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
      INSERT INTO public.actividades (mensaje, tipo) 
      VALUES ('Factura ' || NEW.numero_factura || ' cambio a ' || NEW.estado, 'factura');
      
      INSERT INTO public.notificaciones (titulo, descripcion, tipo)
      VALUES ('Actualización de Factura', 'Factura ' || NEW.numero_factura || ' estado: ' || NEW.estado, 'info');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER factura_activity_trigger
AFTER INSERT OR UPDATE ON public.facturas
FOR EACH ROW EXECUTE FUNCTION log_factura_activity();


-- Auto-log para clientes
CREATE OR REPLACE FUNCTION log_cliente_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.actividades (mensaje, tipo) 
    VALUES ('Nuevo cliente registrado: ' || NEW.nombre, 'cliente');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cliente_activity_trigger
AFTER INSERT ON public.clientes
FOR EACH ROW EXECUTE FUNCTION log_cliente_activity();

-- Auto-log para inventario
CREATE OR REPLACE FUNCTION log_movimiento_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.actividades (mensaje, tipo) 
    VALUES ('Movimiento de ' || NEW.tipo || ' por ' || NEW.cantidad || ' uds.', 'sistema');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER movimiento_activity_trigger
AFTER INSERT ON public.movimientos_inventario
FOR EACH ROW EXECUTE FUNCTION log_movimiento_activity();
