export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      configuracion: {
        Row: { id: string; nombre_empresa: string | null; rnc: string | null; direccion: string | null; telefono: string | null; email: string | null; itbis_porcentaje: number; moneda: string; secuencia_factura: number; prefijo_factura: string; updated_at: string }
        Insert: { id?: string; nombre_empresa?: string | null; rnc?: string | null; direccion?: string | null; telefono?: string | null; email?: string | null; itbis_porcentaje?: number; moneda?: string; secuencia_factura?: number; prefijo_factura?: string; updated_at?: string }
        Update: { id?: string; nombre_empresa?: string | null; rnc?: string | null; direccion?: string | null; telefono?: string | null; email?: string | null; itbis_porcentaje?: number; moneda?: string; secuencia_factura?: number; prefijo_factura?: string; updated_at?: string }
      }
      sucursales: {
        Row: { id: string; nombre: string; direccion: string | null; telefono: string | null; estado: string; created_at: string }
        Insert: { id?: string; nombre: string; direccion?: string | null; telefono?: string | null; estado?: string; created_at?: string }
        Update: { id?: string; nombre?: string; direccion?: string | null; telefono?: string | null; estado?: string; created_at?: string }
      }
      usuarios: {
        Row: { id: string; user_id: string; email: string | null; username: string | null; full_name: string; avatar_url: string | null; role: string; sucursal: string | null; sucursal_id: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; email?: string | null; username?: string | null; full_name?: string; avatar_url?: string | null; role?: string; sucursal?: string | null; sucursal_id?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; email?: string | null; username?: string | null; full_name?: string; avatar_url?: string | null; role?: string; sucursal?: string | null; sucursal_id?: string | null; created_at?: string; updated_at?: string }
      }
      clientes: {
        Row: { id: string; nombre: string; rnc: string | null; telefono: string | null; email: string | null; direccion: string | null; ciudad: string | null; balance: number; estado: string; created_at: string; updated_at: string }
        Insert: { id?: string; nombre: string; rnc?: string | null; telefono?: string | null; email?: string | null; direccion?: string | null; ciudad?: string | null; balance?: number; estado?: string; created_at?: string; updated_at?: string }
        Update: { id?: string; nombre?: string; rnc?: string | null; telefono?: string | null; email?: string | null; direccion?: string | null; ciudad?: string | null; balance?: number; estado?: string; created_at?: string; updated_at?: string }
      }
      proveedores: {
        Row: { id: string; nombre: string; rnc: string | null; contacto: string | null; telefono: string | null; email: string | null; balance_cxp: number; created_at: string }
        Insert: { id?: string; nombre: string; rnc?: string | null; contacto?: string | null; telefono?: string | null; email?: string | null; balance_cxp?: number; created_at?: string }
        Update: { id?: string; nombre?: string; rnc?: string | null; contacto?: string | null; telefono?: string | null; email?: string | null; balance_cxp?: number; created_at?: string }
      }
      productos: {
        Row: { id: string; codigo: string; nombre: string; categoria: string | null; unidad: string; precio_compra: number; precio: number; stock: number; min_stock: number; proveedor_id: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; codigo: string; nombre: string; categoria?: string | null; unidad?: string; precio_compra?: number; precio?: number; stock?: number; min_stock?: number; proveedor_id?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; codigo?: string; nombre?: string; categoria?: string | null; unidad?: string; precio_compra?: number; precio?: number; stock?: number; min_stock?: number; proveedor_id?: string | null; created_at?: string; updated_at?: string }
      }
      facturas: {
        Row: { id: string; numero_factura: string; tipo_doc: string; fecha: string; cliente_id: string | null; subtotal: number; itbis: number; impuesto: number; total: number; moneda: string; metodo_pago: string; estado: string; observaciones: string | null; usuario_id: string | null; sucursal_id: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; numero_factura: string; tipo_doc?: string; fecha?: string; cliente_id?: string | null; subtotal?: number; itbis?: number; impuesto?: number; total?: number; moneda?: string; metodo_pago?: string; estado?: string; observaciones?: string | null; usuario_id?: string | null; sucursal_id?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; numero_factura?: string; tipo_doc?: string; fecha?: string; cliente_id?: string | null; subtotal?: number; itbis?: number; impuesto?: number; total?: number; moneda?: string; metodo_pago?: string; estado?: string; observaciones?: string | null; usuario_id?: string | null; sucursal_id?: string | null; created_at?: string; updated_at?: string }
      }
      factura_items: {
        Row: { id: string; factura_id: string; producto_id: string | null; cantidad: number; precio_unitario: number; itbis_aplicado: number; subtotal: number }
        Insert: { id?: string; factura_id: string; producto_id?: string | null; cantidad: number; precio_unitario: number; itbis_aplicado?: number; subtotal: number }
        Update: { id?: string; factura_id?: string; producto_id?: string | null; cantidad?: number; precio_unitario?: number; itbis_aplicado?: number; subtotal?: number }
      }
      cuentas_cobrar: {
        Row: { id: string; cliente_id: string | null; factura_id: string | null; monto_inicial: number; monto_pendiente: number; fecha_vencimiento: string | null; estado: string; created_at: string }
        Insert: { id?: string; cliente_id?: string | null; factura_id?: string | null; monto_inicial: number; monto_pendiente: number; fecha_vencimiento?: string | null; estado?: string; created_at?: string }
        Update: { id?: string; cliente_id?: string | null; factura_id?: string | null; monto_inicial?: number; monto_pendiente?: number; fecha_vencimiento?: string | null; estado?: string; created_at?: string }
      }
      gastos: {
        Row: { id: string; descripcion: string; categoria: string | null; monto: number; fecha: string; proveedor_id: string | null; usuario_id: string | null; created_at: string }
        Insert: { id?: string; descripcion: string; categoria?: string | null; monto: number; fecha?: string; proveedor_id?: string | null; usuario_id?: string | null; created_at?: string }
        Update: { id?: string; descripcion?: string; categoria?: string | null; monto?: number; fecha?: string; proveedor_id?: string | null; usuario_id?: string | null; created_at?: string }
      }
      movimientos_inventario: {
        Row: { id: string; producto_id: string | null; tipo: string; cantidad: number; referencia: string | null; usuario_id: string | null; created_at: string }
        Insert: { id?: string; producto_id?: string | null; tipo: string; cantidad: number; referencia?: string | null; usuario_id?: string | null; created_at?: string }
        Update: { id?: string; producto_id?: string | null; tipo?: string; cantidad?: number; referencia?: string | null; usuario_id?: string | null; created_at?: string }
      }
      notificaciones: {
        Row: { id: string; titulo: string; descripcion: string | null; tipo: string; leido: boolean; created_at: string }
        Insert: { id?: string; titulo: string; descripcion?: string | null; tipo?: string; leido?: boolean; created_at?: string }
        Update: { id?: string; titulo?: string; descripcion?: string | null; tipo?: string; leido?: boolean; created_at?: string }
      }
      actividades: {
        Row: { id: string; mensaje: string; tipo: string; usuario_id: string | null; created_at: string }
        Insert: { id?: string; mensaje: string; tipo?: string; usuario_id?: string | null; created_at?: string }
        Update: { id?: string; mensaje?: string; tipo?: string; usuario_id?: string | null; created_at?: string }
      }
    }
    Enums: {
      app_role: "admin" | "supervisor" | "facturador" | "vendedor" | "almacenista"
    }
  }
}
