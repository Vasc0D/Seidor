import { AiOutlineHome } from 'react-icons/ai';
import { BiLogOut } from 'react-icons/bi';
import { FaUsers, FaBoxes, FaClipboardList, FaAddressBook, FaBook } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Tooltip from '@mui/material/Tooltip';

interface SidebarProps {
  isCollapsed: boolean;
  handleToggle: () => void;
  handlePageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, handleToggle, handlePageChange }) => {
  const [isCotizacionesOpen, setIsCotizacionesOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCotizaciones, setPendingCotizaciones] = useState(0);
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  const toggleCotizacionesMenu = () => setIsCotizacionesOpen(!isCotizacionesOpen);
  const toggleAdminMenu = () => setIsAdminOpen(!isAdminOpen);

  useEffect(() => {
    const role = sessionStorage.getItem('role');
    if (role === 'Administrador') setIsAdmin(true);

    const fetchUserInfo = async () => {
      try {
        const response = await fetch('http://localhost:5015/api/user', { method: 'GET', credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
          setRole(data.role);
        } else console.error('Error al obtener la información del usuario');
      } catch (error) {
        console.error('Error en la solicitud de obtener información del usuario:', error);
      }
    };

      // Obtener número de cotizaciones pendientes
      const fetchPendingCotizaciones = async () => {
        try {
          const response = await fetch('http://localhost:5015/api/cotizaciones_servicios/pendientes', { method: 'GET', credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            setPendingCotizaciones(data.length);
            console.log('Número de cotizaciones pendientes:', data.length);
          } else {
            console.error('Error al obtener el número de cotizaciones pendientes');
          }
        } catch (error) {
          console.error('Error en la solicitud de cotizaciones pendientes:', error);
        }
      };

    fetchUserInfo();
    fetchPendingCotizaciones();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5015/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (response.ok) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        router.push('/');
      } else console.error('Error al cerrar sesión');
    } catch (error) {
      console.error('Error en la solicitud de logout:', error);
    }
  };

  const menuItems = [
    { label: 'Home', icon: AiOutlineHome, page: 'home' },
    { label: 'Clientes', icon: FaUsers, page: 'clientes' },
    { label: 'Oportunidades', icon: FaBoxes, page: 'oportunidades' },
  ];

  return (
    <div
      className={`bg-gray-900 text-white h-screen p-5 pt-8 relative duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Botón de colapso */}
      <button
        className={`absolute top-9 -right-3 w-7 h-7 bg-blue-500 text-white rounded-full transition-transform ${
          isCollapsed ? 'rotate-180' : ''
        }`}
        onClick={handleToggle}
      >
        {isCollapsed ? '>' : '<'}
      </button>

      <div className="flex flex-col items-center">
        {/* Imagen y nombre de usuario */}
        <div className="flex flex-col items-center mt-4">
          <img src="https://via.placeholder.com/150" alt="User" className="w-16 h-16 rounded-full mb-4" />
          {!isCollapsed && (
            <>
              <span className="text-center font-semibold">{username}</span>
              <span className="text-center text-sm text-gray-400">{role}</span>
            </>
          )}
        </div>

        {/* Menú principal */}
        <div className="mt-8 flex flex-col space-y-1 w-full">
          {menuItems.map(({ label, icon: Icon, page }, index) => (
            <Tooltip title={isCollapsed ? label : ''} key={index} placement="right" arrow>
              <div
                onClick={() => handlePageChange(page)}
                className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors ${
                  !isCollapsed && 'justify-start'
                }`}
              >
                <Icon className="text-2xl" />
                {!isCollapsed && <span className="ml-4">{label}</span>}
              </div>
            </Tooltip>
          ))}

          {/* Menú desplegable Cotizaciones */}
          <Tooltip title={isCollapsed ? 'Cotizaciones' : ''} placement="right" arrow>
            <div
              className={`relative w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700 ${
                !isCollapsed && 'justify-start'
              }`}
              onClick={toggleCotizacionesMenu}
            >
              <div className="relative">
                <FaClipboardList className="text-2xl" />
                {/* Indicador de notificación en la esquina superior derecha del ícono */}
                {pendingCotizaciones > 0 && (
                  <span className="absolute top-0 left-0 h-2 w-2 bg-red-600 rounded-full"></span>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex justify-between w-full">
                  <span className="ml-4">Cotizaciones</span>
                  <span>{isCotizacionesOpen ? '▲' : '▼'}</span>
                </div>
              )}
            </div>
          </Tooltip>
          {!isCollapsed && isCotizacionesOpen && (
            <div className="ml-8 space-y-1">
              {role === 'Gerente de Operaciones' ? (
                <>
                  <div className="w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700" onClick={() => handlePageChange('cotizaciones-pendientes')}>
                    <div className="relative">
                      <FaAddressBook className="text-l" />
                      {pendingCotizaciones > 0 && (
                        <span className="absolute top-0 left-0 h-1.5 w-2 bg-red-600 rounded-full"></span>
                      )}
                    </div>
                    <span className="ml-4">C. Pendientes</span>
                  </div>
                  <div className="w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700" onClick={() => handlePageChange('historial-cotizaciones')}>
                    <FaAddressBook className="text-l" />
                    <span className="ml-4">C. Historial</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700" onClick={() => handlePageChange('cotizaciones-pendientes')}>
                    <FaAddressBook className="text-l" />
                    <span className="ml-4">C. Pendientes</span>
                  </div>
                  <div className="w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700" onClick={() => handlePageChange('historial-cotizaciones')}>
                    <FaAddressBook className="text-l" />
                    <span className="ml-4">C. Historial</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Menú desplegable Administrador */}
          {isAdmin && (
            <Tooltip title={isCollapsed ? 'Administrador' : ''} placement="right" arrow>
              <div
                className={`w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700 ${
                  !isCollapsed && 'justify-start'
                }`}
                onClick={toggleAdminMenu}
              >
                <FaUsers className="text-2xl" />
                {!isCollapsed && (
                  <div className="flex justify-between w-full">
                    <span className="ml-4">Administrador</span>
                    <span>{isAdminOpen ? '▲' : '▼'}</span>
                  </div>
                )}
              </div>
            </Tooltip>
          )}
          {!isCollapsed && isAdminOpen && (
            <div className="ml-8 space-y-1">
              <div className="w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700" onClick={() => handlePageChange('usuarios')}>
                <FaUsers className="text-l" />
                <span className="ml-4">Usuarios</span>
              </div>
              <div className="w-full flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700" onClick={() => handlePageChange('conceptos')}>
                <FaBook className="text-l" />
                <span className="ml-4">Conceptos</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout siempre en la parte inferior */}
      <Tooltip title={isCollapsed ? 'Logout' : ''} placement="right" arrow>
        <div
          className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors w-full"
          onClick={handleLogout}
        >
          <BiLogOut className="text-2xl" />
          {!isCollapsed && <span className="ml-4">Logout</span>}
        </div>
      </Tooltip>
    </div>
  );
};

export default Sidebar;
