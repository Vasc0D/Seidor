import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface CrearUsuarioModalProps {
  onCreate?: () => void;
  onUpdate?: (id: string) => void;
  existingUser?: { id: string; username: string; role: string };
  onClose?: () => void;
  isOpen: boolean;
}

const CrearUsuarioModal: React.FC<CrearUsuarioModalProps> = ({ onCreate, onUpdate, existingUser, onClose, isOpen }) => {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');

  useEffect(() => {
    if (existingUser) {
      setNombre(existingUser.username);
      setRol(existingUser.role);
    } else {
      setNombre('');
      setPassword('');
      setRol('');
    }
  }, [existingUser]);

  const handleSaveChanges = async () => {
    if (!nombre || !rol) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    try {
      const userData = existingUser
        ? { username: nombre, role: rol }
        : { username: nombre, password, role: rol };

      const url = existingUser
        ? `http://localhost:5015/api/usuarios/${existingUser.id}`
        : 'http://localhost:5015/api/usuarios';

      const method = existingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        alert(existingUser ? 'Usuario actualizado con éxito' : 'Usuario creado con éxito');
        onCreate?.();
        onClose?.();
      } else {
        alert('Error al guardar el usuario.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un error al procesar la solicitud.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingUser ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre de Usuario..."
            />
          </div>
          {!existingUser && (
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña..."
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <Select value={rol} onValueChange={setRol}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione un Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gerente Comercial">Gerente Comercial</SelectItem>
                <SelectItem value="Gerente de Operaciones">Gerente de Operaciones</SelectItem>
                <SelectItem value="Gerente Ejecutivo">Gerente Ejecutivo</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <Button onClick={onClose} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition">
            Cancelar
          </Button>
          <Button onClick={handleSaveChanges} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
            {existingUser ? 'Guardar Cambios' : 'Crear Usuario'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CrearUsuarioModal;
