import { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import React from 'react';

interface Concepto {
  id: string;
  nombre_concepto: string;
  estado: string;
}

interface Cotizacion {
  id: string;
  nombre_proyecto: string;
  estado: string;
  owner: string;
  cliente: string;
  conceptos: Concepto[];
}

const HistorialCotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [expandedCotizacion, setExpandedCotizacion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch de las cotizaciones terminadas
  const fetchHistorialCotizaciones = async () => {
    try {
      const response = await fetch('http://localhost:5015/api/cotizaciones_servicios/historial_general', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCotizaciones(data);
        console.log('Historial de cotizaciones:', data);
      } else {
        console.error('Error al obtener el historial de cotizaciones.');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Llamar al fetch al montar el componente
  useEffect(() => {
    fetchHistorialCotizaciones();
  }, []);

  const toggleExpandCotizacion = (cotizacionId: string) => {
    setExpandedCotizacion((prevId) => (prevId === cotizacionId ? null : cotizacionId));
  };

  if (isLoading) {
    return <p className="text-center text-lg font-medium text-gray-600 py-5">Cargando historial de cotizaciones...</p>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-4">Historial de Cotizaciones</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border-b px-4 py-2 text-left text-sm font-semibold text-gray-600">Nombre de la solicitud</th>
            <th className="border-b px-4 py-2 text-left text-sm font-semibold text-gray-600">Cliente</th>
            <th className="border-b px-4 py-2 text-left text-sm font-semibold text-gray-600">Ejecutivo</th>
            <th className="border-b px-4 py-2 text-left text-sm font-semibold text-gray-600">Estado</th>
          </tr>
        </thead>
        <tbody>
          {cotizaciones.length > 0 ? (
            cotizaciones.map((cotizacion) => (
              <React.Fragment key={cotizacion.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="border-b px-4 py-2 flex items-center space-x-2">
                    <button onClick={() => toggleExpandCotizacion(cotizacion.id)} className="text-gray-600 hover:text-gray-900">
                      {expandedCotizacion === cotizacion.id ? <FaChevronDown /> : <FaChevronRight />}
                    </button>
                    <span className="font-medium text-gray-800">{cotizacion.nombre_proyecto}</span>
                  </td>
                  <td className="border-b px-4 py-2 text-gray-700">{cotizacion.cliente}</td>
                  <td className="border-b px-4 py-2 text-gray-700">{cotizacion.owner}</td>
                  <td className="border-b px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        cotizacion.estado === 'En proceso' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {cotizacion.estado}
                    </span>
                  </td>
                </tr>
                {expandedCotizacion === cotizacion.id && (
                  <tr>
                    <td colSpan={4} className="bg-gray-50">
                      <div className="p-4">
                        <h2 className="text-lg font-medium text-gray-700 mb-4">Detalles de Conceptos</h2>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="border-b px-4 py-2 text-left text-sm font-semibold text-gray-600">Concepto</th>
                              <th className="border-b px-4 py-2 text-left text-sm font-semibold text-gray-600">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cotizacion.conceptos.map((concepto) => (
                              <tr key={concepto.id} className="hover:bg-white transition-colors">
                                <td className="px-4 py-2 text-gray-800">{concepto.nombre_concepto}</td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`px-2 py-1 text-xs font-semibold rounded ${
                                      concepto.estado === 'En proceso' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {concepto.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td className="px-4 py-5 text-center text-gray-600" colSpan={4}>
                No hay cotizaciones terminadas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistorialCotizaciones;
