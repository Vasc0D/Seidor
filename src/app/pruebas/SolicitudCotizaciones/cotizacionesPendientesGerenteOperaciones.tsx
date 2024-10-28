// cotizacionesPendientesGerenteOperaciones.tsx

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import RecursosCotizacion from './atenderCotizacion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [expandedCotizacion, setExpandedCotizacion] = useState<string | null>(null); // ID de la cotización expandida
  const [isLoading, setIsLoading] = useState(true);
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState<Concepto | null>(null);

  // Fetch de las cotizaciones pendientes del gerente logueado
  const fetchCotizacionesPendientes = async () => {
    try {
      const response = await fetch('http://localhost:5015/api/cotizaciones_servicios/pendientes', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCotizaciones(data);

        console.log('Cotizaciones pendientes:', data);
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
    fetchCotizacionesPendientes();
  }, []);

  // Handler para expandir o colapsar una cotización
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

  // Handler para abrir la edición con los recursos cargados
  const handleEditar = async (concepto: Concepto) => {
    try {
      const response = await fetch(`http://localhost:5015/api/cotizaciones_servicios/recursos/${concepto.id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const recursos = await response.json();
        console.log("Recursos: ", recursos);
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
  }
  
  // Actualizar el estado del concepto en el backend
  const actualizarEstadoConcepto = async (conceptoId: string, nuevoEstado: string) => {
    try {
      const response = await fetch(`http://localhost:5015/api/cotizaciones_servicios/conceptos/${conceptoId}/estado`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) {
        alert('Error al actualizar el estado del concepto.');
      }
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
    }
  };

  // Handler para cambiar el estado del concepto
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
    <div>
      <h1 className="text-3xl font-bold mb-6">Cotizaciones Pendientes</h1>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Nombre de la solicitud</th>
            <th className='border border-gray-300 px-4 py-2'>Cliente</th>
            <th className="border border-gray-300 px-4 py-2">Solicitante</th>
            <th className="border border-gray-300 px-4 py-2">Acción</th>
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
                    <Button
                      className="bg-red-500 text-white px-4 py-2 rounded"
                      onClick={() => handleEnviarCotizacion(cotizacion.id)}
                      disabled={!todosConceptosTerminados(cotizacion)}
                    >
                      Enviar Cotización
                    </Button>
                  </td>
                </tr>
                {expandedCotizacion === cotizacion.id && (
                  <tr>
                    <td colSpan={3} className="border border-gray-300 px-4 py-2">
                      <div className="bg-gray-100 p-4 rounded">
                        <table className="w-full">
                          <thead>
                            <tr>
                              <th className="px-4 py-2">Concepto</th>
                              <th className="px-4 py-2">Estado</th>
                              <th className="px-4 py-2">Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cotizacion.conceptos.map((concepto) => (
                              <tr key={concepto.id}>
                                <td className="px-4 py-2">{concepto.nombre_concepto}</td>
                                <td className="px-4 py-2">
                                  <Select
                                    value={concepto.estado}
                                    onValueChange={(nuevoEstado) =>
                                      handleEstadoChange(concepto.id, nuevoEstado)
                                    }
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
                                  <Button className="bg-yellow-500 text-white px-3 py-1 rounded" onClick={() => handleEditar(concepto)}>
                                    Atender/Editar
                                  </Button>
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
              <td className="border border-gray-300 px-4 py-2" colSpan={3}>
                Usted no cuenta con Cotizaciones Pendientes.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CotizacionesPendientes;
