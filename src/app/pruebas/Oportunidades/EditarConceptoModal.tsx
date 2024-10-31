import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecursoCotizacion } from "./interfaces";

interface EditarRecursosModalProps {
  recursos: RecursoCotizacion[];
  isOpen: boolean;
  onGuardar: (recursosEditados: RecursoCotizacion[]) => void; // Agregamos la función onGuardar
  onCancelar: () => void; // Cambiamos onClose a onCancelar
}

const EditarRecursosModal: React.FC<EditarRecursosModalProps> = ({
  recursos,
  isOpen,
  onGuardar,
  onCancelar,
}) => {
  const [recursosEditados, setRecursosEditados] = useState<RecursoCotizacion[]>(recursos);

  useEffect(() => {
    if (isOpen) {
      setRecursosEditados([...recursos]);
    }
  }, [isOpen, recursos]);

  const handleTarifaVentaChange = (index: number, tarifaVenta: number) => {
    const nuevosRecursos = recursosEditados.map((recurso, i) =>
      i === index
        ? {
            ...recurso,
            tarifa_venta: tarifaVenta,
            total_venta: tarifaVenta * recurso.total_dias,
            margen_venta: tarifaVenta * recurso.total_dias - recurso.costo_venta,
            porcentaje_margen: parseFloat(
              (((tarifaVenta * recurso.total_dias - recurso.costo_venta) / (tarifaVenta * recurso.total_dias)) * 100).toFixed(2)
            ),
          }
        : recurso
    );
    setRecursosEditados(nuevosRecursos);
  };

  const actualizarRecursos = async () => {
    try {
      const response = await fetch(`http://localhost:5015/api/cotizaciones_servicios/recursos/actualizar`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recursosEditados),
      });
      
      if (!response.ok) {
        throw new Error("Error al actualizar los recursos");
      }

      alert("Recursos actualizados correctamente");

      onGuardar(recursosEditados); // Llamamos a onGuardar para actualizar los datos en el modal padre
      onCancelar(); // Cerrar el modal después de guardar
    } catch (error) {
      console.error(error);
      alert("Error al actualizar los recursos");
    }
  };

  const handleGuardar = () => {
    const confirmed = window.confirm("¿Estás seguro de guardar los cambios?");
    if (confirmed) {
      actualizarRecursos();
    }
  };

  const handleCancelar = () => {
    setRecursosEditados([...recursos]);
    onCancelar();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancelar}>
      <DialogContent className="max-w-screen-xl">
        <DialogHeader>
          <DialogTitle>Editar Recursos</DialogTitle>
        </DialogHeader>
        <div className="p-6 overflow-auto">
          <table className="min-w-full bg-white border border-gray-200 text-sm">
            <thead>
              <tr>
                <th className="border px-3 py-2">Recurso</th>
                <th className="border px-3 py-2 text-right">Tarifa de Lista</th>
                <th className="border px-3 py-2 text-right">Tarifa de Venta</th>
                <th className="border px-3 py-2 text-right">Preparación</th>
                <th className="border px-3 py-2 text-right">BBP</th>
                <th className="border px-3 py-2 text-right">DEV</th>
                <th className="border px-3 py-2 text-right">PYA</th>
                <th className="border px-3 py-2 text-right">DEPLY</th>
                <th className="border px-3 py-2 text-right">Acompañamiento</th>
                <th className="border px-3 py-2 text-right">Total Días</th>
                <th className="border px-3 py-2 text-right">Total Venta</th>
                <th className="border px-3 py-2 text-right">Costo Venta</th>
                <th className="border px-3 py-2 text-right">Margen Venta</th>
                <th className="border px-3 py-2 text-right">% Margen Venta</th>
              </tr>
            </thead>
            <tbody>
              {recursosEditados.map((recurso, index) => (
                <tr key={recurso.id}>
                  <td className="border px-4 py-2">{recurso.recurso}</td>
                  <td className="border px-4 py-2 text-center">{recurso.tarifa_lista}</td>
                  <td className="border px-4 py-2 text-center">
                    <Input
                      value={recurso.tarifa_venta}
                      onChange={(e) => handleTarifaVentaChange(index, parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </td>
                  <td className="border px-3 py-2 text-center">{recurso.preparacion}</td>
                  <td className="border px-3 py-2 text-center">{recurso.bbp}</td>
                  <td className="border px-3 py-2 text-center">{recurso.r_dev}</td>
                  <td className="border px-3 py-2 text-center">{recurso.r_pya}</td>
                  <td className="border px-3 py-2 text-center">{recurso.pi_deply}</td>
                  <td className="border px-3 py-2 text-center">{recurso.acompanamiento}</td>
                  <td className="border px-3 py-2 text-center">{recurso.total_dias}</td>
                  <td className="border px-3 py-2 text-center">{recurso.total_venta}</td>
                  <td className="border px-3 py-2 text-center">{recurso.costo_venta}</td>
                  <td className="border px-3 py-2 text-center">{recurso.margen_venta}</td>
                  <td className="border px-3 py-2 text-center">
                    {recurso.porcentaje_margen}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-6">
            <Button className="bg-red-500 text-white px-6 py-2" onClick={handleCancelar}>
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
