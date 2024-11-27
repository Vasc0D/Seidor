import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Servicio, Concepto, RecursoCotizacion } from "./interfaces";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditarRecursosModal from "./EditarConceptoModal";
import { FaTrash } from "react-icons/fa";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface Gerente {
  id: string;
  username: string;
}

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
  const [conceptos, setConceptos] = useState<Concepto[]>(servicio.conceptos);
  const [isRecursosModalOpen, setIsRecursosModalOpen] = useState(false);
  const [gerentesDisponibles, setGerentesDisponibles] = useState<Gerente[]>([]);

  // Cargar gerentes disponibles desde la API
  useEffect(() => {
    const fetchGerentes = async () => {
      try {
        const response = await fetch('http://localhost:5015/api/usuarios/gerentes_operaciones', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error("Error al cargar los gerentes de operaciones");
        }
        const data = await response.json();
        setGerentesDisponibles(data);
      } catch (error) {
        console.error("Error al cargar gerentes:", error);
      }
    };

    fetchGerentes();
  }, []);
  
  const handleAbrirRecursosModal = (concepto: Concepto) => {
    setConceptoSeleccionado(concepto);
    setIsRecursosModalOpen(true);
  };

  const handleGuardarRecursos = (recursosEditados: RecursoCotizacion[]) => {
    if (conceptoSeleccionado) {
      // Convertir los valores a números explícitamente para evitar concatenaciones de strings
      const total_venta = recursosEditados.reduce(
        (acc, recurso) => acc + Number(recurso.total_venta), 
        0
      );
      const costo_venta = recursosEditados.reduce(
        (acc, recurso) => acc + Number(recurso.costo_venta), 
        0
      );
      const margen_venta = total_venta - costo_venta;
      const porcentaje_margen = total_venta !== 0 ? (margen_venta / total_venta) * 100 : 0;
  
      // Redondear los valores a dos decimales y convertir a número
      const conceptoActualizado = {
        ...conceptoSeleccionado,
        recursos: recursosEditados,
        total_venta: parseFloat(total_venta.toFixed(2)),
        costo_venta: parseFloat(costo_venta.toFixed(2)),
        margen_venta: parseFloat(margen_venta.toFixed(2)),
        porcentaje_margen: parseFloat(porcentaje_margen.toFixed(2)),
      };
  
      setConceptos((prevConceptos) =>
        prevConceptos.map((concepto) =>
          concepto.id === conceptoSeleccionado.id ? conceptoActualizado : concepto
        )
      );
    }
  
    setIsRecursosModalOpen(false); // Cierra solo el segundo modal
  };
  
  // Guardar los cambios y enviar los datos del primer modal
  const handleGuardar = () => {
    // Asegurarnos de que todos los cálculos sean numéricos
    const totalVenta = conceptos.reduce((acc, concepto) => acc + Number(concepto.total_venta), 0);
    const costoVenta = conceptos.reduce((acc, concepto) => acc + Number(concepto.costo_venta), 0);
    const margenVenta = totalVenta - costoVenta;
  
    // Redondear los valores a dos decimales y convertir a número
    const servicioEditado: Servicio = {
      ...servicio,
      nombre_proyecto: nombreProyecto,
      conceptos,
      total_venta: parseFloat(totalVenta.toFixed(2)),
      costo_venta: parseFloat(costoVenta.toFixed(2)),
      margen_venta: parseFloat(margenVenta.toFixed(2)),
    };
  
    onGuardar(servicioEditado);
  };

  function formatNumberWithCommas(number: any) {
    if (typeof number !== 'number') {
      number = Number(number); // Convertir a número si es posible
      if (isNaN(number)) return '-'; // Retornar un guion si el valor no es un número válido
    }
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  const handleEliminarConcepto = (identificador: string) => {
    // Confirmación de eliminación
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este concepto? Esta acción no se puede deshacer.");
    if (!confirmacion) return;
  
    // Actualizar el estado, verificando si existe 'id' o usando 'nombre_concepto'
    setConceptos((prevConceptos) => {
      const nuevosConceptos = prevConceptos.filter((concepto) => {
        const conceptoIdentificador = concepto.id || concepto.nombre_concepto;
        console.log("Comparando:", conceptoIdentificador, "con", identificador);
        return conceptoIdentificador !== identificador;
      });
      console.log("Conceptos después de eliminar:", nuevosConceptos);
      return nuevosConceptos;
    });
  };
  
  
  return (
    <Dialog open={isOpen} onOpenChange={onCancelar}>
      <DialogContent className="max-w-5xl">
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

          <div className="max-h-[250px] overflow-y-auto">
            <table className="min-w-full bg-white border border-gray-200 text-sm mb-6">
              <thead>
                <tr>
                  <th className="border-b px-4 py-2 text-left">Conceptos</th>
                  <th className="border-b px-4 py-2 text-center">Gerente</th>
                  <th className="border-b px-4 py-2 text-right">Total Venta</th>
                  <th className="border-b px-4 py-2 text-right">Costo Venta</th>
                  <th className="border-b px-4 py-2 text-right">Margen Venta</th>
                  <th className="border-b px-4 py-2 text-right">% Margen Venta</th>
                  <th className="border-b px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {conceptos.map((concepto, index) => (
                  <tr key={concepto.id}>
                    <td className="border px-4 py-2">{concepto.nombre_concepto}</td>
                    <td className="border px-4 py-2 text-right">
                      <Select
                        value={concepto.gerente_id || ""}
                        onValueChange={(value) => {
                          setConceptos((prevConceptos) =>
                            prevConceptos.map((c, i) =>
                              i === index ? { ...c, gerente_id: value } : c
                            )
                          );
                        }}
                      >
                        <SelectTrigger className="rounded-full w-full">
                          <SelectValue placeholder="Seleccionar Gerente" />
                        </SelectTrigger>
                        <SelectContent>
                          {gerentesDisponibles.map((gerente) => (
                            <SelectItem key={gerente.id} value={gerente.id}>
                              {gerente.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="border px-4 py-2 text-right">{formatNumberWithCommas(concepto.total_venta)}</td>
                    <td className="border px-4 py-2 text-right">{formatNumberWithCommas(concepto.costo_venta)}</td>
                    <td className="border px-4 py-2 text-right">{formatNumberWithCommas(concepto.margen_venta)}</td>
                    <td className="border px-4 py-2 text-right">{concepto.porcentaje_margen}%</td>
                    <td className="border px-1 py-2 text-center">
                      <div className="flex justify-center">
                        <Button
                          className="bg-yellow-500 text-white rounded-full px-3 py-1 text-xs"
                          onClick={() => handleAbrirRecursosModal(concepto)}
                        >
                          Editar
                        </Button>
                        <Button
                          className="bg-red-500 text-white rounded-full px-3 py-1 ml-2 text-xs"
                          onClick={() => handleEliminarConcepto(concepto.id || concepto.nombre_concepto)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
