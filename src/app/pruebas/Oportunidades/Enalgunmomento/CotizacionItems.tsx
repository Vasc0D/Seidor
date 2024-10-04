import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CotizacionItemsProps {
  items: any[];
  onEditar: (index: number) => void;
  onEliminar: (index: number) => void;
}

export default function CotizacionItems({ items, onEditar, onEliminar }: CotizacionItemsProps) {
  const [desplegados, setDesplegados] = useState<number[]>([]);

  const toggleDespliegue = (index: number) => {
    setDesplegados((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Conceptos</h3>
      <table className="min-w-full bg-white border border-gray-200 text-sm">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b"></th>
            <th className="py-2 px-4 border-b">Tipo de Concepto</th>
            <th className="py-2 px-4 border-b">Base de Datos</th>
            <th className="py-2 px-4 border-b">Solution</th>
            <th className="py-2 px-4 border-b">Total Venta</th>
            <th className="py-2 px-4 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <tr>
                <td className="px-4 py-2 border text-center">
                  <button onClick={() => toggleDespliegue(index)}>
                    {desplegados.includes(index) ? '▼' : '▶'}
                  </button>
                </td>
                <td className="px-4 py-2 border-b">{item.tipoCotizacion}</td>
                <td className="px-4 py-2 border-b">{item.baseDeDatos}</td>
                <td className="px-4 py-2 border-b">{item.solution}</td>
                <td className="px-4 py-2 border-b">{item.totalVenta}</td>
                <td className="px-4 py-2 border-b">
                  <Button className="bg-yellow-500 text-white" onClick={() => onEditar(index)}>
                    Editar
                  </Button>
                  <Button className="bg-red-500 text-white" onClick={() => onEliminar(index)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
