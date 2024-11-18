import { useState, useEffect } from 'react';
import { AiOutlineEdit } from 'react-icons/ai';
import { FiPlus } from 'react-icons/fi';
import CrearUsuarioModal from './CrearUsuarioModal';

interface Usuario {
  id: string;
  username: string;
  name: string;
  role: string;
  correo: string;
}

interface UsuariosPorRol {
  "Administradores": Usuario[];
  "Gerentes Comerciales": Usuario[];
  "Gerentes de Operaciones": Usuario[];
  "Gerentes Ejecutivos": Usuario[];
}

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuariosPorRol>({
    "Administradores": [],
    "Gerentes Comerciales": [],
    "Gerentes de Operaciones": [],
    "Gerentes Ejecutivos": [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  // Obtener usuarios de la API
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

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCreateOrUpdate = () => {
    fetchUsuarios();
    setIsModalOpen(false);
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario);
    setIsModalOpen(true);
  };

  const resetValues = () => {
    setEditingUser(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    // Limpiar el formulario
    resetValues();
  };

  return (
    <div className="p-8 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-800">Usuarios</h1>

      <div className="overflow-auto max-h-[60vh]">
        {Object.entries(usuarios).map(([rol, listaUsuarios]) => (
          <div key={rol} className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{rol}:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listaUsuarios.map((usuario: Usuario) => (
                <div
                  key={usuario.id}
                  className="flex items-center bg-white shadow-md rounded-lg p-4 transition hover:shadow-lg"
                >
                  <span className="flex-1 text-gray-900 font-medium text-lg">
                    {usuario.username}
                  </span>
                  <button
                    className="text-gray-500 hover:text-blue-600"
                    onClick={() => handleEdit(usuario)}
                  >
                    <AiOutlineEdit className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-500 transition"
        onClick={() => {
          setEditingUser(null);
          setIsModalOpen(true);
        }}
      >
        <FiPlus className="w-6 h-6" />
      </button>

      <CrearUsuarioModal
        onCreate={handleCreateOrUpdate}
        onUpdate={handleCreateOrUpdate}
        existingUser={editingUser || undefined}
        onClose={handleCloseModal}
        isOpen={isModalOpen}
      />
    </div>
  );
};

export default Usuarios;
