import { useState } from 'react';
import { Search, UserCog } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import { formatDate } from '@/lib/utils';

export const UsuariosModule = () => {
  const [search, setSearch] = useState('');
  const { data: profiles, loading } = useCrud('usuarios');

  const filtered = profiles.filter(u => {
    const searchLower = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(searchLower) || 
      u.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <UserCog size={20} className="text-primary" /> Gestión de Usuarios
          </h2>
          <p className="text-sm text-muted-foreground">Administración de perfiles y roles (Sincronizado con Auth)</p>
        </div>
      </div>

      <div className="erp-card">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o email..." 
              className="erp-input pl-8 w-full" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Total usuarios: {profiles.length}
          </div>
        </div>
        
        <div className="overflow-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
              Sincronizando perfiles...
            </div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Sucursal</th>
                  <th>Rol</th>
                  <th>Registro</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filtered.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-medium">{u.full_name || 'Sin nombre'}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{u.user_id}</span>
                        </div>
                      </td>
                      <td className="text-xs">{u.email || '—'}</td>
                      <td>{u.sucursal || 'Sede Central'}</td>
                      <td>
                        <span className="erp-badge erp-badge-draft uppercase text-[10px]">
                          {u.role || 'facturador'}
                        </span>
                      </td>
                      <td className="text-muted-foreground text-xs">
                        {formatDate(u.created_at)}
                      </td>
                      <td>
                        <span className="erp-badge erp-badge-active">Activo</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
