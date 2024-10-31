import { useEffect, useState } from 'react';

interface Concepto {
  id: string;
  nombre_concepto: string;
  gerente: string;
  estado: string;
}

interface Cotizacion {
  id: string;
  nombre_proyecto: string;
  cliente: string;
  owner: string;
  estado: string;
  conceptos: Concepto[];
}

const CotizacionesPendientesGeneral = () => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [expandedCotizacion, setExpandedCotizacion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch de las cotizaciones pendientes generales
  const fetchCotizacionesPendientesGeneral = async () => {
    try {
      const response = await fetch('http://localhost:5015/api/cotizaciones_servicios/pendientes_general', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCotizaciones(data);
        console.log('Cotizaciones pendientes generales:', data);
      } else {
        console.error('Error al obtener las cotizaciones pendientes.');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Llamar al fetch al montar el componente
  useEffect(() => {
    fetchCotizacionesPendientesGeneral();
  }, []);

  const toggleExpandCotizacion = (cotizacionId: string) => {
    setExpandedCotizacion((prevId) => (prevId === cotizacionId ? null : cotizacionId));
  };

  if (isLoading) {
    return <p>Cargando cotizaciones pendientes...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Cotizaciones Pendientes</h1>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Nombre de la solicitud</th>
            <th className="border border-gray-300 px-4 py-2">Cliente</th>
            <th className="border border-gray-300 px-4 py-2">Solicitante</th>
            <th className="border border-gray-300 px-4 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {cotizaciones.length > 0 ? (
            cotizaciones.map((cotizacion) => (
              <>
                <tr key={cotizacion.id}>
                  <td className="border border-gray-300 px-4 py-2">
                    <button onClick={() => toggleExpandCotizacion(cotizacion.id)}>
                      {expandedCotizacion === cotizacion.id ? '▼' : '►'}
                    </button>
                    {cotizacion.nombre_proyecto}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{cotizacion.cliente}</td>
                  <td className="border border-gray-300 px-4 py-2">{cotizacion.owner}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded ${
                        cotizacion.estado === 'En proceso'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {cotizacion.estado}
                    </span>
                  </td>
                </tr>
                {expandedCotizacion === cotizacion.id && (
                  <tr>
                    <td colSpan={4} className="border border-gray-300 px-4 py-2">
                      <div className="bg-gray-100 p-4 rounded">
                        <table className="w-full">
                          <thead>
                            <tr>
                              <th className="px-4 py-2">Concepto</th>
                              <th className="px-4 py-2">Gerente</th>
                              <th className="px-4 py-2">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cotizacion.conceptos.map((concepto) => (
                              <tr key={concepto.id}>
                                <td className="px-4 py-2">{concepto.nombre_concepto}</td>
                                <td className="px-4 py-2">{concepto.gerente}</td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`px-2 py-1 rounded ${
                                      concepto.estado === 'En proceso'
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-blue-500 text-white'
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
              </>
            ))
          ) : (
            <tr>
              <td className="border border-gray-300 px-4 py-2" colSpan={4}>
                No hay cotizaciones pendientes.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CotizacionesPendientesGeneral;