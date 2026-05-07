import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCrud(table: string, selectQuery: string = '*') {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from(table as any)
      .select(selectQuery)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error(`Error fetching from ${table}:`, error);
      toast.error(`Error cargando ${table}: ${error.message}`);
      setData([]);
    } else {
      setData(rows || []);
    }
    setLoading(false);
  }, [table, selectQuery]);

  useEffect(() => {
    fetch();

    const channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: table },
        () => {
          // On any change on this table, refetch the data
          fetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetch, table]);

  const add = async (item: Record<string, any>) => {
    const { error } = await supabase.from(table as any).insert(item as any);
    if (error) {
      toast.error(`Error al agregar: ${error.message}`);
      throw error;
    }
    toast.success("Agregado correctamente");
  };

  const update = async (id: string, item: Record<string, any>) => {
    const { error } = await supabase.from(table as any).update(item as any).eq("id", id);
    if (error) {
      toast.error(`Error al actualizar: ${error.message}`);
      throw error;
    }
    toast.success("Actualizado correctamente");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) {
      toast.error(`Error al eliminar: ${error.message}`);
      throw error;
    }
    toast.success("Eliminado correctamente");
  };

  return { data, loading, refetch: fetch, add, update, remove };
}
