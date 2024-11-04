import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface Recurso {
  id: string;
  recurso: string;
  tarifa_lista: number;
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

interface Concepto {
  id: string;
  nombre_concepto: string;
  estado: string;
  total_venta: number;
  costo_venta: number;
  margen_venta: number;
  porcentaje_margen: number;
}

interface RecursosCotizacionProps {
  concepto: Concepto;
  recursosGuardados: RecursoCotizacion[];
  onClose: () => void;
  onGuardar: (recursos: RecursoCotizacion[]) => void;
}

const recursosDisponibles: Recurso[] = [
  { id: '1', recurso: 'Gerente de Proyecto', tarifa_lista: 480 },
  { id: '2', recurso: 'Líder de Proyecto', tarifa_lista: 360 },
  { id: '3', recurso: 'Consultor Senior', tarifa_lista: 320 },
  { id: '4', recurso: 'Consultor Junior', tarifa_lista: 288 },
];

const RecursosCotizacion: React.FC<RecursosCotizacionProps> = ({ concepto, recursosGuardados, onClose, onGuardar }) => {
  const [recursos, setRecursos] = useState<RecursoCotizacion[]>(recursosGuardados);

  const handleAgregarRecurso = () => {
    setRecursos([
      ...recursos,
      {
        id: String(recursos.length + 1),
        recurso: '',
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
      },
    ]);
  };

  const handleEliminarRecurso = (index: number) => {
    const nuevosRecursos = recursos.filter((_, i) => i !== index);
    setRecursos(nuevosRecursos);
  };

// Actualizar el recurso seleccionado o algún valor de entrada
const handleChange = (index: number, key: keyof RecursoCotizacion, value: string) => {
    const nuevosRecursos = [...recursos];
    const recurso = nuevosRecursos[index];
  
    if (key === 'recurso') {
      // Si se selecciona un recurso, asignar sus valores correspondientes
      const recursoSeleccionado = recursosDisponibles.find((r) => r.recurso === value);
      if (recursoSeleccionado) {
        nuevosRecursos[index] = {
          ...nuevosRecursos[index],
          recurso: recursoSeleccionado.recurso,
          tarifa_lista: recursoSeleccionado.tarifa_lista,
        };
      }
    } else {
      // Validar que el valor ingresado sea un número
      const numericValue = Number(value);
      if (!isNaN(numericValue)) {
        nuevosRecursos[index] = {
          ...nuevosRecursos[index],
          [key]: numericValue,
        };
      }
    }

    const totalDias = recurso.preparacion + recurso.bbp + recurso.r_dev + recurso.r_pya + recurso.pi_pya + recurso.pi_deply + recurso.acompanamiento;
    const tarifaVenta = recurso.tarifa_lista;
    const totalVenta = tarifaVenta * totalDias;
    const costoVenta = totalVenta * 0.5;
    const margenVenta = totalVenta - costoVenta;
    const porcentajeMargen = (margenVenta / totalVenta) * 100;

    nuevosRecursos[index] = {
      ...recurso,
      tarifa_venta: tarifaVenta,
      total_dias: totalDias,
      total_venta: totalVenta,
      costo_venta: costoVenta,
      margen_venta: margenVenta,
      porcentaje_margen: porcentajeMargen,
    };

    setRecursos(nuevosRecursos);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Cotización de: {concepto.nombre_concepto}</h1>
      <table className="w-full border-collapse bg-gray-50 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100 text-gray-600 font-semibold text-sm">
            <th className="px-4 py-2 border-b">Recursos</th>
            <th className="px-4 py-2 border-b">Tarifa</th>
            <th className="px-4 py-2 border-b">Preparación</th>
            <th className="px-4 py-2 border-b">BBP</th>
            <th className="px-4 py-2 border-b">DEV</th>
            <th className="px-4 py-2 border-b">PYA</th>
            <th className="px-4 py-2 border-b">PYA</th>
            <th className="px-4 py-2 border-b">DEPLY</th>
            <th className="px-4 py-2 border-b">Acompañamiento</th>
            <th className="px-4 py-2 border-b">Total días</th>
            <th className="px-4 py-2 border-b">Total venta</th>
            <th className="px-4 py-2 border-b">Costo venta</th>
            <th className="px-4 py-2 border-b">Margen venta</th>
            <th className="px-4 py-2 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {recursos.map((recurso, index) => (
            <tr key={index} className="text-center">
              <td className="px-4 py-2 border-b">
                <Select value={recurso.recurso} onValueChange={(value) => handleChange(index, 'recurso', value)}>
                  <SelectTrigger className="rounded-full w-full bg-white text-sm text-gray-700">
                    <SelectValue placeholder="Selecciona un recurso" />
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
              <td className="px-4 py-2 border-b text-sm text-gray-700">{recurso.tarifa_lista}</td>
              <td className="px-4 py-2 border-b">
                <Input
                  value={recurso.preparacion}
                  onChange={(e) => handleChange(index, 'preparacion', e.target.value)}
                  className="text-center text-sm rounded-lg bg-gray-50"
                />
              </td>
              <td className="px-4 py-2 border-b">
                <Input
                  value={recurso.bbp}
                  onChange={(e) => handleChange(index, 'bbp', e.target.value)}
                  className="text-center text-sm rounded-lg bg-gray-50"
                />
              </td>
              {/* Repite el componente Input para cada campo adicional */}
              <td className="px-4 py-2 border-b">{recurso.total_dias}</td>
              <td className="px-4 py-2 border-b text-sm text-gray-700">{recurso.total_venta}</td>
              <td className="px-4 py-2 border-b text-sm text-gray-700">{recurso.costo_venta}</td>
              <td className="px-4 py-2 border-b text-sm text-gray-700">{recurso.margen_venta}</td>
              <td className="px-4 py-2 border-b">
                <Button onClick={() => handleEliminarRecurso(index)} className="bg-red-500 text-white rounded-full px-3 py-2">
                  -
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-4">
        <Button onClick={handleAgregarRecurso} className="bg-green-500 text-white rounded-full px-3 py-1">+</Button>
        <div className="space-x-4">
          <Button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-lg">Cancelar</Button>
          <Button onClick={() => onGuardar(recursos)} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Terminar Cotización</Button>
        </div>
      </div>
    </div>
  );
};

export default RecursosCotizacion;
