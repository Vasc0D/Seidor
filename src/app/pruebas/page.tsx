'use client'

import Sidebar from './sidebar';
import { useState, useEffect } from 'react';
import Usuarios from './Administrador/Usuarios/Usuarios';  // Asegúrate de que Usuarios.tsx esté correctamente implementado
// import Conceptos from './Conceptos'; // Importa el componente Conceptos si ya lo tienes o planeas crear uno
import Clientes from './Clientes/Clientes';
import Oportunidades from './Oportunidades/Oportunidades';
import Conceptos from './Administrador/Conceptos/Conceptos';
import CotizacionesPendientes from './SolicitudCotizaciones/cotizacionesPendientesGerenteOperaciones'; // Importar
import HistorialCotizaciones from './SolicitudCotizaciones/historialCotizacionesGerenteOperaciones'; // Importar
import CotizacionesPendientesGeneral from './SolicitudCotizaciones/cotizacionesPendientesGeneral'; // Importar

const Page = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('home');

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handlePageChange = (page: string) => {
    setActivePage(page);
  };

  const [role, setRole] = useState('');

  // Obtener el rol del usuario
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('http://localhost:5015/api/user', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setRole(data.role); // Guardamos el rol del usuario
        } else {
          console.error('Error al obtener el rol del usuario');
        }
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <div className="flex">
      {/* Sidebar con las opciones */}
      <Sidebar
        isCollapsed={isCollapsed}
        handleToggle={handleToggle}
        handlePageChange={handlePageChange}
      />

      {/* Contenido dinámico según la página seleccionada */}
      <div className="flex-1 p-10">
        {activePage === 'home' && (
          <div>
            <h1 className="text-3xl font-bold">Página de Inicio</h1>
            <p>Contenido principal de la página de inicio.</p>
          </div>
        )}

        {/* Mostrar sección de cotizaciones según el rol */}
        {activePage === 'cotizaciones-pendientes' && (
          <div>
            {role === 'Gerente de Operaciones' ? (
              <CotizacionesPendientes />
            ) : (
              <CotizacionesPendientesGeneral />
            )}
          </div>
        )}

        {activePage === 'historial-cotizaciones' && (
          <div>
            <HistorialCotizaciones />
          </div>
        )}

        {activePage === 'usuarios' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>
            <Usuarios /> {/* Muestra el componente Usuarios */}
          </div>
        )}

        {activePage === 'clientes' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Clientes</h1>
            <Clientes /> {/* Muestra el componente Clientes */}
          </div>
        )}

        {/* Oportunidades */}
        {activePage === 'oportunidades' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Oportunidades</h1>
            <Oportunidades />
          </div>
        )}

        {/* Conceptos */}

        {activePage === 'conceptos' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Conceptos</h1>
            <Conceptos />
          </div>
        )}

        {activePage === 'logout' && (
          <div>
            <h1 className="text-3xl font-bold">Cerrando Sesión...</h1>
            {/* Lógica de logout */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
