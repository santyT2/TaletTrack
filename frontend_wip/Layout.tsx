import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 mb-6">
        <div className="container mx-auto flex gap-4">
          <Link to="/" className="font-bold text-blue-600">Talent Track</Link>
          <Link to="/employees" className="hover:text-blue-500">Empleados</Link>
          <Link to="/attendance" className="hover:text-blue-500">Asistencia</Link>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        {/* Aquí se renderizan las rutas hijas */}
        <Outlet />
      </main>
    </div>
  );
}