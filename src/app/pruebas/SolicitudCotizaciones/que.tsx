import { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import RecursosCotizacion from './atenderCotizacion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

interface Concepto {
  id: string;
  nombre_concepto: string;
  estado: string;
  total_venta: number;
  costo_venta: number;
  margen_venta: number;
  porcentaje_margen: number;
  recursos?: RecursoCotizacion[];
}

interface RecursoCotizacion {
  id: string;
  recurso: string;
  tarifa_lista: number;
  tarifa_venta: number;
  preparacion: number;
  bbp: number;
  r_dev: number;
  r_pya: number;
  pi_pya: number;
  pi_deply: number;
  acompanamiento: number;
  total_dias: number;
  total_venta: number;
  costo_venta: number;
  margen_venta: number;
  porcentaje_margen: number;
}

interface Cotizacion {
  id: string;
  nombre_proyecto: string;
  estado: string;
  owner: string;
  cliente: string;
  conceptos: Concepto[];
}

const CotizacionesPendientes = () => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [expandedCotizacion, setExpandedCotizacion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState<Concepto | null>(null);

  // Fetch de las cotizaciones pendientes
  const fetchCotizacionesPendientes = async () => {
    try {
      const response = await fetch('http://localhost:5015/api/cotizaciones_servicios/pendientes', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCotizaciones(data);
      } else {
        console.error('Error al obtener las cotizaciones pendientes.');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCotizacionesPendientes();
  }, []);

  const toggleExpandCotizacion = (cotizacionId: string) => {
    setExpandedCotizacion((prevId) => (prevId === cotizacionId ? null : cotizacionId));
  };

  const handleEnviarCotizacion = async (cotizacionId: string) => {
    try {
      const response = await fetch(`http://localhost:5015/api/cotizaciones_servicios/enviar/${cotizacionId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        alert('Conceptos enviados con éxito.');
        fetchCotizacionesPendientes();
      } else {
        alert('Error al enviar la cotización.');
      }
    } catch (error) {
      console.error('Error al enviar la cotización:', error);
    }
  };

  const handleEditar = async (concepto: Concepto) => {
    try {
      const response = await fetch(`http://localhost:5015/api/cotizaciones_servicios/recursos/${concepto.id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const recursos = await response.json();
        setConceptoSeleccionado({ ...concepto, recursos });
      } else {
        alert('Error al cargar los recursos.');
      }
    } catch (error) {
      console.error('Error al cargar los recursos:', error);
    }
  };

  if (isLoading) {
    return <p>Cargando cotizaciones pendientes...</p>;
  }

  if (conceptoSeleccionado) {
    return (
      <RecursosCotizacion
        concepto={conceptoSeleccionado}
        recursosGuardados={conceptoSeleccionado.recursos || []}
        onClose={() => setConceptoSeleccionado(null)}
        onGuardar={(recursos) => {
          console.log('Recursos guardados:', recursos);
        }}
      />
    );
  }

  const todosConceptosTerminados = (cotizacion: Cotizacion) => {
    return cotizacion.conceptos.every((concepto) => concepto.estado === 'Completado');
  };

  const actualizarEstadoConcepto = async (conceptoId: string, nuevoEstado: string) => {
    try {
      await fetch(`http://localhost:5015/api/cotizaciones_servicios/conceptos/${conceptoId}/estado`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
    }
  };

  const handleEstadoChange = (conceptoId: string, nuevoEstado: string) => {
    const nuevasCotizaciones = cotizaciones.map((cotizacion) => ({
      ...cotizacion,
      conceptos: cotizacion.conceptos.map((concepto) =>
        concepto.id === conceptoId ? { ...concepto, estado: nuevoEstado } : concepto
      ),
    }));
    setCotizaciones(nuevasCotizaciones);
    actualizarEstadoConcepto(conceptoId, nuevoEstado);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-4">Cotizaciones Pendientes</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border-b px-4 py-2 text-left text-sm font-semibold text-gray-600">Nombre de la solicitud</th>
            <th className="border-b px-4 py-2 text-left text-sm font-semibold text-gray-600">Cliente</th>
            <th className="border-b px-4 py-2 text-left text-sm font-semibold text-gray-600">Solicitante</th>
            <th className="border-b px-4 py-2 text-left text-sm font-semibold text-gray-600">Acción</th>
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
                    <Button
                      className="bg-blue-500 text-white px-3 py-1 rounded-full"
                      onClick={() => handleEnviarCotizacion(cotizacion.id)}
                      disabled={!todosConceptosTerminados(cotizacion)}
                    >
                      Enviar Cotización
                    </Button>
                  </td>
                </tr>
                {expandedCotizacion === cotizacion.id && (
                  <tr>
                    <td colSpan={4} className="bg-gray-50 p-4 rounded-lg">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Concepto</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Estado</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cotizacion.conceptos.map((concepto) => (
                            <tr key={concepto.id}>
                              <td className="px-4 py-2 text-gray-800">{concepto.nombre_concepto}</td>
                              <td className="px-4 py-2">
                                <Select
                                  value={concepto.estado}
                                  onValueChange={(nuevoEstado) => handleEstadoChange(concepto.id, nuevoEstado)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un estado" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="En proceso">En proceso</SelectItem>
                                    <SelectItem value="Completado">Completado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-4 py-2">
                                <Button className="bg-yellow-500 text-white px-3 py-1 rounded-full" onClick={() => handleEditar(concepto)}>
                                  Atender/Editar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td className="border-b px-4 py-2 text-center text-gray-600" colSpan={4}>
                No tienes cotizaciones pendientes.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CotizacionesPendientes;
