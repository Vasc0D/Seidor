// ServiciosTabla.tsx

import { Button } from "@/components/ui/button";
import { useState } from "react";

import { Servicio } from './interfaces'

interface ServiciosTablaProps {
  servicios: Servicio[];
  setServicios: (servicios: Servicio[]) => void;
  onEditar: (servicio: Servicio) => void;  // Callback para manejar la edición
}

const ServiciosTabla: React.FC<ServiciosTablaProps> = ({
  servicios,
  setServicios,
  onEditar,
}) => {
  // Función para eliminar un servicio por su índice
  const handleEliminarServicio = (index: number) => {
    setServicios(servicios.filter((_, i) => i !== index));
  };

  const [desplegados, setDesplegados] = useState<number[]>([]);  // Ítems desplegados (expandidos)

  // Función para manejar el despliegue/colapso
  const toggleDespliegue = (index: number) => {
    setDesplegados(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)  // Si ya está desplegado, lo colapsamos
        : [...prev, index]  // Si no está desplegado, lo expandimos
    );
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Servicios</h3>

      {servicios.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead>
            <tr>
              <th className="border-b py-2 px-4"></th>
              <th className="border-b px-4 py-2">Tipo de Concepto</th>
              <th className="border-b px-4 py-2">Nombre del Proyecto</th>
              <th className="border-b px-4 py-2">Total Venta</th>
              <th className="border-b px-4 py-2">Costo Venta</th>
              <th className="border-b px-4 py-2">Margen Venta</th>
              <th className="border-b px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border text-center">
                  {/* Boton para desplegar */}
                  <button onClick={() => toggleDespliegue(index)}>
                    {desplegados.includes(index) ? '▼' : '▶'}
                  </button>
                </td>
                <td className="border border-gray-300 text-center px-4 py-1">Servicio</td>
                <td className="border border-gray-300 text-center px-4 py-1">{servicio.nombre_proyecto}</td>
                <td className="border border-gray-300 text-center px-4 py-1">{servicio.total_venta}</td>
                <td className="border border-gray-300 text-center px-4 py-1">{servicio.costo_venta}</td>
                <td className="border border-gray-300 text-center px-4 py-1">{servicio.margen_venta}</td>
                <td className="border border-gray-300 text-center px-4 py-1">
                  <Button
                    className="bg-yellow-500 text-white rounded-full px-3 py-1 mr-2"
                    onClick={() => onEditar(servicio)}
                  >
                    Editar
                  </Button>
                  <Button
                    className="bg-red-500 text-white rounded-full px-3 py-1"
                    onClick={() => handleEliminarServicio(index)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-base text-center text-gray-500">No hay servicios registrados</p>
      )}
    </div>
  );
};

export default ServiciosTabla;
