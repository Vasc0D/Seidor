import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface Recurso {
  id: string;
  recurso: string;
  tarifa_lista: number;
}

interface RecursoPlantilla {
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

interface ConceptoPlantilla {
  id: string;
  nombre_concepto: string;
  recursos: RecursoPlantilla[];
}

const recursosDisponibles: Recurso[] = [
  { id: "1", recurso: "Gerente de Proyecto X08", tarifa_lista: 480 },
  { id: "1", recurso: "Gerente de Proyecto X06/X05", tarifa_lista: 480 },
  { id: "2", recurso: "Líder Técnico", tarifa_lista: 320 },
  { id: "3", recurso: "Consultor Senior", tarifa_lista: 320 },
  { id: "4", recurso: "Consultor Desarrollador", tarifa_lista: 288 },
  { id: "5", recurso: "Consultor de Apoyo", tarifa_lista: 224 },
  { id: "6", recurso: "Consultor HR", tarifa_lista: 288 },
  { id: "6", recurso: "Consultor OE", tarifa_lista: 288 },
  { id: "6", recurso: "Consultora Infraestructura", tarifa_lista: 320 },
];

const CrearPlantilla: React.FC = () => {
  const [nombrePlantilla, setNombrePlantilla] = useState<string>("");
  const [conceptos, setConceptos] = useState<ConceptoPlantilla[]>([]);

  // Agregar un nuevo concepto
  const handleAgregarConcepto = () => {
    setConceptos([
      ...conceptos,
      { id: String(conceptos.length + 1), nombre_concepto: "", recursos: [] },
    ]);
  };

  // Eliminar un concepto
  const handleEliminarConcepto = (index: number) => {
    const nuevosConceptos = conceptos.filter((_, i) => i !== index);
    setConceptos(nuevosConceptos);
  };

  // Actualizar el nombre de un concepto
  const handleChangeConceptoNombre = (index: number, value: string) => {
    const nuevosConceptos = [...conceptos];
    nuevosConceptos[index].nombre_concepto = value;
    setConceptos(nuevosConceptos);
  };

  // Agregar un recurso a un concepto
  const handleAgregarRecurso = (conceptoIndex: number) => {
    const nuevosConceptos = [...conceptos];
    nuevosConceptos[conceptoIndex].recursos.push({
      id: String(nuevosConceptos[conceptoIndex].recursos.length + 1),
      recurso: "",
      tarifa_lista: 0,
      tarifa_venta: 0,
      preparacion: 0,
      bbp: 0,
      r_dev: 0,
      r_pya: 0,
      pi_pya: 0,
      pi_deply: 0,
      acompanamiento: 0,
      total_dias: 0,
      total_venta: 0,
      costo_venta: 0,
      margen_venta: 0,
      porcentaje_margen: 0,
    });
    setConceptos(nuevosConceptos);
  };

  // Eliminar un recurso de un concepto
  const handleEliminarRecurso = (conceptoIndex: number, recursoIndex: number) => {
    const nuevosConceptos = [...conceptos];
    nuevosConceptos[conceptoIndex].recursos = nuevosConceptos[conceptoIndex].recursos.filter(
      (_, i) => i !== recursoIndex
    );
    setConceptos(nuevosConceptos);
  };

  // Actualizar valores de un recurso
  const handleChangeRecurso = (
    conceptoIndex: number,
    recursoIndex: number,
    key: keyof RecursoPlantilla,
    value: string
  ) => {
    const nuevosConceptos = [...conceptos];
    const recurso = nuevosConceptos[conceptoIndex].recursos[recursoIndex];

    if (key === "recurso") {
      const recursoSeleccionado = recursosDisponibles.find((r) => r.recurso === value);
      if (recursoSeleccionado) {
        recurso.recurso = recursoSeleccionado.recurso;
        recurso.tarifa_lista = recursoSeleccionado.tarifa_lista;
      }
    } else {
      const numericValue = parseFloat(value);
      (recurso as any)[key] = !isNaN(numericValue) ? numericValue : 0;
    }

    // Recalcular totales
    const totalDias =
      recurso.preparacion +
      recurso.bbp +
      recurso.r_dev +
      recurso.r_pya +
      recurso.pi_pya +
      recurso.pi_deply +
      recurso.acompanamiento;

    recurso.total_dias = totalDias;
    recurso.tarifa_venta = recurso.tarifa_lista;
    recurso.total_venta = recurso.tarifa_lista * totalDias;
    recurso.costo_venta = recurso.total_venta * 0.5;
    recurso.margen_venta = recurso.total_venta - recurso.costo_venta;
    recurso.porcentaje_margen =
      recurso.total_venta > 0 ? (recurso.margen_venta / recurso.total_venta) * 100 : 0;

    setConceptos(nuevosConceptos);
  };

  // Guardar la plantilla
  const handleGuardarPlantilla = async () => {
    if (!nombrePlantilla) {
      alert("El nombre de la plantilla es obligatorio.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5015/api/plantillas/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombrePlantilla,
          conceptos,
        }),
      });

      if (response.ok) {
        alert("Plantilla creada exitosamente.");
        setNombrePlantilla("");
        setConceptos([]);
      } else {
        alert("Error al guardar la plantilla.");
      }
    } catch (error) {
      console.error("Error al guardar la plantilla:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4">Crear Plantilla</h1>
      <div className="mb-4">
        <Input
          placeholder="Nombre de la plantilla"
          value={nombrePlantilla}
          onChange={(e) => setNombrePlantilla(e.target.value)}
        />
      </div>
      <div className="max-h-[400px] overflow-y-auto overflow-x-hidden border rounded-lg shadow-sm p-4">
        {conceptos.map((concepto, index) => (
          <div key={index} className="mb-6 border p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Input
                placeholder="Nombre del concepto"
                value={concepto.nombre_concepto}
                onChange={(e) => handleChangeConceptoNombre(index, e.target.value)}
                className="flex-grow mr-2"
              />
              <Button onClick={() => handleEliminarConcepto(index)}>
                -
              </Button>
            </div>
            <table className="w-full border-collapse bg-gray-50 rounded-lg shadow-sm text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-semibold">
                  <th>Recursos</th>
                  <th>Tarifa</th>
                  <th>Preparación</th>
                  <th>BBP</th>
                  <th>DEV</th>
                  <th>PYA</th>
                  <th>PYA</th>
                  <th>DEPLY</th>
                  <th>Acompañamiento</th>
                  <th>Total Días</th>
                  <th>Total Venta</th>
                  <th>Costo Venta</th>
                  <th>Margen Venta</th>
                  <th>% Margen</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {concepto.recursos.map((recurso, recursoIndex) => (
                  <tr key={recursoIndex}>
                    <td>
                      <Select
                        value={recurso.recurso}
                        onValueChange={(value) => handleChangeRecurso(index, recursoIndex, "recurso", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Recurso" />
                        </SelectTrigger>
                        <SelectContent>
                          {recursosDisponibles.map((r) => (
                            <SelectItem key={r.id} value={r.recurso}>
                              {r.recurso}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td>{recurso.tarifa_lista}</td>
                    <td>
                      <Input
                        type='number'
                        value={recurso.preparacion}
                        min="0"
                        onChange={(e) => handleChangeRecurso(index, recursoIndex, "preparacion", e.target.value)}
                      />
                    </td>
                    <td>
                      <Input type='number' value={recurso.bbp} min="0" onChange={(e) => handleChangeRecurso(index, recursoIndex, "bbp", e.target.value)} />
                    </td>
                    <td>
                      <Input type='number' value={recurso.r_dev} min="0" onChange={(e) => handleChangeRecurso(index, recursoIndex, "r_dev", e.target.value)} />
                    </td>
                    <td>
                      <Input type='number' value={recurso.r_pya} min="0" onChange={(e) => handleChangeRecurso(index, recursoIndex, "r_pya", e.target.value)} />
                    </td>
                    <td>
                      <Input type='number' value={recurso.pi_pya} min="0" onChange={(e) => handleChangeRecurso(index, recursoIndex, "pi_pya", e.target.value)} />
                    </td>
                    <td>
                      <Input type='number' value={recurso.pi_deply} min="0" onChange={(e) => handleChangeRecurso(index, recursoIndex, "pi_deply", e.target.value)} />
                    </td>
                    <td>
                      <Input
                        type='number'
                        value={recurso.acompanamiento}
                        min="0"
                        onChange={(e) => handleChangeRecurso(index, recursoIndex, "acompanamiento", e.target.value)}
                      />
                    </td>
                    <td>{recurso.total_dias.toFixed(2)}</td>
                    <td>{recurso.total_venta.toFixed(2)}</td>
                    <td>{recurso.costo_venta.toFixed(2)}</td>
                    <td>{recurso.margen_venta.toFixed(2)}</td>
                    <td>{recurso.porcentaje_margen.toFixed(2)}%</td>
                    <td>
                      <Button onClick={() => handleEliminarRecurso(index, recursoIndex)}>-</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button onClick={() => handleAgregarRecurso(index)} className="mt-4">Agregar Recurso</Button>
          </div>
        ))}
        <div className="flex justify-between w-full">
          <Button onClick={handleAgregarConcepto} className="ml-1">
            Agregar Concepto
          </Button>
          <Button onClick={handleGuardarPlantilla}>Guardar Plantilla</Button>
        </div>
      </div>
    </div>
  );
};

export default CrearPlantilla;
