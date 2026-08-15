import { useEffect, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Rol } from '../../context/AuthContext';
import type { Usuario } from '../../types/usuario';

const formVacio = { nombre: '', email: '', password: '', rol: 'empleado' as Rol };

export default function Usuarios() {
  const { usuario: yo } = useAuth();
  const puedeEscribir = yo?.rol === 'supervisor' || yo?.rol === 'administrador';

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState(formVacio);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try {
      const { data } = await api.get<Usuario[]>('/usuarios');
      setUsuarios(data);
    } catch {
      setError('No se pudo cargar usuarios');
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleCrear(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await api.post('/usuarios', form);
      setForm(formVacio);
      await cargar();
    } catch (err) {
      setError(isAxiosError(err) ? (err.response?.data?.message ?? 'Error al crear') : 'Error al crear');
    } finally {
      setGuardando(false);
    }
  }

  async function handleRol(id: number, rol: Rol) {
    try {
      await api.patch(`/usuarios/${id}`, { rol });
      await cargar();
    } catch {
      setError('No se pudo actualizar el rol');
    }
  }

  async function handleBaja(id: number) {
    if (!confirm('¿Dar de baja este usuario?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      await cargar();
    } catch {
      setError('No se pudo dar de baja');
    }
  }

  async function handleReactivar(id: number) {
    try {
      await api.patch(`/usuarios/${id}`, { activo: true });
      await cargar();
    } catch {
      setError('No se pudo reactivar');
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className="text-xl font-semibold text-perla-900">Usuarios</h1>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {puedeEscribir && (
        <form onSubmit={handleCrear} className="flex flex-wrap items-end gap-2 rounded-lg border border-perla-200 bg-white p-4">
          <input
            placeholder="Nombre"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="rounded-md border border-perla-300 px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-md border border-perla-300 px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Contraseña (mín. 8)"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-md border border-perla-300 px-3 py-2 text-sm"
          />
          <select
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}
            className="rounded-md border border-perla-300 px-3 py-2 text-sm"
          >
            <option value="empleado">Empleado</option>
            <option value="supervisor">Supervisor</option>
            <option value="administrador">Administrador</option>
          </select>
          <button
            type="submit"
            disabled={guardando}
            className="rounded-md bg-vino-600 px-3 py-2 text-sm font-medium text-white hover:bg-vino-700 disabled:opacity-50"
          >
            {guardando ? 'Guardando…' : 'Crear cuenta'}
          </button>
        </form>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-perla-200 text-left text-perla-500">
            <th className="py-2">Nombre</th>
            <th className="py-2">Email</th>
            <th className="py-2">Rol</th>
            <th className="py-2">Estado</th>
            {puedeEscribir && <th className="py-2" />}
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border-b border-perla-100">
              <td className="py-2">{u.nombre}</td>
              <td className="py-2">{u.email}</td>
              <td className="py-2">
                {puedeEscribir ? (
                  <select
                    value={u.rol}
                    onChange={(e) => handleRol(u.id, e.target.value as Rol)}
                    className="rounded-md border border-perla-300 px-2 py-1 text-sm"
                  >
                    <option value="empleado">Empleado</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="administrador">Administrador</option>
                  </select>
                ) : (
                  u.rol
                )}
              </td>
              <td className="py-2">{u.activo ? 'Activo' : 'Dado de baja'}</td>
              {puedeEscribir && (
                <td className="py-2 text-right">
                  {u.activo ? (
                    <button onClick={() => handleBaja(u.id)} className="text-red-600 hover:underline">
                      Dar de baja
                    </button>
                  ) : (
                    <button onClick={() => handleReactivar(u.id)} className="text-green-700 hover:underline">
                      Reactivar
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
