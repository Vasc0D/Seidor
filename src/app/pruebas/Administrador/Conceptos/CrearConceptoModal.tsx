import { useState } from 'react';
import { Select, SelectItem, SelectTrigger, SelectContent } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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
            <Select onValueChange={(value) => setConceptType(value)}>
              <SelectTrigger className="w-full">
                <span>{conceptType || "Seleccione una opción"}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAP">Licencia SAP</SelectItem>
                <SelectItem value="Seidor">Licencia Seidor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleCreate} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
              Crear
            </Button>
            <Button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    ) : null
  );
};

export default CrearConceptoModal;
