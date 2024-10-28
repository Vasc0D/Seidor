import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';

interface CrearLicenciaSeidorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLicenciaCreate: (newLicencia: any) => void;
}

const CrearLicenciaSeidorModal: React.FC<CrearLicenciaSeidorModalProps> = ({ isOpen, onClose, onLicenciaCreate }) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('');
  const [feeType, setFeeType] = useState('');
  const [priceOP, setPriceOP] = useState<number>(0);
  const [priceOC, setPriceOC] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5015/api/licencias_seidor', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          name,
          user_type: userType,
          fee_type: feeType,
          price_op: priceOP,
          price_oc: priceOC,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la licencia Seidor');
      }

      const newLicencia = await response.json();
      console.log('Nueva licencia Seidor:', newLicencia);
      // Llamar a la función onLicenciaCreate para agregarla a la lista
      onLicenciaCreate(newLicencia);

      // Cerrar el modal después de crear la licencia
      onClose();
    } catch (error) {
      console.error('Error al crear la licencia Seidor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    isOpen ? (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-[700px] p-6">
          <h2 className="text-lg font-bold mb-4">Crear Licencia Seidor</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">ID</label>
              <Input value={id} onChange={(e) => setId(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nombre de la Licencia</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Usuario</label>
              <Select onValueChange={(value) => setUserType(value)}>
                <SelectTrigger className="w-full">
                  <span>{userType || 'Seleccione una opción'}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Horizontal">Horizontal</SelectItem>
                  <SelectItem value="Vertical">Vertical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Tarifa</label>
              <Select onValueChange={(value) => setFeeType(value)}>
                <SelectTrigger className="w-full">
                  <span>{feeType || 'Seleccione una opción'}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="One-time">One-time</SelectItem>
                  <SelectItem value="x cada N usuarios">Usuarios Ilimitados</SelectItem>
                  <SelectItem value="x cada 5 Razones Sociales">x cada 5 Razones Sociales</SelectItem>
                  <SelectItem value="x cada 2,000 Consultas">x cada 2,000 Consultas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Precio On-Premise</label>
              <Input value={priceOP} onChange={(e) => setPriceOP(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Precio On-Cloud</label>
              <Input value={priceOC} onChange={(e) => setPriceOC(Number(e.target.value))} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleCreate} className="bg-blue-500 text-white px-4 py-2 rounded mr-2" disabled={isSubmitting}>{isSubmitting ? 'Creando...' : 'Crear'}</Button>
            <Button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancelar</Button>
          </div>
        </div>
      </div>
    ) : null
  );
};

export default CrearLicenciaSeidorModal;

