import { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronRight, FaSearch } from 'react-icons/fa';
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
  const [filteredCotizaciones, setFilteredCotizaciones] = useState<Cotizacion[]>([]);
  const [expandedCotizacion, setExpandedCotizacion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState<Concepto | null>(null);
  const [searchCliente, setSearchCliente] = useState('');
  const [searchSolicitante, setSearchSolicitante] = useState('');

  const fetchCotizacionesPendientes = async () => {
    try {
      const response = await fetch(process.env.API_IP + '/api/cotizaciones_servicios/pendientes', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCotizaciones(data);
        setFilteredCotizaciones(data);
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

  const handleSearchChange = () => {
    const filtered = cotizaciones.filter((cotizacion) => 
      cotizacion.cliente.toLowerCase().includes(searchCliente.toLowerCase()) &&
      cotizacion.owner.toLowerCase().includes(searchSolicitante.toLowerCase())
    );
    setFilteredCotizaciones(filtered);
  };

  useEffect(() => {
    handleSearchChange();
  }, [searchCliente, searchSolicitante]);

  const toggleExpandCotizacion = (cotizacionId: string) => {
    setExpandedCotizacion((prevId) => (prevId === cotizacionId ? null : cotizacionId));
  };

  const handleEnviarCotizacion = async (cotizacionId: string) => {
    try {
      const response = await fetch(process.env.API_IP + `/api/cotizaciones_servicios/enviar/${cotizacionId}`, {
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
      const response = await fetch(process.env.API_IP + `/api/cotizaciones_servicios/recursos/${concepto.id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const recursos = await response.json();
        console.log('Recursos:', recursos);
        setConceptoSeleccionado({ ...concepto, recursos });
      } else {
        alert('Error al cargar los recursos.');
      }
    } catch (error) {
      console.error('Error al cargar los recursos:', error);
    }
  };

  if (isLoading) {
    return <p className="text-center text-lg font-medium text-gray-600 py-5">Cargando cotizaciones pendientes...</p>;
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


  const handleEstadoChange = async (conceptoId: string, nuevoEstado: string) => {
    // Encontrar el concepto actual para verificar los recursos
    const concepto = cotizaciones
      .map((cotizacion) => cotizacion.conceptos)
      .flat()
      .find((concepto) => concepto.id === conceptoId);


    console.log('Concept' , concepto);
    // Verificar si el estado nuevo es 'Completado' y si el concepto tiene recursos
    if (nuevoEstado === 'Completado' && concepto?.recursos?.length === 0) {
      alert('No se puede marcar como completado un concepto sin recursos.');
      return;
    }
  
    try {
      // Enviar el nuevo estado al backend
      const response = await fetch(process.env.API_IP + `/api/cotizaciones_servicios/conceptos/${conceptoId}/estado`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
  
      if (response.ok) {
        // Actualizar el estado local solo si la respuesta del backend es exitosa
        const nuevasCotizaciones = cotizaciones.map((cotizacion) => ({
          ...cotizacion,
          conceptos: cotizacion.conceptos.map((concepto) =>
            concepto.id === conceptoId ? { ...concepto, estado: nuevoEstado } : concepto
          ),
        }));
        setCotizaciones(nuevasCotizaciones);

        await fetchCotizacionesPendientes();
      } else {
        alert('Error al actualizar el estado del concepto en el backend.');
      }
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-4">Cotizaciones Pendientes</h1>

      {/* Buscadores de Cliente y Solicitante */}
      <div className="mb-4 flex space-x-4">
        {/* Buscador por Cliente */}
        <div className="flex items-center border rounded px-3 py-2 flex-1">
          <FaSearch className="text-gray-600 mr-2" />
          <input
            type="text"
            value={searchCliente}
            onChange={(e) => setSearchCliente(e.target.value)}
            placeholder="Buscar por Cliente"
            className="px-2 w-full border-none focus:outline-none"
          />
        </div>

        {/* Buscador por Solicitante */}
        <div className="flex items-center border rounded px-3 py-2 flex-1">
          <FaSearch className="text-gray-600 mr-2" />
          <input
            type="text"
            value={searchSolicitante}
            onChange={(e) => setSearchSolicitante(e.target.value)}
            placeholder="Buscar por Solicitante"
            className="px-2 w-full border-none focus:outline-none"
          />
        </div>
      </div>

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
          {filteredCotizaciones.length > 0 ? (
            filteredCotizaciones.map((cotizacion) => (
              <React.Fragment key={cotizacion.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="border-b px-4 py-4 flex items-center space-x-2">
                    <button onClick={() => toggleExpandCotizacion(cotizacion.id)} className="text-gray-600 hover:text-gray-900">
                      {expandedCotizacion === cotizacion.id ? <FaChevronDown /> : <FaChevronRight />}
                    </button>
                    <span className="font-medium text-gray-800">{cotizacion.nombre_proyecto}</span>
                  </td>
                  <td className="border-b px-4 py-2 text-gray-700">{cotizacion.cliente}</td>
                  <td className="border-b px-4 py-2 text-gray-700">{cotizacion.owner}</td>
                  <td className="border-b px-4 py-2">
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
                    <td colSpan={4} className="bg-gray-50">
                      <div className="p-4">
                        <h2 className="text-lg font-medium text-gray-700 mb-4">Detalles de Conceptos</h2>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="border-b px-4 py-2 text-left text-sm font-semibold text-gray-600">Concepto</th>
                              <th className="border-b px-4 py-2 text-left text-sm font-semibold text-gray-600">Estado</th>
                              <th className="border-b px-4 py-2 text-left text-sm font-semibold text-gray-600">Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cotizacion.conceptos.map((concepto) => (
                              <tr key={concepto.id} className="hover:bg-white transition-colors">
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
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td className="px-4 py-5 text-center text-gray-600" colSpan={4}>
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
