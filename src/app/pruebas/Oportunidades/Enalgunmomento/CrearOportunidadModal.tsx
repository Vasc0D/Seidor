import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';

interface CrearOportunidadModalProps {
  clientes: any[];  // Recibirás una lista de clientes para seleccionar
  onCrearOportunidad: (clienteId: string, nombre: string) => void;  // Función para crear oportunidad
}

export default function CrearOportunidadModal({ clientes, onCrearOportunidad }: CrearOportunidadModalProps) {
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [nombreOportunidad, setNombreOportunidad] = useState('');

  const handleSubmit = () => {
    if (!clienteSeleccionado || !nombreOportunidad) {
      console.error('Cliente o nombre de oportunidad no seleccionados');
      return;
    }

    onCrearOportunidad(clienteSeleccionado, nombreOportunidad);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-500 text-white">Crear Oportunidad</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Oportunidad</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          <select 
            className="w-full border rounded-md p-2"
            value={clienteSeleccionado}
            onChange={(e) => setClienteSeleccionado(e.target.value)}
          >
            <option value="">Selecciona un cliente</option>
            {clientes.map((cliente, index) => (
              <option key={index} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </select>

          <Input
            value={nombreOportunidad}
            onChange={(e) => setNombreOportunidad(e.target.value)}
            placeholder="Nombre de la Oportunidad"
            className="w-full p-2 border rounded-md"
          />

          <Button onClick={handleSubmit} className="bg-green-500 text-white">
            Crear
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
