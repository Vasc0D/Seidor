// EditarLicenciaSeidorModal.tsx

import { useEffect, useState } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EditarLicenciaSeidorModalProps {
  isOpen: boolean;
  onClose: () => void;
  licencia: any;
  onLicenciaUpdate: (updatedLicencia: any) => void;
}

const EditarLicenciaSeidorModal: React.FC<EditarLicenciaSeidorModalProps> = ({ isOpen, onClose, licencia, onLicenciaUpdate }) => {
  const [licenciaData, setLicenciaData] = useState<any>(null);
  const [priceOP, setPriceOP] = useState<number>(0);
  const [priceOC, setPriceOC] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (licencia) {
      setLicenciaData(licencia);
      
      const opPrice = licencia.price_type.find((price: any) => price.type === 'On-Premise');
      const ocPrice = licencia.price_type.find((price: any) => price.type === 'On-Cloud');

      setPriceOP(opPrice ? opPrice.price : 0);
      setPriceOC(ocPrice ? ocPrice.price : 0);
    }
  } , [licencia]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(process.env.API_IP + `/api/licencias_seidor/${licenciaData.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...licenciaData,
          price_op: priceOP,
          price_oc: priceOC,
        }),
      });

      console.log('Actualizando licencia Seidor:', licenciaData);

      if (!response.ok) {
        throw new Error('Error al actualizar la licencia Seidor');
      }

      const updatedLicencia = { ...licenciaData, price_op: priceOP, price_oc: priceOC };
      onLicenciaUpdate(updatedLicencia);
      onClose();
    } catch (error) {
      console.error('Error al actualizar la licencia Seidor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setLicenciaData({
      ...licenciaData,
      [field]: value,
    });
  };

  if (!isOpen || !licenciaData) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-[600px] p-6">
        <h2 className="text-lg font-bold mb-4">Editar Licencia Seidor</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">ID</label>
            <Input
              value={licenciaData.id}
              onChange={(e) => handleFieldChange('id', e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nombre de la Licencia</label>
            <Input
              value={licenciaData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Usuario</label>
            <Select onValueChange={(value) => handleFieldChange('user_type', value)}>
              <SelectTrigger className="w-full">
                <span>{licenciaData.user_type || 'Seleccione una opción'}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Horizontal">Horizontal</SelectItem>
                <SelectItem value="Vertical">Vertical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Tarifa</label>
            <Select onValueChange={(value) => handleFieldChange('fee_type', value)}>
              <SelectTrigger className="w-full">
                <span>{licenciaData.fee_type || 'Seleccione una opción'}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="One-time">One-time</SelectItem>
                <SelectItem value="x cada N usuarios">Usuarios Ilimitados</SelectItem>
                <SelectItem value="x cada 5 Razones Sociales">x cada 5 Razones Sociales</SelectItem>
                <SelectItem value="x cada 2,000 Consultas">x cada 2,000 Consultas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Precio On-Premise</label>
            <Input
              value={priceOP}
              onChange={(e) => setPriceOP(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Precio On-Cloud</label>
            <Input
              value={priceOC}
              onChange={(e) => setPriceOC(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded mr-2" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditarLicenciaSeidorModal;
