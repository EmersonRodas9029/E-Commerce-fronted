import { createContext, useContext, useState, type ReactNode } from 'react';

export type Rol = 'empleado' | 'supervisor' | 'administrador';
export type Usuario = { id: number; nombre: string; email: string; rol: Rol };

type AuthContextValue = {
  usuario: Usuario | null;
  login: (usuario: Usuario, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ponytail: usuario guardado tal cual en localStorage, sin expiración local
// del token — el backend rechaza el JWT vencido y el interceptor de axios
// puede forzar logout en un 401 cuando haga falta.
function usuarioGuardado(): Usuario | null {
  const raw = localStorage.getItem('usuario');
  return raw ? (JSON.parse(raw) as Usuario) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(usuarioGuardado);

  function login(usuario: Usuario, token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    setUsuario(usuario);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
