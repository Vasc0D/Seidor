import React from 'react';
import { Button } from '@/components/ui/button';
import CotizacionItems from './CotizacionItems';  // Importa el componente de cotización

interface DetalleOportunidadProps {
  cliente: any;  // Recibe el cliente seleccionado
  onVolver: () => void;  // Función para volver a la lista de oportunidades
}

export default function DetalleOportunidad({ cliente, onVolver }: DetalleOportunidadProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Detalles del Cliente</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input value={cliente.nombre} readOnly className="bg-gray-200" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">RUC</label>
          <input value={cliente.ruc} readOnly className="bg-gray-200" />
        </div>
        {/* Más detalles */}
      </div>

      <Button className="bg-blue-500 text-white" onClick={onVolver}>
        Volver a Oportunidades
      </Button>

      {/* Mostrar los items de cotización */}
        <CotizacionItems
            items={cliente.itemsCotizacion}
            onEditar={(index) => console.log('Editar item', index)}
            onEliminar={(index) => console.log('Eliminar item', index)}
        />
    </div>
  );
}
