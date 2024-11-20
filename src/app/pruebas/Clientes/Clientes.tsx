import { useEffect, useState } from 'react';
import CrearClienteModal from './CrearClienteModal';
import EditarClienteModal from './EditarClienteModal';

interface Cliente {
  id: string;
  nombre: string;
  ruc: string;
  sociedades: number;
  empleados: number;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null); // Cliente para editar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar los clientes desde el backend
  const fetchClientes = async () => {
    try {
      const response = await fetch('http://localhost:5015/api/clientes', {
        method: 'GET',
        credentials: 'include',
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

  // Función para eliminar un cliente
  const eliminarCliente = async (id: string) => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar este cliente?');
    if (!confirmacion) return;

    console.log('Eliminando cliente:', id);

    try {
      const response = await fetch(`http://localhost:5015/api/clientes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('Cliente eliminado correctamente.');
        fetchClientes(); // Refrescar la lista
      } else {
        alert('Error al eliminar cliente.');
      }
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
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
      <h1 className="text-xl font-poppins mb-4">Mis Clientes</h1>

      <div className="overflow-hidden rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase tracking-wider border">Nombre</th>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase tracking-wider border">RUC</th>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase tracking-wider border">Sociedades</th>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase tracking-wider border">Empleados</th>
              <th className="py-3 px-6 text-center text-sm font-semibold uppercase tracking-wider border">Acciones</th>
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
                  <td className="py-2 px-4 border text-center">
                    <button
                      className="bg-yellow-500 text-white px-3 py-2 rounded-full text-sm"
                      onClick={() => setClienteSeleccionado(cliente)} // Selecciona el cliente para editar
                    >
                      Editar
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-2 ml-2 rounded-full text-sm"
                      onClick={() => eliminarCliente(cliente.id)} // Elimina el cliente
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  No hay clientes disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Botones y modales */}
      <div className="mt-6 flex flex-col items-end space-y-4">
        <CrearClienteModal onCreate={fetchClientes} /> {/* Crear cliente */}
        {clienteSeleccionado && (
          <EditarClienteModal
            cliente={clienteSeleccionado}
            onClose={() => setClienteSeleccionado(null)} // Cierra el modal
            onEdit={fetchClientes} // Refresca la lista al guardar
          />
        )}
      </div>
    </div>
  );
};

export default Clientes;
