import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface Concepto {
  concepto: string;
  gerente: string;
}

interface Usuario {
  id: string;
  username: string;
}

interface MostrarModalServiciosProps {
  isOpen: boolean;
  onClose: () => void;
  onGuardarServicio: (servicio: any) => void;  // Nueva prop para enviar el servicio guardado al padre
}

const MostrarModalServicios: React.FC<MostrarModalServiciosProps> = ({ isOpen, onClose, onGuardarServicio }) => {
  const [nombreProyecto, setNombreProyecto] = useState<string>(""); // Nombre del Proyecto
  const [conceptos, setConceptos] = useState<Concepto[]>([{ concepto: "", gerente: "" }]); // Estado inicial con un campo
  const [gerentes_operaciones, setGerentesOperaciones] = useState<Usuario[]>([]); // Lista de gerentes de operaciones

  useEffect(() => {
    const fetchGerentesOperaciones = async () => {
      try {
        const response = await fetch('http://localhost:5015/api/usuarios/gerentes_operaciones', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Error al cargar los gerentes de operaciones');

        const data = await response.json();
        setGerentesOperaciones(data);
        } catch (error) {
          console.error(error);
      }
    };

    fetchGerentesOperaciones();
  } , []);
  // Añadir un nuevo concepto
  const handleAddConcepto = () => setConceptos([...conceptos, { concepto: "", gerente: "" }]);

  // Eliminar un concepto específico
  const handleRemoveConcepto = (index: number) => {
    setConceptos(conceptos.filter((_, i) => i !== index));
  };

  // Actualizar un concepto específico
  const handleConceptoChange = (index: number, key: keyof Concepto, value: string) => {
    const newConceptos = [...conceptos];
    newConceptos[index][key] = value;
    setConceptos(newConceptos);
  };

  // Guardar el servicio con los conceptos en el estado del componente padre
  const handleGuardarServicio = () => {
    const nuevoServicio = {
      nombre_proyecto: nombreProyecto,
      total_venta: 0,
      costo_venta: 0,
      margen_venta: 0,
      conceptos: conceptos.map((c) => ({
        nombre_concepto: c.concepto,
        estado: 'En proceso',
        gerente_id: c.gerente,
        total_venta: 0,
        costo_venta: 0,
        margen_venta: 0,
        porcentaje_margen: 0,
      }))
    };

    console.log('Servicio:', nuevoServicio);
    onGuardarServicio(nuevoServicio);  // Enviar el servicio al componente padre
    onClose();  // Cerrar el modal
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Servicio</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="block font-semibold text-lg mb-1">Nombre del Proyecto</label>
            <Input 
              placeholder="Nombre del Proyecto"
              value={nombreProyecto}
              onChange={(e) => setNombreProyecto(e.target.value)}
              className="w-full rounded-full"
            />
          </div>

          {/* Campos dinámicos de Conceptos */}
          {conceptos.map((concepto, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <Input
                  placeholder="Concepto"
                  value={concepto.concepto}
                  onChange={(e) => handleConceptoChange(index, "concepto", e.target.value)}
                  className="rounded-full"
                />
                <Select
                  value={concepto.gerente}
                  onValueChange={(value) => handleConceptoChange(index, "gerente", value)}
                >
                  <SelectTrigger className="rounded-full w-full">
                    <SelectValue placeholder="Gerente de Operaciones" />
                  </SelectTrigger>
                  <SelectContent>
                    {gerentes_operaciones.map((gerente) => (
                      <SelectItem key={gerente.id} value={gerente.id}>
                        {gerente.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Botón para eliminar un concepto */}
              {conceptos.length > 1 && (
                <Button
                  onClick={() => handleRemoveConcepto(index)}
                  className="bg-red-500 text-white rounded-full px-3.5 py-3"
                >
                  -
                </Button>
              )}
            </div>
          ))}

          {/* Botón para añadir más conceptos */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleAddConcepto}
              className="bg-blue-500 text-white rounded-full px-3.5 py-3"
            >
              +
            </Button>
          </div>

          {/* Botón para guardar la cotización */}
          <div className="flex justify-end">
            <Button
              className="bg-indigo-500 text-white rounded-full px-8 py-3 mt-1"
              onClick={handleGuardarServicio}
            >
              Guardar Cotización
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MostrarModalServicios;
