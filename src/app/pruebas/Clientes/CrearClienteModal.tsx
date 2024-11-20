import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CrearClienteModalProps {
  onCreate: () => void; // Callback para actualizar la lista de clientes
}

const CrearClienteModal: React.FC<CrearClienteModalProps> = ({ onCreate }) => {
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [cliente, setCliente] = useState({
    nombre: '',
    ruc: '',
    sociedades: '',
    empleados: '',
  });

  const [errores, setErrores] = useState({
    nombre: '',
    ruc: '',
    sociedades: '',
    empleados: '',
  });

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value;

    // Validación específica para el RUC
    if (field === "ruc") {
      // Permitir solo números y limitar la longitud máxima a 12
      if (!/^\d*$/.test(value)) return; // Ignorar caracteres no numéricos
      if (value.length > 12) return; // Limitar a 12 dígitos
    }

    // Validacion de sociedades 200 es el maximo
    if (field === "sociedades") {
      if (!/^\d*$/.test(value)) return; // Ignorar caracteres no numéricos
      if (parseInt(value) > 200) return; // Limitar a 200 sociedades
    }

    // Validacion de empleados 10000 es el maximo
    if (field === "empleados") {
      if (!/^\d*$/.test(value)) return; // Ignorar caracteres no numéricos
      if (parseInt(value) > 10000) return; // Limitar a 10000 empleados
    }

    setCliente({
      ...cliente,
      [field]: e.target.value,
    });
    setErrores({
      ...errores,
      [field]: '', // Limpiar el error al cambiar el input
    });
  };

  // Validación simple
  const validarCampos = () => {
    const nuevosErrores = {
      nombre: cliente.nombre ? '' : 'El nombre es obligatorio.',
      ruc:
      cliente.ruc && cliente.ruc.length >= 10 && cliente.ruc.length <= 12
        ? ''
        : 'El RUC debe tener entre 10 y 12 dígitos.',
      sociedades: cliente.sociedades ? '' : 'El número de sociedades es obligatorio.',
      empleados: cliente.empleados ? '' : 'El número de empleados es obligatorio.',
    };
    setErrores(nuevosErrores);
    return !Object.values(nuevosErrores).some(error => error !== '');
  };

  // Función para agregar cliente
  const agregarCliente = async () => {
    if (!validarCampos()) return;

    try {
      const response = await fetch('http://localhost:5015/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para la autenticación
        body: JSON.stringify(cliente),
      });

      if (response.ok) {
        onCreate(); // Refrescar la lista de clientes
        setIsCreatingClient(false); // Cerrar el modal
        setCliente({
          nombre: '',
          ruc: '',
          sociedades: '',
          empleados: '',
        }); // Limpiar el formulario
      } else {
        console.error('Error al crear cliente');
      }
    } catch (error) {
      console.error('Error al crear cliente:', error);
    }
  };

  return (
    <Dialog open={isCreatingClient} onOpenChange={setIsCreatingClient}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 text-white">Crear Cliente</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Cliente</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input
              value={cliente.nombre}
              onChange={(e) => handleInputChange(e, 'nombre')}
              placeholder="Nombre..."
              className={errores.nombre ? 'border-red-500' : ''}
            />
            {errores.nombre && <p className="text-red-500 text-xs">{errores.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">RUC</label>
            <Input
              value={cliente.ruc}
              onChange={(e) => handleInputChange(e, 'ruc')}
              placeholder="RUC..."
              className={errores.ruc ? 'border-red-500' : ''}
            />
            {errores.ruc && <p className="text-red-500 text-xs">{errores.ruc}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">N° de Sociedades</label>
            <Input
              value={cliente.sociedades}
              onChange={(e) => handleInputChange(e, 'sociedades')}
              placeholder="Max 200 Sociedades..."
              className={errores.sociedades ? 'border-red-500' : ''}
            />
            {errores.sociedades && <p className="text-red-500 text-xs">{errores.sociedades}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Empleados</label>
            <Input
              value={cliente.empleados}
              onChange={(e) => handleInputChange(e, 'empleados')}
              placeholder="Max 10 000 empleados..."
              className={errores.empleados ? 'border-red-500' : ''}
            />
            {errores.empleados && <p className="text-red-500 text-xs">{errores.empleados}</p>}
          </div>
        </div>

        {/* Botón para crear el cliente */}
        <div className="flex justify-end mt-4">
          <Button onClick={agregarCliente} className="bg-blue-500 text-white">Crear</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CrearClienteModal;
