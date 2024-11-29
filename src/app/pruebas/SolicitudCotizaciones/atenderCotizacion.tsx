// atenderCotizacion.tsx

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import Conceptos from '../Administrador/Conceptos/Conceptos';

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
  r_Desarrollador: number;
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

// Recursos disponibles para seleccionar
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

const RecursosCotizacion: React.FC<RecursosCotizacionProps> = ({ concepto, recursosGuardados, onClose, onGuardar }) => {
  const [recursos, setRecursos] = useState<RecursoCotizacion[]>([
    {
        id: '1',
        recurso: '',
        tarifa_lista: 0,
        tarifa_venta: 0,
        preparacion: 0,
        bbp: 0,
        r_Desarrollador: 0,
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

  // Cargar recursos guardados en el estado al montar el componente
  useEffect(() => {
    setRecursos(recursosGuardados);
  }, [recursosGuardados]);

  // Agregar un nuevo recurso
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
        r_Desarrollador: 0,
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

  // Eliminar un recurso específico
  const handleEliminarRecurso = (index: number) => {
    const nuevosRecursos = recursos.filter((_, i) => i !== index);
    setRecursos(nuevosRecursos);
  };

// Actualizar el recurso seleccionado o algún valor de entrada
const handleChange = (index: number, key: keyof RecursoCotizacion, value: string) => {
    const nuevosRecursos = [...recursos];
  
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

    const recurso = nuevosRecursos[index];
    const totalDias =
      recurso.preparacion +
      recurso.bbp +
      recurso.r_Desarrollador +
      recurso.r_pya +
      recurso.pi_pya +
      recurso.pi_deply +
      recurso.acompanamiento;

    const tarifa_venta = recurso.tarifa_lista;
    const totalVenta = tarifa_venta * totalDias;
    const costoVenta = totalVenta * 0.5;
    const margenVenta = totalVenta - costoVenta;
    const porcentajeMargen = (margenVenta / totalVenta) * 100;
  
    nuevosRecursos[index] = {
      ...recurso,
      tarifa_venta: tarifa_venta,
      total_dias: totalDias,
      total_venta: totalVenta,
      costo_venta: costoVenta,
      margen_venta: margenVenta,
      porcentaje_margen: porcentajeMargen,
    };
  
    setRecursos(nuevosRecursos);
  };  

  // Guardar los cambioss
  const handleGuardar = async (recursos: RecursoCotizacion[]) => {
    try {
        // Convertir campos numéricos explícitamente antes de enviarlos
        const recursosFormateados = recursos.map((recurso) => ({
          ...recurso,
          tarifa_lista: parseFloat(recurso.tarifa_lista.toString()) || 0,
          tarifa_venta: parseFloat(recurso.tarifa_venta.toString()) || 0,
          preparacion: parseFloat(recurso.preparacion.toString()) || 0, // Cambiar a parseFloat
          bbp: parseFloat(recurso.bbp.toString()) || 0, // Cambiar a parseFloat
          r_Desarrollador: parseFloat(recurso.r_Desarrollador.toString()) || 0, // Cambiar a parseFloat
          r_pya: parseFloat(recurso.r_pya.toString()) || 0, // Cambiar a parseFloat
          pi_pya: parseFloat(recurso.pi_pya.toString()) || 0, // Cambiar a parseFloat
          pi_deply: parseFloat(recurso.pi_deply.toString()) || 0, // Cambiar a parseFloat
          acompanamiento: parseFloat(recurso.acompanamiento.toString()) || 0, // Cambiar a parseFloat
          total_dias: parseFloat(recurso.total_dias.toString()) || 0, // Cambiar a parseFloat
          total_venta: parseFloat(recurso.total_venta.toString()) || 0,
          costo_venta: parseFloat(recurso.costo_venta.toString()) || 0,
          margen_venta: parseFloat(recurso.margen_venta.toString()) || 0,
          porcentaje_margen: parseFloat(recurso.porcentaje_margen.toString()) || 0,
        }));

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_IP}/api/cotizaciones_servicios/recursos/${concepto.id}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
            body: JSON.stringify({ recursos: recursosFormateados }),
            });

        if (response.ok) {
            alert('Recursos guardados con éxito.');
            onGuardar(recursos);

            onClose();
        } else {
            alert('Error al guardar los recursos.');
        }
    } catch (error) {
        console.error('Error al guardar los recursos:', error);
    }
  };

  function formatNumberWithCommas(number: any) {
    if (typeof number !== 'number') {
      number = Number(number); // Convertir a número si es posible
      if (isNaN(number)) return '-'; // Retornar un guion si el valor no es un número válido
    }
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  const calcularTotalesPorTipo = () => {
    const tipos = ["Consultor Senior", "Consultor de Apoyo", "Consultor Desarrollador", "Consultor HR"];
  
    // Inicializar totales
    const totales: Record<string, Record<string, number>> = {};
    tipos.forEach((tipo) => {
      totales[tipo] = {
        preparacion: 0,
        bbp: 0,
        Desarrollador: 0,
        pya: 0,
        pi_pya: 0,
        pi_deply: 0,
        acompanamiento: 0,
      };
    });
  
    // Sumar valores por tipo
    recursos.forEach((recurso) => {
      if (totales[recurso.recurso]) {
        totales[recurso.recurso].preparacion += recurso.preparacion || 0;
        totales[recurso.recurso].bbp += recurso.bbp || 0;
        totales[recurso.recurso].Desarrollador += recurso.r_Desarrollador || 0;
        totales[recurso.recurso].pya += recurso.r_pya || 0;
        totales[recurso.recurso].pi_pya += recurso.pi_pya || 0;
        totales[recurso.recurso].pi_deply += recurso.pi_deply || 0;
        totales[recurso.recurso].acompanamiento += recurso.acompanamiento || 0;
      }
    });
  
    // Calcular factores semana
    const factoresSemana: Record<string, Record<string, number>> = {};
    tipos.forEach((tipo) => {
      factoresSemana[tipo] = {
        preparacion: totales[tipo]?.preparacion ? totales[tipo].preparacion / 5 : 0,
        bbp: totales[tipo]?.bbp ? totales[tipo].bbp / 5 : 0,
        Desarrollador: totales[tipo]?.Desarrollador ? totales[tipo].Desarrollador / 5 : 0,
        pya: totales[tipo]?.pya ? totales[tipo].pya / 5 : 0,
        pi_pya: totales[tipo]?.pi_pya ? totales[tipo].pi_pya / 5 : 0,
        pi_deply: totales[tipo]?.pi_deply ? totales[tipo].pi_deply / 5 : 0,
        acompanamiento: totales[tipo]?.acompanamiento ? totales[tipo].acompanamiento / 5 : 0,
      };
    });
  
    return { totales, factoresSemana };
  };  

  const { totales, factoresSemana } = calcularTotalesPorTipo();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4 text-gray-800">Cotización de: {concepto.nombre_concepto}</h1>

      <div className='overflow-hidden'>
        <table className="w-full border-collapse bg-gray-50 rounded-lg shadow-sm text-xs">
          <thead>
            <tr className="bg-gray-100 text-gray-700 font-semibold">
              <th className="px-2 py-1">Recursos</th>
              <th className="px-2 py-1">Tarifa</th>
              <th className="px-2 py-1">Prep</th>
              <th className="px-2 py-1">BBP</th>
              <th className="px-2 py-1">Desarrollador</th>
              <th className="px-2 py-1">PYA</th>
              <th className="px-2 py-1">PYA</th>
              <th className="px-2 py-1">DEPLY</th>
              <th className="px-2 py-1">Acomp</th>
              <th className="px-2 py-1">Total días</th>
              <th className="px-2 py-1">Total venta</th>
              <th className="px-2 py-1">Costo venta</th>
              <th className="px-2 py-1">Margen venta</th>
              <th className="px-2 py-1">-</th>
            </tr>
          </thead>
          <tbody>
            {recursos.map((recurso, index) => (
              <tr key={index} className="text-center hover:bg-gray-50 transition">
                <td className="border border-gray-300 px-2 py-1">
                  <Select
                    value={recurso.recurso}
                    onValueChange={(value) => handleChange(index, 'recurso', value)}
                  >
                    <SelectTrigger className="rounded-full w-44 bg-white text-xs">
                      <SelectValue placeholder="Selecciona un recurso" />
                    </SelectTrigger>
                    <SelectContent>
                      {recursosDisponibles.map((recursoDisponible) => (
                        <SelectItem key={recursoDisponible.id} value={recursoDisponible.recurso}>
                          {recursoDisponible.recurso}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                  {recurso.tarifa_lista}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number" // Asegúrate de que el tipo sea "number"
                    min="0"
                    value={recurso.preparacion}
                    onChange={(e) => handleChange(index, 'preparacion', e.target.value)}
                    className="text-left rounded bg-gray-50 text-xs"
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number" // Asegúrate de que el tipo sea "number"
                    min="0"
                    value={recurso.bbp}
                    onChange={(e) => handleChange(index, 'bbp', e.target.value)}
                    className="text-left rounded bg-gray-50 text-xs"
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number" // Asegúrate de que el tipo sea "number"
                    min="0"
                    value={recurso.r_Desarrollador}
                    onChange={(e) => handleChange(index, 'r_Desarrollador', e.target.value)}
                    className="text-left rounded bg-gray-50 text-xs"
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number" // Asegúrate de que el tipo sea "number"
                    min="0"
                    value={recurso.r_pya}
                    onChange={(e) => handleChange(index, 'r_pya', e.target.value)}
                    className="text-left rounded bg-gray-50 text-xs"
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number" // Asegúrate de que el tipo sea "number"
                    min="0"
                    value={recurso.pi_pya}
                    onChange={(e) => handleChange(index, 'pi_pya', e.target.value)}
                    className="text-left rounded bg-gray-50 text-xs"
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number" // Asegúrate de que el tipo sea "number"
                    min="0"
                    value={recurso.pi_deply}
                    onChange={(e) => handleChange(index, 'pi_deply', e.target.value)}
                    className="text-left rounded bg-gray-50 text-xs"
                  />
                </td>
                <td className="border border-gray-300 px-1 py-1">
                  <Input
                    type="number" // Asegúrate de que el tipo sea "number"
                    min="0"
                    value={recurso.acompanamiento}
                    onChange={(e) => handleChange(index, 'acompanamiento', e.target.value)}
                    className="text-left rounded bg-gray-50 text-xs"
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                  {formatNumberWithCommas(recurso.total_dias)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                  {formatNumberWithCommas(recurso.total_venta)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                  {formatNumberWithCommas(recurso.costo_venta)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                  {formatNumberWithCommas(recurso.margen_venta)}
                </td>
                <td className="border border-gray-300 px-1 py-1">
                  <Button
                    onClick={() => handleEliminarRecurso(index)}
                    className="bg-red-500 text-white rounded-full px-2 py-0 text-xs"
                  >
                    -
                  </Button>
                </td>
              </tr>
            ))}
            {/* Totales */}
            {Object.keys(totales).map((tipo) => (
            <>
              {/* Totales por tipo */}
              <tr key={`${tipo}-totales`} className="font-semibold bg-gray-200">
                <td>{`Total ${tipo}`}</td>
                <td colSpan={1}></td>
                <td>{totales[tipo].preparacion.toFixed(2)}</td>
                <td>{totales[tipo].bbp.toFixed(2)}</td>
                <td>{totales[tipo].Desarrollador.toFixed(2)}</td>
                <td>{totales[tipo].pya.toFixed(2)}</td>
                <td>{totales[tipo].pi_pya.toFixed(2)}</td>
                <td>{totales[tipo].pi_deply.toFixed(2)}</td>
                <td>{totales[tipo].acompanamiento.toFixed(2)}</td>
                <td colSpan={5}></td>
              </tr>
              {/* Factor Semana por tipo */}
              <tr key={`${tipo}-factor`} className="font-semibold bg-gray-300">
                <td>{`Factor Semana`}</td>
                <td colSpan={1}></td>
                <td>
                  {tipo === "Consultor Senior"
                    ? (totales[tipo].preparacion / 0.5 / 5).toFixed(2)
                    : (totales[tipo].preparacion / 5).toFixed(2)}
                </td>
                <td>
                  {tipo === "Consultor Senior"
                    ? (totales[tipo].bbp / 0.5 / 5).toFixed(2)
                    : (totales[tipo].bbp / 5).toFixed(2)}
                </td>
                <td>
                  {tipo === "Consultor Senior"
                    ? (totales[tipo].Desarrollador / 0.5 / 5).toFixed(2)
                    : (totales[tipo].Desarrollador / 5).toFixed(2)}
                </td>
                <td>
                  {tipo === "Consultor Senior"
                    ? (totales[tipo].pya / 0.5 / 5).toFixed(2)
                    : (totales[tipo].pya / 5).toFixed(2)}
                </td>
                <td>
                  {tipo === "Consultor Senior"
                    ? (totales[tipo].pi_pya / 0.5 / 5).toFixed(2)
                    : (totales[tipo].pi_pya / 5).toFixed(2)}
                </td>
                <td>
                  {tipo === "Consultor Senior"
                    ? (totales[tipo].pi_deply / 0.5 / 5).toFixed(2)
                    : (totales[tipo].pi_deply / 5).toFixed(2)}
                </td>
                <td>
                  {tipo === "Consultor Senior"
                    ? (totales[tipo].acompanamiento / 0.5 / 5).toFixed(2)
                    : (totales[tipo].acompanamiento / 5).toFixed(2)}
                </td>
                <td colSpan={5}></td>
              </tr>
            </>
          ))}
        </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-6">
        <Button onClick={handleAgregarRecurso} className="bg-green-500 text-white rounded-full px-3 py-1 text-sm">
          +
        </Button>

        <div className="space-x-4">
          <Button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs">
            Cancelar
          </Button>
          <Button onClick={() => handleGuardar(recursos)} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-xs">
            Terminar Cotización
          </Button>
        </div>
      </div>
    </div>
  );  
};

export default RecursosCotizacion;
