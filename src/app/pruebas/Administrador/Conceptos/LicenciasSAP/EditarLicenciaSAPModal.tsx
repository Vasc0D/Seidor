// EditarLicenciaSAPModal.tsx

import { useEffect , useState } from 'react';
import { Select , SelectContent , SelectItem , SelectTrigger } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EditarLicenciaSAPModalProps {
    isOpen: boolean;
    onClose: () => void;
    licencia: any;
    onLicenciaUpdate: (updatedLicencia: any) => void;
}

const EditarLicenciaSAPModal: React.FC<EditarLicenciaSAPModalProps> = ({ isOpen, onClose, licencia, onLicenciaUpdate }) => {
    const [licenciaData, setLicenciaData] = useState<any>(null);
    const [priceRanges, setPriceRanges] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      if(licencia) {
          setLicenciaData(licencia);
          setPriceRanges(licencia.price_ranges || []);
      }
    } , [licencia]);
    
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:5015/api/licencias_sap/${licenciaData.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...licenciaData,
                    price_ranges: priceRanges
                })
            });

            if(!response.ok) {
                throw new Error('Error al actualizar la licencia SAP');
            }

            const updatedLicencia = { ...licenciaData, price_ranges: priceRanges };
            onLicenciaUpdate(updatedLicencia);
            onClose();
        } catch (error) {
            console.error('Error al actualizar la licencia SAP:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFieldChange = (field: string, value: any) => {
        setLicenciaData({
            ...licenciaData,
            [field]: value
        });
    };

    const handlePriceRangeChange = (index: number, field: string, value: any) => {
        const updateRanges = [...priceRanges];
        updateRanges[index][field] = value;
        setPriceRanges(updateRanges);
    };

    const handleAddPriceRange = () => {
        setPriceRanges([...priceRanges, { from_range: '', to_range: '', price: '' }]);
    };

    const handleRemovePriceRange = (index: number) => {
        setPriceRanges(priceRanges.filter((_, i) => i !== index));
    };

    if(!isOpen || !licenciaData) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[700px] p-8">
            <h2 className="text-lg font-bold mb-6">Editar Licencia SAP</h2>
    
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  value={licenciaData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full border rounded px-3 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <Select onValueChange={(value) => handleFieldChange('type', value)}>
                    <SelectTrigger className="w-full">
                        <span>{licenciaData.type || 'Seleccione una opción'}</span>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="On-Cloud">On-Cloud</SelectItem>
                        <SelectItem value="On-Premise">On-Premise</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Usuario</label>
                <Select onValueChange={(value) => handleFieldChange('user_type', value)}>
                <SelectTrigger className="w-full">
                    <span>{licenciaData.user_type || 'Seleccione una opción'}</span>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Named User">Named User</SelectItem>
                    <SelectItem value="Database">Database</SelectItem>
                    <SelectItem value="Product Option">Product Option</SelectItem>
                </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unidad de Venta</label>
                <Input value={licenciaData.sales_unit} onChange={(e) => handleFieldChange('sales_unit', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Métrica</label>
                <Select onValueChange={(value) => handleFieldChange('metric', value)}>
                    <SelectTrigger className="w-full">
                        <span>{licenciaData.metric || 'Seleccione una opción'}</span>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Users">Users</SelectItem>
                        <SelectItem value="Cores">Cores</SelectItem>
                        <SelectItem value="Instances">Instancias</SelectItem>
                        <SelectItem value="Devices">Devices</SelectItem>
                        <SelectItem value="GB of Memory">GB of Memory</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Cuota</label>
                <Select onValueChange={(value) => handleFieldChange('fee_type', value)}>
                    <SelectTrigger className="w-full">
                        <span>{licenciaData.fee_type || 'Seleccione una opción'}</span>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="One-Time">One-Time</SelectItem>
                        <SelectItem value="Month">Month</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Motor de Base de Datos</label>
                <Select onValueChange={(value) => handleFieldChange('db_engine', value)}>
                    <SelectTrigger className="w-full">
                        <span>{licenciaData.db_engine || 'Seleccione una opción'}</span>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="HANA">HANA</SelectItem>
                        <SelectItem value="SQL Server">SQL Server</SelectItem>
                        <SelectItem value="NULL">Null</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
    
            {/* Rangos de precios */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Rangos de Precios</h3>
              {priceRanges.map((range, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="number"
                    value={range.from_range}
                    onChange={(e) => handlePriceRangeChange(index, 'from_range', e.target.value)}
                    placeholder="Desde"
                    className="w-1/3 border rounded px-3 py-1"
                  />
                  <input
                    type="number"
                    value={range.to_range}
                    onChange={(e) => handlePriceRangeChange(index, 'to_range', e.target.value)}
                    placeholder="Hasta"
                    className="w-1/3 border rounded px-3 py-1"
                  />
                  <input
                    type="number"
                    value={range.price}
                    onChange={(e) => handlePriceRangeChange(index, 'price', e.target.value)}
                    placeholder="Precio"
                    className="w-1/3 border rounded px-3 py-1"
                  />
                  <Button onClick={() => handleRemovePriceRange(index)} className="bg-red-500 text-white px-4 py-1 rounded">
                      X
                  </Button>
                </div>
              ))}
                <Button onClick={handleAddPriceRange} className="bg-blue-500 text-white px-4 py-1 rounded">
                    Agregar Rango de Precio
                </Button>
            </div>
    
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 mr-2 rounded"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
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
      );
    };
    
export default EditarLicenciaSAPModal;