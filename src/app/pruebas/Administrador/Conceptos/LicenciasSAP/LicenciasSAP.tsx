// LicenciasSAP.tsx

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import EditarLicenciaSAPModal from './EditarLicenciaSAPModal';
import { on } from 'events';

interface LicenciasSAPTableProps {
  licencias: any[];
  onLicenciaUpdate: (updatedLicencia: any) => void;
  onLicenciaDelete: (licenciaId: any) => void;
}

const LicenciasSAPTable: React.FC<LicenciasSAPTableProps> = ({licencias, onLicenciaUpdate, onLicenciaDelete}) => {
  const [selectedLicencia, setSelectedLicencia] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const namedUsers = licencias.filter((licencia) => licencia.user_type === 'Named User');
  const databases = licencias.filter((licencia) => licencia.user_type === 'Database');
  const productOptions = licencias.filter((licencia) => licencia.user_type === 'Product Option');
  const onCloudLicenses = licencias.filter((licencia) => licencia.type === 'On-Cloud');

  const renderPriceRanges = (priceRanges: any[]) => {
    return priceRanges.map((range, index) => (
      <div key={index}>
        <span>From: {range.from_range} - To: {range.to_range || 'Infinite'} - Price: ${range.price}</span>
      </div>
    ));
  };

  const handleEditLicense = (licencia: string) => {
    console.log('Editando licencia:', licencia);
    setSelectedLicencia(licencia);
    setIsEditModalOpen(true);
  };

  const handleDeleteLicense = async (licenseId: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta licencia?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_IP}/api/licencias_sap/${licenseId}`, {
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
  }

  const renderTableSection = (title: string, data: any[]) => (
    <>
      <thead>
        <tr>
          <th colSpan={7} className="bg-gray-100 font-bold py-2 px-4 text-left">{title}</th>
        </tr>
        <tr>
          <th className="py-2 px-4 border-b">ID</th>
          <th className="py-2 px-4 border-b">Nombre</th>
          <th className="py-2 px-4 border-b">Tipo</th>
          <th className="py-2 px-4 border-b">Fee</th>
          <th className="py-2 px-4 border-b">Rangos de Precios</th>
          <th className="py-2 px-4 border-b">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map((licencia) => (
          <tr key={licencia.id}>
            <td className="px-4 py-2 border-b">{licencia.id}</td>
            <td className="px-4 py-2 border-b">{licencia.name}</td>
            <td className="px-4 py-2 border-b">{licencia.type}</td>
            <td className="px-4 py-2 border-b">{licencia.fee_type}</td>
            <td className="px-4 py-2 border-b">{renderPriceRanges(licencia.price_ranges)}</td>
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
    <div className="relative"> {/* Contenedor principal para permitir el botón flotante */}
      <div className="overflow-x-auto max-h-96 mb-4"> {/* Tabla con scroll */}
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          {renderTableSection('SAP Business One Named Users', namedUsers)}
          {renderTableSection('SAP Business One Product Options', productOptions)}
          {renderTableSection('SAP Business One Databases', databases)}
          {renderTableSection('SAP Business One On-Cloud', onCloudLicenses)}
        </table>
      </div>

      <EditarLicenciaSAPModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        licencia={selectedLicencia}
        onLicenciaUpdate={onLicenciaUpdate}
      />
    </div>
  );
};

export default LicenciasSAPTable;
