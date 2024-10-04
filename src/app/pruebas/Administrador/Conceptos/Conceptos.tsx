import { useState } from 'react';
import LicenciasSAPTable from './LicenciasSAP';

const Conceptos = () => {
  const [tipoConcepto, setTipoConcepto] = useState<string | null>(null);

  const handleTipoConceptoChange = (tipo: string) => {
    setTipoConcepto(tipo);
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
{/* 
      {tipoConcepto === 'LicenciasSeidor' && (
        // <LicenciasSeidorTable />
      )} */}
    </div>
  );
};

export default Conceptos;
