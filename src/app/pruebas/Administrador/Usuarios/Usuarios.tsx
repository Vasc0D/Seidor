import { useState, useEffect } from 'react';
import { AiOutlineEdit } from 'react-icons/ai';
import CrearUsuarioModal from './CrearUsuarioModal';

interface Usuario {
    id: string;
    username: string;
    role: string;  // Agregamos el rol para poder manejarlo en la edición
}

interface UsuariosPorRol {
  "Gerentes Comerciales": Usuario[];
  "Gerentes de Operaciones": Usuario[];
  "Gerentes Ejecutivos": Usuario[];
}

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuariosPorRol>({
    "Gerentes Comerciales": [],
    "Gerentes de Operaciones": [],
    "Gerentes Ejecutivos": [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  // Función para cargar usuarios desde la API
  const fetchUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:5015/api/usuarios', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        alert('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      alert('Error al cargar usuarios');
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Función para actualizar la lista cuando se cree o edite un usuario
  const handleCreateOrUpdate = () => {
    fetchUsuarios(); // Refrescamos la lista de usuarios
    setIsModalOpen(false); // Cerramos el modal
  };

  // Función para abrir el modal en modo edición
  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario);  // Seteamos el usuario actual que se va a editar
    setIsModalOpen(true);     // Abrimos el modal
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Usuarios</h1>

      {/* Sección de Gerentes Comerciales */}
      <h2 className="text-xl font-semibold mt-4">Gerentes Comerciales:</h2>
      <div className='mt-3'></div>
      <div className="grid grid-cols-2 gap-4">
        {usuarios["Gerentes Comerciales"].map((usuario) => (
          <div key={usuario.id} className="flex items-center space-x-4 bg-blue-300 p-4 rounded-lg">
            <span className="flex-1 text-white text-center text-lg font-bold">{usuario.username}</span>
            <button className="text-black" onClick={() => handleEdit(usuario)}>
              <AiOutlineEdit className="cursor-pointer" />
            </button>
          </div>
        ))}
      </div>

      {/* Sección de Gerentes de Operaciones */}
      <h2 className="text-xl font-semibold mt-4">Gerentes de Operaciones:</h2>
      <div className='mt-3'></div>
      <div className="grid grid-cols-2 gap-4">
        {usuarios["Gerentes de Operaciones"].map((usuario) => (
          <div key={usuario.id} className="flex items-center space-x-4 bg-blue-300 p-4 rounded-lg">
            <span className="flex-1 text-white text-center text-lg font-bold">{usuario.username}</span>
            <button className="text-black" onClick={() => handleEdit(usuario)}>
              <AiOutlineEdit className="cursor-pointer" />
            </button>
          </div>
        ))}
      </div>

      {/* Sección de Gerentes Ejecutivos */}
      <h2 className="text-xl font-semibold mt-4">Gerentes Ejecutivos:</h2>
      <div className='mt-3'></div>
      <div className="grid grid-cols-2 gap-4">
        {usuarios["Gerentes Ejecutivos"].map((usuario) => (
          <div key={usuario.id} className="flex items-center bg-blue-300 p-4 rounded-lg">
            <span className="flex-1 text-white text-center text-lg font-bold">{usuario.username}</span>
            <button className="text-black" onClick={() => handleEdit(usuario)}>
              <AiOutlineEdit className="cursor-pointer" />
            </button>
          </div>
        ))}
      </div>

      {/* Botón para crear usuario */}
      <button
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
        onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
      >
        Crear Usuario
      </button>

      {isModalOpen && (
        <CrearUsuarioModal
          onCreate={handleCreateOrUpdate}  // Llamado cuando se crea un usuario
          onUpdate={handleCreateOrUpdate}  // Llamado cuando se actualiza un usuario
          existingUser={editingUser || undefined}       // Pasamos el usuario a editar (si es edición)
        />
      )}
    </div>
  );
};

export default Usuarios;
