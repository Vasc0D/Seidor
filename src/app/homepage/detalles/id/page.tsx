'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

export default function DetallesOportunidad() {
  const router = useRouter();
  const { id } = router.query;  // Obtener el ID de la oportunidad desde la URL
  const [oportunidad, setOportunidad] = useState<any>(null);
  const [cliente, setCliente] = useState<any>(null);
  const [itemsCotizacion, setItemsCotizacion] = useState<any[]>([]);

  // Obtener los datos de la oportunidad y del cliente relacionado
  useEffect(() => {
    const fetchOportunidad = async () => {
      if (id) {
        try {
          const response = await fetch(`/api/oportunidades/${id}`);
          const data = await response.json();
          setOportunidad(data.oportunidad);
          setCliente(data.cliente);
          setItemsCotizacion(data.itemsCotizacion);  // Cargar los ítems de cotización relacionados
        } catch (error) {
          console.error('Error al obtener la oportunidad:', error);
        }
      }
    };

    fetchOportunidad();
  }, [id]);

  // Función para actualizar la oportunidad
  const handleGuardarCambios = async () => {
    try {
      const response = await fetch(`/api/oportunidades/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total_venta: oportunidad.total_venta,
          costo_venta: oportunidad.costo_venta,
          margen_venta: oportunidad.margen_venta,
          itemsCotizacion,  // Actualizamos también los ítems de la cotización
        }),
      });

      if (response.ok) {
        toast.success('Oportunidad actualizada correctamente');
        router.push('/homepage');  // Redirige al home después de guardar
      } else {
        toast.error('Error al actualizar la oportunidad');
      }
    } catch (error) {
      console.error('Error al actualizar la oportunidad:', error);
      toast.error('Error al actualizar la oportunidad');
    }
  };

  // Renderizar los detalles de la oportunidad
  if (!oportunidad || !cliente) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Editar Oportunidad</h1>

      {/* Mostrar detalles del cliente */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del Cliente</label>
          <Input value={cliente.nombre} readOnly className="bg-gray-200" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">RUC</label>
          <Input value={cliente.ruc} readOnly className="bg-gray-200" />
        </div>
      </div>

      {/* Aquí podrías renderizar y permitir editar los ítems de la cotización */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Ítems de la Cotización</h3>
        {itemsCotizacion.map((item, index) => (
          <div key={index}>
            <p>{item.tipo}</p>
            <p>Total: {item.total_venta}</p>
            {/* Añadir funcionalidad para editar los ítems */}
          </div>
        ))}
      </div>

      {/* Botón para guardar cambios */}
      <div className="flex justify-end mt-4">
        <Button onClick={handleGuardarCambios} className="bg-blue-500 text-white">
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
