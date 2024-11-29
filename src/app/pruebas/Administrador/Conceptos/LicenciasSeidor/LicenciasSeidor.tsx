// LicenciasSeidor.tsx

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import EditarLicenciaSeidorModal from './EditarLicenciaSeidorModal';

interface LicenciasSeidorTableProps {
  licencias: any[];
  onLicenciaUpdate: (updatedLicencia: any) => void;
  onLicenciaDelete: (licenciaId: any) => void;
}

const LicenciasSeidorTable: React.FC<LicenciasSeidorTableProps> = ({licencias, onLicenciaUpdate, onLicenciaDelete}) => {
  const [selectedLicense, setSelectedLicense] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const horizontales = licencias.filter((licencia) => licencia.user_type === 'Horizontal');
  const verticales = licencias.filter((licencia) => licencia.user_type === 'Vertical');

  const handleEditLicense = (license: string) => {
    setSelectedLicense(license);
    setIsEditModalOpen(true);
  };

  const handleDeleteLicense = async (licenseId: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta licencia?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_IP}/api/licencias_seidor/${licenseId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Error al eliminar la licencia');
        }

        onLicenciaDelete(licenseId);
      } catch (error) {
        console.error('Error al eliminar la licencia:', error);
      }
    }
  };

  // Renderizar los precios por tipo (On-Premise, On-Cloud)
  const renderPriceTypes = (priceTypes: any[]) => {
    return priceTypes.map((priceType, index) => (
      <div key={index}>
        <span>{priceType.type}: ${priceType.price}</span>
      </div>
    ));
  };

  const renderTableSection = (title: string, data: any[]) => (
    <>
      <thead>
        <tr>
          <th colSpan={7} className="bg-gray-100 font-bold py-2 px-4 text-left">{title}</th>
        </tr>
        <tr>
          <th className="py-2 px-4 border-b">ID</th>
          <th className="py-2 px-4 border-b">Nombre</th>
          <th className="py-2 px-4 border-b">Fee</th>
          <th className="py-2 px-4 border-b">Tipos de Precios</th>
          <th className="py-2 px-4 border-b">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map((licencia) => (
          <tr key={licencia.id}>
            <td className="px-4 py-2 border-b">{licencia.id}</td>
            <td className="px-4 py-2 border-b">{licencia.name}</td>
            <td className="px-4 py-2 border-b">{licencia.fee_type}</td>
            <td className="px-4 py-2 border-b">{renderPriceTypes(licencia.price_type)}</td>
            <td className="px-4 py-2 border-b">
              <Button className="bg-yellow-400 hover:bg-yellow-300 text-white px-2 py-1 rounded mr-1" onClick={() => handleEditLicense(licencia)}>Editar</Button>
              <Button className="bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded" onClick={() => handleDeleteLicense(licencia.id)}>Eliminar</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );

  return (
    <div className="w-full p-6">
      <div className="overflow-x-auto max-h-96 mb-4"> {/* Tabla con scroll */}
        <h1 className="text-2xl font-bold mb-4">Licencias Seidor</h1>
        {/* Tabla de Licencias Seidor */}
        <table className="w-full border-collapse border border-gray-200">
          {renderTableSection('Licencias Horizontales', horizontales)}
          {renderTableSection('Licencias Verticales', verticales)}
        </table>
      </div>

      <EditarLicenciaSeidorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        licencia={selectedLicense}
        onLicenciaUpdate={onLicenciaUpdate}
      />
    </div>
  );
};

export default LicenciasSeidorTable;
