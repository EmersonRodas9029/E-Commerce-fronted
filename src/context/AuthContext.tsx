import { createContext, useContext, useState, type ReactNode } from 'react';

type Rol = 'EMPLEADO' | 'SUPERVISOR' | 'ADMINISTRADOR';
type Usuario = { id: string; nombre: string; rol: Rol } | null;

type AuthContextValue = {
  usuario: Usuario;
  setUsuario: (u: Usuario) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario>(null);
  return (
    <AuthContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
