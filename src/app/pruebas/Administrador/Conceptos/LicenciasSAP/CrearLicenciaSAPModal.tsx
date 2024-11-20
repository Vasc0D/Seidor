// CrearLicenciaSAPModal.tsx

import React, { useState } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
 
interface CrearLicenciasSAPModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLicenciaCreate: (newLicencia: any) => void;
}

interface PriceRange {
    from_range: number | '';
    to_range: number | '' | null;
    price: number | '';
}

const CrearLicenciasSAPModal: React.FC<CrearLicenciasSAPModalProps> = ({ isOpen, onClose, onLicenciaCreate }) => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [userType, setUserType] = useState('');
    const [salesUnit, setSalesUnit] = useState('');
    const [metric, setMetric] = useState('');
    const [feeType, setFeeType] = useState('');
    const [dbengine, setDbEngine] = useState<string | null>(null);
    const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        const isValid = priceRanges.every(
            (range) => range.from_range !== '' && range.price !== '' && range.from_range !== null && range.price !== null
        );
    
        if (!isValid) {
            alert('Todos los rangos de precios deben tener un valor válido en "Desde" y "Precio".');
            return;
        }

        setIsSubmitting(true);  // Inicia el estado de carga
        try {
            // Prepara los datos a enviar
            const licenciaData = {
                id,
                name,
                type,
                user_type: userType,
                sales_unit: salesUnit,
                metric,
                fee_type: feeType,
                db_engine: dbengine,
                price_ranges: priceRanges,
            };

            // Realiza la solicitud POST al backend
            const response = await fetch('http://localhost:5015/api/licencias_sap', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                },
                body: JSON.stringify(licenciaData)
            });

            if (!response.ok) {
                throw new Error('Error al crear la licencia SAP');
            }

            const newLicencia = await response.json();  // Obtener la nueva licencia creada
            onLicenciaCreate(newLicencia);
            console.log('Nueva licencia SAP:', newLicencia);
            // Resetear los estados o cerrar el modal si es necesario
            onClose();

        } catch (error) {
            console.error('Error en la solicitud:', error);
            alert('Hubo un error al crear la licencia SAP. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false); // Finaliza el estado de carga
        }
    };

    const handlePriceRangeChange = (index: number, field: keyof PriceRange, value: string) => {
        const updatedRanges = [...priceRanges];
        if (field === 'to_range') {
            updatedRanges[index][field] = value === '' ? null : parseFloat(value);
        } else {
            updatedRanges[index][field] = value === '' ? '' : parseFloat(value); // Mantén '' si está vacío, no null
        }
        setPriceRanges(updatedRanges);
    };
    

    const handleAddPriceRange = () => {
        setPriceRanges([...priceRanges, { from_range: '', to_range: '', price: '' }]);
    };

    const handleRemovePriceRange = (index: number) => {
        setPriceRanges(priceRanges.filter((_, i) => i !== index));
    };
    
    return (
        isOpen ? (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg w-[700px] p-8">
                    <h2 className="text-lg font-bold mb-6">Crear Licencia SAP</h2>

                    {/* Organizar en dos columnas */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">ID</label>
                            <input
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                className="w-full border rounded px-3 py-1"
                                placeholder='7011027'
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Nombre</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border rounded px-3 py-1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tipo</label>
                            <Select onValueChange={(value) => setType(value)}>
                                <SelectTrigger className="w-full">
                                    <span>{type || "Seleccione una opción"}</span>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="On-Premise">On-Premise</SelectItem>
                                    <SelectItem value="On-Cloud">On-Cloud</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tipo de Usuario</label>
                            <Select onValueChange={(value) => setUserType(value)}>
                                <SelectTrigger className="w-full">
                                    <span>{userType || "Seleccione una opción"}</span>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Named User">Named User</SelectItem>
                                    <SelectItem value="Database">Database</SelectItem>
                                    <SelectItem value="Partner Hosted Option">Partner Hosted Option</SelectItem>
                                    <SelectItem value="Product Option">Product Option</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Unidad de Venta</label>
                            <input
                                value={salesUnit}
                                onChange={(e) => setSalesUnit(e.target.value)}
                                className="w-full border rounded px-3 py-1"
                                placeholder='1 - 64'
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Métrica</label>
                            <Select onValueChange={(value) => setMetric(value)}>
                                <SelectTrigger className="w-full">
                                    <span>{metric || "Seleccione una opción"}</span>
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
                            <Select onValueChange={(value) => setFeeType(value)}>
                                <SelectTrigger className="w-full">
                                    <span>{feeType || "Seleccione una opción"}</span>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="One Time">One Time</SelectItem>
                                    <SelectItem value="Month">Month</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Motor de Base de Datos</label>
                            <Select onValueChange={(value) => setDbEngine(value === "Ninguna" ? null : value)}>
                                <SelectTrigger className="w-full">
                                    <span>{dbengine || "Seleccione una opción"}</span>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HANA">HANA</SelectItem>
                                    <SelectItem value="SQL Server">SQL</SelectItem>
                                    <SelectItem value="Ninguna">Ninguna</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Gestión de rangos de precios */}
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
                                    value={range.to_range === null ? '' : range.to_range}
                                    onChange={(e) => handlePriceRangeChange(index, 'to_range', e.target.value)}
                                    placeholder="Hasta (vacío para infinito)"
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
                        <Button onClick={handleAddPriceRange} className="bg-blue-500 text-white px-4 py-2 rounded">
                            Agregar Rango de Precios 
                        </Button>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded mr-2" disabled={isSubmitting}>
                            {isSubmitting ? 'Creando...' : 'Crear'}
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

export default CrearLicenciasSAPModal;
