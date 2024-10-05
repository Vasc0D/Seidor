import { useState } from 'react';

interface CrearConceptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConcept: (conceptType: string) => void;
}

const CrearConceptoModal: React.FC<CrearConceptoModalProps> = ({ isOpen, onClose, onCreateConcept }) => {
  const [conceptType, setConceptType] = useState('');

  const handleCreate = () => {
    if (conceptType) {
      onCreateConcept(conceptType);
      onClose();
    }
  };

  return (
    isOpen ? (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-96 p-6">
          <h2 className="text-lg font-bold mb-4">Crear Concepto</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Concepto</label>
            <select
              value={conceptType}
              onChange={(e) => setConceptType(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Seleccione una opción</option>
              <option value="SAP">Licencia SAP</option>
              <option value="Seidor">Licencia Seidor</option>
            </select>
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={handleCreate} 
              className="bg-blue-500 text-white px-4 py-2 mr-2 rounded"
            >
              Crear
            </button>
            <button 
              onClick={onClose} 
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    ) : null
  );
};

export default CrearConceptoModal;
