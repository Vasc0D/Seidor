import { useEffect, useState } from 'react';

interface CrearUsuarioModalProps {
  onCreate?: () => void;
  onUpdate?: (id: string) => void;
  existingUser?: { id: string; username: string; role: string };
  onDelete?: (id: string) => void;
}

const CrearUsuarioModal = ({ onCreate, onUpdate, existingUser }: CrearUsuarioModalProps) => {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');

  useEffect(() => {
    if (existingUser) {
        setNombre(existingUser.username);
        setRol(existingUser.role);
        }
    }, [existingUser]);

const handleSaveChanges = async () => {
    if (existingUser) {
      // Si es una edición, hacemos un PUT
      try {
        const updatedUser = {
          username: nombre,
          role: rol,
        };

        const response = await fetch(`http://localhost:5015/api/usuarios/${existingUser.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          },
          body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
          onUpdate?.(existingUser.id); // Notificar que el usuario se ha actualizado
          alert('Usuario actualizado con éxito');
        } else {
          alert('Error al actualizar el usuario');
        }
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        alert('Error al actualizar usuario');
      }
    } else {
      // Si no existe, es creación (esto ya estaba)
      try {
        const nuevoUsuario = {
          username: nombre,
          password: password,
          role: rol,
        };

        const response = await fetch('http://localhost:5015/api/usuarios', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          },
          body: JSON.stringify(nuevoUsuario),
        });

        if (response.ok) {
          setNombre('');
          setPassword('');
          setRol('');
          onCreate?.(); // Notificar que el usuario se ha creado
          alert('Usuario creado con éxito');
        } else {
          alert('Error al crear el usuario');
        }
      } catch (error) {
        console.error('Error al crear usuario:', error);
        alert('Error al crear usuario');
      }
    }
  };    

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
        <h2 className="text-2xl font-bold mb-4">{existingUser ? 'Editar Usuario' : 'Crear Usuario'}</h2>

        {/* Campo de Nombre */}
        <div className="mb-4">
          <label className="block mb-2">Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border p-2 rounded-md"
            placeholder="Nombre de Usuario"
          />
        </div>

        {/* Campo de Contraseña */}
        <div className="mb-4">
          <label className="block mb-2">Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded-md"
            placeholder="Contraseña"
          />
        </div>

        {/* Selección de Rol */}
        <div className="mb-4">
          <label className="block mb-2">Rol:</label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="w-full border p-2 rounded-md"
          >
            <option value="Seleccione un Role">Seleccione un Role</option>
            <option value="Gerente Comercial">Gerente Comercial</option>
            <option value="Gerente de Operaciones">Gerente de Operaciones</option>
            <option value="Gerente Ejecutivo">Gerente Ejecutivo</option>
          </select>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end">
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
            onClick={onCreate}
          >
            Cancelar
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
            onClick={handleSaveChanges}
          >
            {existingUser ? 'Guardar Cambios' : 'Crear Usuario'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearUsuarioModal;
