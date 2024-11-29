import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface CrearUsuarioModalProps {
  onCreate?: () => void;
  onUpdate?: (id: string) => void;
  existingUser?: { id: string; username: string; name: string; role: string; correo: string };
  onClose?: () => void;
  isOpen: boolean;
}

const CrearUsuarioModal: React.FC<CrearUsuarioModalProps> = ({ onCreate, onUpdate, existingUser, onClose, isOpen }) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');
  const [correo, setCorreo] = useState('');

  useEffect(() => {
    if (existingUser) {
      setUsername(existingUser.username);
      setName(existingUser.name); 
      setRol(existingUser.role);
      setCorreo(existingUser.correo);
      console.log('existingUser:', existingUser);
    } else {
      setUsername('');
      setName('');
      setPassword('');
      setRol('');
      setCorreo('');
    }
  }, [existingUser]);

  const handleSaveChanges = async () => {
    if (!username || !rol || !name || !correo || (!existingUser && !password)) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    try {
      const userData = existingUser
        ? { username, name, role: rol, correo }
        : { username, name, password, role: rol, correo };

      const url = existingUser
        ? `${process.env.NEXT_PUBLIC_API_IP}/api/usuarios/${existingUser.id}`
        : `${process.env.NEXT_PUBLIC_API_IP}/api/usuarios`;

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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la persona..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de Usuario</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de Usuario..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
            <Input
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Correo Electrónico..."
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
