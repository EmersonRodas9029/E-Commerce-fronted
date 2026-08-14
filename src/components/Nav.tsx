import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Rol } from '../context/AuthContext';

const enlaces: { to: string; label: string; roles?: Rol[] }[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/productos', label: 'Productos' },
  { to: '/inventario', label: 'Inventario' },
  { to: '/ventas', label: 'Ventas' },
  { to: '/compras', label: 'Compras' },
  { to: '/alertas', label: 'Alertas' },
  { to: '/usuarios', label: 'Usuarios', roles: ['supervisor', 'administrador'] },
];

export default function Nav({ children }: { children: React.ReactNode }) {
  const { usuario, logout } = useAuth();
  const visibles = enlaces.filter((e) => !e.roles || (usuario && e.roles.includes(usuario.rol)));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex gap-4">
          {visibles.map((e) => (
            <NavLink
              key={e.to}
              to={e.to}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              {e.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{usuario?.nombre} ({usuario?.rol})</span>
          <button onClick={logout} className="text-gray-500 hover:text-gray-700">
            Salir
          </button>
        </div>
      </nav>
      {children}
    </div>
  );
}
