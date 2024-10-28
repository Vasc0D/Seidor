// EditarRecursosModal.tsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecursoCotizacion } from "./interfaces"; // Asegúrate de importar correctamente

interface EditarRecursosModalProps {
  recursos: RecursoCotizacion[];
  isOpen: boolean;
  onGuardar: (recursosEditados: RecursoCotizacion[]) => void;
  onCancelar: () => void;
}

const EditarRecursosModal: React.FC<EditarRecursosModalProps> = ({
  recursos,
  isOpen,
  onGuardar,
  onCancelar,
}) => {
  const [recursosEditados, setRecursosEditados] = useState<RecursoCotizacion[]>(recursos);

  // Manejar cambios en la Tarifa de Venta
  const handleTarifaVentaChange = (index: number, value: number) => {
    const nuevosRecursos = [...recursosEditados];
    nuevosRecursos[index] = { ...nuevosRecursos[index], tarifa_venta: value };
    setRecursosEditados(nuevosRecursos);
  };

  // Guardar los cambios
  const handleGuardar = () => {
    onGuardar(recursosEditados);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancelar}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Recursos</DialogTitle>
        </DialogHeader>
        <div className="p-6 overflow-auto">
          <table className="min-w-full bg-white border border-gray-200 text-sm">
            <thead>
              <tr>
                <th className="border px-4 py-2">Recurso</th>
                <th className="border px-4 py-2 text-right">Tarifa de Lista</th>
                <th className="border px-4 py-2 text-right">Tarifa de Venta</th>
                <th className="border px-4 py-2 text-right">Preparación</th>
                <th className="border px-4 py-2 text-right">BBP</th>
                <th className="border px-4 py-2 text-right">DEV</th>
                <th className="border px-4 py-2 text-right">PYA</th>
                <th className="border px-4 py-2 text-right">DEPLY</th>
                <th className="border px-4 py-2 text-right">Acompañamiento</th>
                <th className="border px-4 py-2 text-right">Total Días</th>
                <th className="border px-4 py-2 text-right">Total Venta</th>
                <th className="border px-4 py-2 text-right">Costo Venta</th>
                <th className="border px-4 py-2 text-right">Margen Venta</th>
                <th className="border px-4 py-2 text-right">% Margen Venta</th>
              </tr>
            </thead>
            <tbody>
              {recursosEditados.map((recurso, index) => (
                <tr key={recurso.id}>
                  <td className="border px-4 py-2">{recurso.recurso}</td>
                  <td className="border px-4 py-2 text-right">{recurso.tarifa_lista}</td>
                  <td className="border px-4 py-2 text-right">
                    <Input
                      type="number"
                      value={recurso.tarifa_venta}
                      onChange={(e) =>
                        handleTarifaVentaChange(index, parseFloat(e.target.value) || 0)
                      }
                      className="w-24"
                    />
                  </td>
                  <td className="border px-4 py-2 text-right">{recurso.preparacion}</td>
                  <td className="border px-4 py-2 text-right">{recurso.bbp}</td>
                  <td className="border px-4 py-2 text-right">{recurso.r_dev}</td>
                  <td className="border px-4 py-2 text-right">{recurso.r_pya}</td>
                  <td className="border px-4 py-2 text-right">{recurso.pi_deply}</td>
                  <td className="border px-4 py-2 text-right">{recurso.acompanamiento}</td>
                  <td className="border px-4 py-2 text-right">{recurso.total_dias}</td>
                  <td className="border px-4 py-2 text-right">{recurso.total_venta}</td>
                  <td className="border px-4 py-2 text-right">{recurso.costo_venta}</td>
                  <td className="border px-4 py-2 text-right">{recurso.margen_venta}</td>
                  <td className="border px-4 py-2 text-right">
                    {recurso.porcentaje_margen}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default EditarRecursosModal;
