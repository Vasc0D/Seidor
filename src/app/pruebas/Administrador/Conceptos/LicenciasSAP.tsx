import { useEffect, useState } from 'react';

const LicenciasSAPTable = () => {
  const [namedUsers, setNamedUsers] = useState<any[]>([]);
  const [databases, setDatabases] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [onCloudLicenses, setOnCloudLicenses] = useState<any[]>([]);

  useEffect(() => {
    const fetchLicenciasSAP = async () => {
      try {
        const response = await fetch('http://localhost:5015/api/licencias_sap', { 
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.status);
        }

        const data = await response.json();
        setNamedUsers(data.filter((licencia: any) => licencia.user_type === 'Named User'));
        setDatabases(data.filter((licencia: any) => licencia.user_type === 'Database'));
        setProductOptions(data.filter((licencia: any) => licencia.user_type === 'Product Option'));
        setOnCloudLicenses(data.filter((licencia: any) => licencia.type === 'On-Cloud'));
      } catch (error) {
        console.error('Error al obtener las licencias SAP:', error);
      }
    };

    fetchLicenciasSAP();
  }, []);

  const renderPriceRanges = (priceRanges: any[]) => {
    return priceRanges.map((range, index) => (
      <div key={index}>
        <span>From: {range.from_range} - To: {range.to_range || 'Infinite'} - Price: ${range.price}</span>
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
          <th className="py-2 px-4 border-b">Tipo</th>
          <th className="py-2 px-4 border-b">Fee</th>
          <th className="py-2 px-4 border-b">Rangos de Precios</th>
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
    </div>
  );
};

export default LicenciasSAPTable;
