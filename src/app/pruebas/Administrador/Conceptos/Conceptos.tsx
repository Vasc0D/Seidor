// Conceptos.tsx

import { useEffect, useState } from 'react';
import LicenciasSAPTable from './LicenciasSAP/LicenciasSAP';
import LicenciasSeidorTable from './LicenciasSeidor/LicenciasSeidor';
import CrearConceptoModal from './CrearConceptoModal';
import CrearLicenciasSAP from './LicenciasSAP/CrearLicenciaSAPModal';
import { Button } from '@/components/ui/button';
import CrearLicenciasSeidor from './LicenciasSeidor/CrearLicenciaSeidorModal';

const Conceptos = () => {
  const [tipoConcepto, setTipoConcepto] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showLicenciaSAPModal, setShowLicenciaSAPModal] = useState(false);
  const [showLicenciaSeidorModal, setShowLicenciaSeidorModal] = useState(false);
  const [selectedConceptType, setSelectedConceptType] = useState<string | null>(null);
  const [licenciasSeidor, setLicenciasSeidor] = useState<any[]>([]);
  const [licenciasSAP, setLicenciasSAP] = useState<any[]>([]);

  const handleTipoConceptoChange = (tipo: string) => {
    setTipoConcepto(tipo);
  };

  const fetchLicenciasSAP = async () => {
    try {
      const response = await fetch(process.env.API_IP + '/api/licencias_sap', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al obtener las licencias');
      const data = await response.json();
      setLicenciasSAP(data);
    } catch (error) {
      console.error('Error al obtener licencias:', error);
    }
  };

  const fetchLicenciasSeidor = async () => {
    try {
      const response = await fetch(process.env.API_IP + '/api/licencias_seidor', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al obtener las licencias');
      const data = await response.json();
      setLicenciasSeidor(data);
    } catch (error) {
      console.error('Error al obtener licencias:', error);
    }
  }

  useEffect(() => {
    fetchLicenciasSAP();
    fetchLicenciasSeidor();
  }, []);

  // Actualización optimista: Crear licencia y actualizar estado
  const handleLicenciaSAPCreate = (newLicencia: any) => {
    setLicenciasSAP((prev) => [...prev, newLicencia]); // Agrega la nueva licencia al estado
  };

  // Actualización optimista: Editar licencia y actualizar estado
  const handleLicenciaSAPUpdate = (updatedLicencia: any) => {
    setLicenciasSAP((prev) =>
      prev.map((licencia) =>
        licencia.id === updatedLicencia.id ? updatedLicencia : licencia
      )
    );
  };

  // Actualización optimista: Eliminar licencia y actualizar estado
  const handleLicenciaSAPDelete = (deletedLicenciaId: string) => {
    setLicenciasSAP((prev) =>
      prev.filter((licencia) => licencia.id !== deletedLicenciaId)
    );
  };

  const handleLicenciasSeidorCreate = (newLicencia: any) => {
    console.log("Nueva licencia Seidor:", newLicencia);
    setLicenciasSeidor((prev) => [...prev, newLicencia]);
  };

  const handleLicenciasSeidorUpdate = (updatedLicencia: any) => {
    setLicenciasSeidor((prev) =>
      prev.map((licencia) =>
        licencia.id === updatedLicencia.id ? updatedLicencia : licencia
      )
    );
  }

  const handleLicenciasSeidorDelete = (deletedLicenciaId: string) => {
    setLicenciasSeidor((prev) =>
      prev.filter((licencia) => licencia.id !== deletedLicenciaId)
    );
  }

  const handleCreateConcept = (conceptType: string) => {
    console.log('Concepto creado:', conceptType);
    setSelectedConceptType(conceptType);
    if (conceptType === 'SAP') {
      setShowLicenciaSAPModal(true);
    } else if (conceptType === 'Seidor') {
      setShowLicenciaSeidorModal(true);
    }
  };
  
  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold mb-4">Conceptos</h1>
      
      {/* Seleccionar entre LicenciasSAP o LicenciasSeidor */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => handleTipoConceptoChange('LicenciasSAP')}
          className={`px-4 py-2 rounded-lg ${tipoConcepto === 'LicenciasSAP' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Licencias SAP
        </button>
        <button
          onClick={() => handleTipoConceptoChange('LicenciasSeidor')}
          className={`px-4 py-2 rounded-lg ${tipoConcepto === 'LicenciasSeidor' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Licencias Seidor
        </button>
      </div>

      {/* Renderizar la tabla de Licencias dependiendo de la selección */}
      {tipoConcepto === 'LicenciasSAP' && (
        <LicenciasSAPTable 
          licencias={licenciasSAP}
          onLicenciaUpdate={handleLicenciaSAPUpdate}
          onLicenciaDelete={handleLicenciaSAPDelete}
        />
      )}

      {tipoConcepto === 'LicenciasSeidor' && (
        <LicenciasSeidorTable 
          licencias={licenciasSeidor}
          onLicenciaUpdate={handleLicenciasSeidorUpdate}
          onLicenciaDelete={handleLicenciasSeidorDelete}
        />
      )}

      {/* espacio para el botón flotante */}
      <div className='h-24'></div>

      {/* Botón para crear un concepto, alineado a la derecha y al final */}
      <div className="absolute bottom-10 right-10 p-10">
        <Button onClick={() => setShowModal(true)} className="bg-blue-500 text-white rounded">
          Crear Concepto
        </Button>
      </div>

      {/* Modal para crear concepto */}
      <CrearConceptoModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onCreateConcept={handleCreateConcept} 
      />

      {/* Modal para crear Licencias SAP */}
      {selectedConceptType === 'SAP' && (
        <CrearLicenciasSAP
          isOpen={showLicenciaSAPModal} 
          onClose={() => setShowLicenciaSAPModal(false)}
          onLicenciaCreate={handleLicenciaSAPCreate}
        />
      )}

      {/* Modal para crear Licencias Seidor */}
      {selectedConceptType === 'Seidor' && (
        <CrearLicenciasSeidor
          isOpen={showLicenciaSeidorModal}
          onClose={() => setShowLicenciaSeidorModal(false)}
          onLicenciaCreate={handleLicenciasSeidorCreate}
        />
      )}
    </div>
  );
};

export default Conceptos;
