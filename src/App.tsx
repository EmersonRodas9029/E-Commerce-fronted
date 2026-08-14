import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Nav from './components/Nav';
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Productos from './pages/productos/Productos';
import Inventario from './pages/inventario/Inventario';
import Ventas from './pages/ventas/Ventas';
import Compras from './pages/compras/Compras';
import Alertas from './pages/alertas/Alertas';
import Usuarios from './pages/usuarios/Usuarios';

// ponytail: guard mínimo por sesión (¿hay usuario?), sin lógica de rol
// todavía — permisos por rol se agregan cuando haya una página que los
// necesite de verdad. También envuelve con el nav compartido, ya que
// solo las rutas privadas lo necesitan (login no).
function RutaPrivada({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  return usuario ? <Nav>{children}</Nav> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<RutaPrivada><Dashboard /></RutaPrivada>} />
        <Route path="/productos" element={<RutaPrivada><Productos /></RutaPrivada>} />
        <Route path="/inventario" element={<RutaPrivada><Inventario /></RutaPrivada>} />
        <Route path="/ventas" element={<RutaPrivada><Ventas /></RutaPrivada>} />
        <Route path="/compras" element={<RutaPrivada><Compras /></RutaPrivada>} />
        <Route path="/alertas" element={<RutaPrivada><Alertas /></RutaPrivada>} />
        <Route path="/usuarios" element={<RutaPrivada><Usuarios /></RutaPrivada>} />
      </Routes>
    </BrowserRouter>
  );
}
