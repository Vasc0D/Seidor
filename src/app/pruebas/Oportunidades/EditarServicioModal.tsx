// EditarServicioModal.tsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Servicio, Concepto, RecursoCotizacion } from "./interfaces";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EditarRecursosModal from "./EditarConceptoModal";

interface EditarServicioModalProps {
  servicio: Servicio;
  isOpen: boolean;
  onGuardar: (servicioEditado: Servicio) => void;
  onCancelar: () => void;
}

const EditarServicioModal: React.FC<EditarServicioModalProps> = ({
  servicio,
  isOpen,
  onGuardar,
  onCancelar,
}) => {
  const [nombreProyecto, setNombreProyecto] = useState(servicio.nombre_proyecto);
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState<Concepto | null>(null);
  const [ conceptos, setConceptos ] = useState<Concepto[]>(servicio.conceptos);
  const [isRecursosModalOpen, setIsRecursosModalOpen] = useState(false);
  
  const handleAbrirRecursosModal = (concepto: Concepto) => {
    setConceptoSeleccionado(concepto); // Guardamos el concepto seleccionado
    setIsRecursosModalOpen(true); // Abrimos el modal
  };
  
  const handleGuardarRecursos = (recursosEditados: RecursoCotizacion[]) => {
    // Actualizar los recursos del concepto seleccionado
    if (conceptoSeleccionado) {
      const nuevosConceptos = servicio.conceptos.map((concepto) =>
        concepto.id === conceptoSeleccionado.id
          ? { ...concepto, recursos: recursosEditados }
          : concepto
      );
      onGuardar({ ...servicio, conceptos: nuevosConceptos });
    }
    setIsRecursosModalOpen(false);
  };

  // Guardar los cambios y enviar los datos
  const handleGuardar = () => {
    const totalVenta = conceptos.reduce((acc, concepto) => acc + concepto.total_venta, 0);
    const costoVenta = conceptos.reduce((acc, concepto) => acc + concepto.costo_venta, 0);
    const margenVenta = totalVenta - costoVenta;

    const servicioEditado: Servicio = {
      ...servicio,
      nombre_proyecto: nombreProyecto,
      conceptos,
      total_venta: totalVenta,
      costo_venta: costoVenta,
      margen_venta: margenVenta,
    };

    onGuardar(servicioEditado);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancelar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Servicio</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Nombre del Proyecto</label>
            <Input
              value={nombreProyecto}
              onChange={(e) => setNombreProyecto(e.target.value)}
              className="w-full"
            />
          </div>

          <table className="min-w-full bg-white border border-gray-200 text-sm mb-6">
            <thead>
              <tr>
                <th className="border-b px-4 py-2 text-left">Conceptos</th>
                <th className="border-b px-4 py-2 text-right">Total Venta</th>
                <th className="border-b px-4 py-2 text-right">Costo Venta</th>
                <th className="border-b px-4 py-2 text-right">Margen Venta</th>
                <th className="border-b px-4 py-2 text-right">% Margen Venta</th>
                <th className="border-b px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicio.conceptos.map((concepto, index) => (
                <tr key={concepto.id}>
                  <td className="border px-4 py-2">{concepto.nombre_concepto}</td>
                  <td className="border px-4 py-2 text-right">
                    <span>{concepto.total_venta}</span>
                  </td>
                  <td className="border px-4 py-2 text-right">
                    <span>{concepto.costo_venta}</span>
                  </td>
                  <td className="border px-4 py-2 text-right">
                    {concepto.margen_venta}
                  </td>
                  <td className="border px-4 py-2 text-right">
                    {concepto.porcentaje_margen}%
                  </td>
                  <td className="border px-4 py-2 text-center">
                  <Button
                      className="bg-yellow-500 text-white rounded-full px-3 py-1"
                      onClick={() => handleAbrirRecursosModal(concepto)}
                  >
                    Editar
                  </Button>               
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {conceptoSeleccionado && (
          <EditarRecursosModal
            recursos={conceptoSeleccionado.recursos || []}
            isOpen={isRecursosModalOpen}
            onGuardar={handleGuardarRecursos}
            onCancelar={() => setIsRecursosModalOpen(false)}
          />
          )}

          <div className="flex justify-between mt-6">
            <Button className="bg-red-500 text-white px-6 py-2" onClick={onCancelar}>
              Cancelar
            </Button>
            <Button className="bg-blue-500 text-white px-6 py-2" onClick={handleGuardar}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditarServicioModal;
