import { useEffect, useState } from 'react';
import CrearClienteModal from './CrearClienteModal'; // Importa el modal de creación

interface Cliente {
  id: string;
  nombre: string;
  ruc: string;
  sociedades: number;
  empleados: number;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar los clientes desde el backend
  const fetchClientes = async () => {
    try {
      const response = await fetch('http://localhost:5015/api/clientes', {
        method: 'GET',
        credentials: 'include',  // Esto incluye las cookies para el token
      });

      const data = await response.json();

      if (response.ok) {
        setClientes(data || []);
      } else {
        console.error('Error al cargar clientes:', data.message);
      }
    } catch (error) {
      setError('Error al cargar clientes: ' + error);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  if (loading) {
    return <div>Cargando clientes...</div>;
  }

  if (error) {
    return <div>Error al cargar clientes: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Mis Clientes</h1>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Nombre</th>
            <th className="py-2 px-4 border">RUC</th>
            <th className="py-2 px-4 border">Sociedades</th>
            <th className="py-2 px-4 border">Empleados</th>
          </tr>
        </thead>
        <tbody>
          {clientes && clientes.length > 0 ? (
            clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td className="py-2 px-4 border">{cliente.nombre}</td>
                <td className="py-2 px-4 border">{cliente.ruc}</td>
                <td className="py-2 px-4 border">{cliente.sociedades}</td>
                <td className="py-2 px-4 border">{cliente.empleados}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center py-2 px-4 border">
                No hay clientes disponibles.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Botón para crear cliente */}
      <div className="mt-6 flex flex-col items-end space-y-4">
        <CrearClienteModal onCreate={fetchClientes} /> {/* El callback refresca la lista */}
      </div>

    </div>
  );
};

export default Clientes;