import { useState } from 'react';
import LicenciasSAPTable from './LicenciasSAP';
import LicenciasSeidorTable from './LicenciasSeidor';
import CrearConceptoModal from './CrearConceptoModal';

const Conceptos = () => {
  const [tipoConcepto, setTipoConcepto] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // Para controlar el modal

  const handleTipoConceptoChange = (tipo: string) => {
    setTipoConcepto(tipo);
  };

  const handleCreateConcept = (conceptType: string) => {
    console.log('Concepto creado:', conceptType);
    // Aquí puedes implementar la lógica para crear el concepto (por ejemplo, abrir otro modal o enviar la solicitud al backend)
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
        <LicenciasSAPTable />
      )}

      {tipoConcepto === 'LicenciasSeidor' && (
        <LicenciasSeidorTable />
      )}

      {/* espacio para el botón flotante */}
      <div className='h-24'></div>

      {/* Botón para crear un concepto, alineado a la derecha y al final */}
      <div className="absolute bottom-0 right-0 p-4">
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 mb-4 rounded shadow-lg">
          Crear Concepto
        </button>
      </div>

      {/* Modal para crear concepto */}
      <CrearConceptoModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onCreateConcept={handleCreateConcept} 
      />

    </div>
  );
};

export default Conceptos;
