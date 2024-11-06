// sidebar.tsx

import { AiOutlineHome } from 'react-icons/ai';
import { BiLogOut } from 'react-icons/bi';
import { FaUsers, FaBoxes, FaPersonBooth, FaPeopleArrows, FaClipboardList } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isCollapsed: boolean;
  handleToggle: () => void;
  handlePageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, handleToggle, handlePageChange }) => {
  const [isCotizacionesOpen, setIsCotizacionesOpen] = useState(false); // Menú expandible
  const [isAdminOpen, setIsAdminOpen] = useState(false); // Estado para el menú de Administrador
  const [isAdmin, setIsAdmin] = useState(false); // Estado para determinar si el usuario es Admin
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  const toggleCotizacionesMenu = () => setIsCotizacionesOpen(!isCotizacionesOpen); // Toggle Cotizaciones

  // Función para manejar la expansión/collapse del menú Administrador
  const toggleAdminMenu = () => {
    setIsAdminOpen(!isAdminOpen);
  };

  // Verificar el rol del usuario al cargar el componente
  useEffect(() => {
    const role = sessionStorage.getItem('role'); // Obtener el rol del sessionStorage

    console.log('Rol:', role);
    if (role === 'Administrador') {
      setIsAdmin(true); // Solo si es Administrador, mostramos la opción
    }

    const fetchUserInfo = async () => {
      try {
        const response = await fetch('http://localhost:5015/api/user', {
          method: 'GET',
          credentials: 'include', // Para asegurarse de que la cookie con el token sea enviada
        });
  
        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
          setRole(data.role);
        } else {
          console.error('Error al obtener la información del usuario');
        }
      } catch (error) {
        console.error('Error en la solicitud de obtener información del usuario:', error);
      }
    };
  
    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5015/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Esto asegura que las cookies se incluyan
      });

      if (response.ok) {
        // Limpiamos el sessionStorage
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');

        // Redirigir al usuario a la página de inicio de sesión
        router.push('/');
      } else {
        console.error('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error en la solicitud de logout:', error);
    }
  };

  return (
    <div
      className={`bg-gray-800 text-white h-screen p-5 pt-8 relative duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <button
        className={`absolute top-9 -right-3 w-7 h-7 bg-blue-500 text-white rounded-full transform duration-300 ${
          isCollapsed ? 'rotate-180' : ''
        }`}
        onClick={handleToggle}
      >
        {isCollapsed ? '>' : '<'}
      </button>

      <div className="flex flex-col items-center">
        {/* Imagen del usuario */}
        <div className="flex flex-col items-center mt-4">
          <img
            src="https://via.placeholder.com/150"
            alt="User"
            className="w-20 h-20 rounded-full cursor-pointer mb-4"
          />
        </div>

        {/* Nombre de usuario */}
        <div className="text-center">
          <span>{username}</span>
        </div>

        {/* Rol del usuario */}
        <div className="mt-3 text-center text-xs">
          <span>{role}</span>
        </div>

        {/* Separador para dar espacio entre la imagen y los botones */}
        <div className="mt-7"></div>

        {/* Botones del sidebar */}
        <div className="flex flex-col w-full space-y-2">
          {/* Opción Home */}
          <div
            className={`w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700 ${
              !isCollapsed && 'justify-start'
            }`}
            onClick={() => handlePageChange('home')}
          >
            <AiOutlineHome className="text-2xl" />
            {!isCollapsed && <span className="ml-4">Home</span>}
          </div>

          {/* Opción Cotizaciones */}
          <div
            className={`w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700 ${
              !isCollapsed && 'justify-start'
            }`}
            onClick={toggleCotizacionesMenu}
          >
            <FaClipboardList className="text-2xl" />
            {!isCollapsed && (
              <div className="flex justify-between w-full">
                <span className="ml-4">Cotizaciones</span>
                <span>{isCotizacionesOpen ? '▲' : '▼'}</span>
              </div>
            )}
          </div>

          {!isCollapsed && isCotizacionesOpen && (
            <div className="space-y-1">
              {role === 'Gerente de Operaciones' ? (
                <>
                  {/* Opción Cotizaciones Pendientes para Gerente de Operaciones */}
                  <div
                    className="w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700"
                    onClick={() => handlePageChange('cotizaciones-pendientes')}
                  >
                    Cotizaciones Pendientes
                  </div>
                  {/* Historial de Cotizaciones para Gerente de Operaciones */}
                  <div
                    className="w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700"
                    onClick={() => handlePageChange('historial-cotizaciones')}
                  >
                    Historial de Cotizaciones
                  </div>
                </>
              ) : (
                // Opción Cotizaciones Pendientes General y Historial de Cotizaciones General para otros roles
                <>
                  <div
                    className="w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700"
                    onClick={() => handlePageChange('cotizaciones-pendientes')}
                  >
                    Cotizaciones Pendientes
                  </div>
                  <div
                    className="w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700"
                    onClick={() => handlePageChange('historial-cotizaciones')}
                  >
                    Historial de Cotizaciones
                  </div>
                </>
              )}
            </div>
          )}

          {/* Opción Clientes */}
          <div
            className={`w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700 ${
              !isCollapsed && 'justify-start'
            }`}
            onClick={() => handlePageChange('clientes')}
          >
            <FaUsers className="text-2xl" />
            {!isCollapsed && <span className="ml-4">Clientes</span>}
          </div>

          {/* Opción Oportunidades */}
          <div
            className={`w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700 ${
              !isCollapsed && 'justify-start'
            }`}
            onClick={() => handlePageChange('oportunidades')}
          >
          <FaBoxes className="text-2xl" />
          {!isCollapsed && <span className="ml-4">Oportunidades</span>}
          </div>

          {/* Opción Administrador */}
          {isAdmin && ( // Solo mostramos esta sección si el usuario es administrador
            <>
              <div
                className={`w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700 ${
                  !isCollapsed && 'justify-start'
                }`}
                onClick={toggleAdminMenu} // Para colapsar/expandir el menú
              >
                <FaUsers className="text-2xl" />
                {!isCollapsed && (
                  <div className="flex justify-between w-full">
                    <span className="ml-4">Administrador</span>
                    <span>{isAdminOpen ? '▲' : '▼'}</span> {/* Indicador de expandir */}
                  </div>
                )}
              </div>

              {/* Submenú de Administrador (solo visible si el menú está abierto) */}
              {!isCollapsed && isAdminOpen && (
                <div className="ml-9 space-y-1">
                  <div
                    className="w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700"
                    onClick={() => handlePageChange('usuarios')}
                  >
                    Usuarios
                  </div>
                  <div
                    className="w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700"
                    onClick={() => handlePageChange('conceptos')}
                  >
                    Conceptos
                  </div>
                </div>
              )}
            </>
          )}

          {/* Opción Logout */}
          <div
            className={`w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700 ${
              !isCollapsed && 'justify-start'
            }`}
            onClick={handleLogout}
          >
            <BiLogOut className="text-2xl" />
            {!isCollapsed && <span className="ml-4">Logout</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
