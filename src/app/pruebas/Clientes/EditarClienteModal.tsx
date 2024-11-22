import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Cliente {
  id: string;
  razon_social: string;
  nombre: string;
  ruc: string;
  sociedades: number | null;
  empleados: number | null;
  vip: boolean;
  activo: boolean;
}

interface EditarClienteModalProps {
  cliente: Cliente;
  onEdit: () => void; // Callback para actualizar la lista de clientes
  onClose: () => void; // Callback para cerrar el modal
}

const EditarClienteModal: React.FC<EditarClienteModalProps> = ({ cliente, onEdit, onClose }) => {
  const [clienteEditado, setClienteEditado] = useState({
    ...cliente,
    sociedades: cliente.sociedades?.toString() || '', // Convertir a string o establecer como ''
    empleados: cliente.empleados?.toString() || '', // Convertir a string o establecer como ''
  });

  const [errores, setErrores] = useState({
    razon_social: '',
    nombre: '',
    ruc: '',
    sociedades: '',
    empleados: '',
  });

  useEffect(() => {
    setClienteEditado({
      ...cliente,
      sociedades: cliente.sociedades?.toString() || '',
      empleados: cliente.empleados?.toString() || '',
    });
  }, [cliente]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value;

    if (field === "ruc" && (!/^\d*$/.test(value) || value.length > 12)) return;
    if (field === "sociedades" && (!/^\d*$/.test(value) || parseInt(value) > 200)) return;
    if (field === "empleados" && (!/^\d*$/.test(value) || parseInt(value) > 10000)) return;

    setClienteEditado({
      ...clienteEditado,
      [field]: value,
    });

    setErrores({
      ...errores,
      [field]: '', // Limpiar error al cambiar el input
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setClienteEditado({
      ...clienteEditado,
      [field]: e.target.checked,
    });
  };

  const validarCampos = () => {
    const nuevosErrores = {
      razon_social: clienteEditado.razon_social ? '' : 'La razón social es obligatoria.',
      nombre: clienteEditado.nombre ? '' : 'El nombre es obligatorio.',
      ruc:
        clienteEditado.ruc &&
        clienteEditado.ruc.length >= 10 &&
        clienteEditado.ruc.length <= 12
          ? ''
          : 'El RUC debe tener entre 10 y 12 dígitos.',
      sociedades: clienteEditado.sociedades ? '' : 'El número de sociedades es obligatorio.',
      empleados: clienteEditado.empleados ? '' : 'El número de empleados es obligatorio.',
    };
    setErrores(nuevosErrores);
    return !Object.values(nuevosErrores).some((error) => error !== '');
  };

  const guardarCliente = async () => {
    if (!validarCampos()) return;

    try {
      const response = await fetch(`http://localhost:5015/api/clientes/${clienteEditado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para la autenticación
        body: JSON.stringify({
          ...clienteEditado,
          sociedades: parseInt(clienteEditado.sociedades) || null, // Convertir a número o null
          empleados: parseInt(clienteEditado.empleados) || null, // Convertir a número o null
        }),
      });

      if (response.ok) {
        alert('Cliente actualizado correctamente.');
        onEdit();
        onClose();
      } else {
        alert('Error al actualizar el cliente.');
      }
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Razón Social</label>
            <Input
              value={clienteEditado.razon_social}
              onChange={(e) => handleInputChange(e, 'razon_social')}
              placeholder="Razón Social..."
              className={errores.razon_social ? 'border-red-500' : ''}
            />
            {errores.razon_social && <p className="text-red-500 text-xs">{errores.razon_social}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input
              value={clienteEditado.nombre}
              onChange={(e) => handleInputChange(e, 'nombre')}
              placeholder="Nombre..."
              className={errores.nombre ? 'border-red-500' : ''}
            />
            {errores.nombre && <p className="text-red-500 text-xs">{errores.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">RUC</label>
            <Input
              value={clienteEditado.ruc || ''}
              onChange={(e) => handleInputChange(e, 'ruc')}
              placeholder="RUC..."
              className={errores.ruc ? 'border-red-500' : ''}
            />
            {errores.ruc && <p className="text-red-500 text-xs">{errores.ruc}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">N° de Sociedades</label>
            <Input
              value={clienteEditado.sociedades}
              onChange={(e) => handleInputChange(e, 'sociedades')}
              placeholder="Max 200 Sociedades..."
              className={errores.sociedades ? 'border-red-500' : ''}
            />
            {errores.sociedades && <p className="text-red-500 text-xs">{errores.sociedades}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Empleados</label>
            <Input
              value={clienteEditado.empleados}
              onChange={(e) => handleInputChange(e, 'empleados')}
              placeholder="Max 10 000 empleados..."
              className={errores.empleados ? 'border-red-500' : ''}
            />
            {errores.empleados && <p className="text-red-500 text-xs">{errores.empleados}</p>}
          </div>
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium">VIP</label>
            <input
              type="checkbox"
              checked={clienteEditado.vip}
              onChange={(e) => handleCheckboxChange(e, 'vip')}
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium">Activo</label>
            <input
              type="checkbox"
              checked={clienteEditado.activo}
              onChange={(e) => handleCheckboxChange(e, 'activo')}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={guardarCliente} className="bg-blue-500 text-white">
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditarClienteModal;
