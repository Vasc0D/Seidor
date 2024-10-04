import { useEffect, useState } from 'react';

const LicenciasSAPTable = () => {
  const [licenciasSAP, setLicenciasSAP] = useState<any[]>([]);
  const [namedUsers, setNamedUsers] = useState<any[]>([]);
  const [databases, setDatabases] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [onCloudLicenses, setOnCloudLicenses] = useState<any[]>([]); // Nueva categoría para On-Cloud

  useEffect(() => {
    // Obtener las licencias SAP desde el backend
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

        // Filtrar las licencias en las categorías correspondientes
        const namedUsersData = data.filter((licencia: any) => licencia.user_type === 'Named User');
        const databasesData = data.filter((licencia: any) => licencia.user_type === 'Database');
        const productOptionsData = data.filter((licencia: any) => licencia.user_type === 'Product Option');
        const onCloudData = data.filter((licencia: any) => licencia.type === 'On-Cloud'); // Filtrar On-Cloud

        setNamedUsers(namedUsersData);
        setDatabases(databasesData);
        setProductOptions(productOptionsData);
        setOnCloudLicenses(onCloudData); // Guardar On-Cloud en su categoría
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 text-sm">
        {/* Sección para SAP Business One Named Users */}
        <thead>
          <tr>
            <th colSpan={7} className="bg-gray-100 font-bold py-2 px-4 text-left">SAP Business One Named Users</th>
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
          {namedUsers.map((licencia) => (
            <tr key={licencia.id}>
              <td className="px-4 py-2 border-b">{licencia.id}</td>
              <td className="px-4 py-2 border-b">{licencia.name}</td>
              <td className="px-4 py-2 border-b">{licencia.type}</td>
              <td className="px-4 py-2 border-b">{licencia.fee_type}</td>
              <td className="px-4 py-2 border-b">{renderPriceRanges(licencia.price_ranges)}</td>
            </tr>
          ))}
        </tbody>

        {/* Sección para SAP Business One Product Options */}
        <thead>
          <tr>
            <th colSpan={7} className="bg-gray-100 font-bold py-2 px-4 text-left">SAP Business One Product Options</th>
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
          {productOptions.map((licencia) => (
            <tr key={licencia.id}>
              <td className="px-4 py-2 border-b">{licencia.id}</td>
              <td className="px-4 py-2 border-b">{licencia.name}</td>
              <td className="px-4 py-2 border-b">{licencia.type}</td>
              <td className="px-4 py-2 border-b">{licencia.fee_type}</td>
              <td className="px-4 py-2 border-b">{renderPriceRanges(licencia.price_ranges)}</td>
            </tr>
          ))}
        </tbody>

        {/* Sección para SAP Business One Databases */}
        <thead>
          <tr>
            <th colSpan={7} className="bg-gray-100 font-bold py-2 px-4 text-left">SAP Business One Databases</th>
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
          {databases.map((licencia) => (
            <tr key={licencia.id}>
              <td className="px-4 py-2 border-b">{licencia.id}</td>
              <td className="px-4 py-2 border-b">{licencia.name}</td>
              <td className="px-4 py-2 border-b">{licencia.type}</td>
              <td className="px-4 py-2 border-b">{licencia.fee_type}</td>
              <td className="px-4 py-2 border-b">{renderPriceRanges(licencia.price_ranges)}</td>
            </tr>
          ))}
        </tbody>

        {/* Sección para SAP Business One On-Cloud */}
        <thead>
          <tr>
            <th colSpan={7} className="bg-gray-100 font-bold py-2 px-4 text-left">SAP Business One On-Cloud</th>
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
          {onCloudLicenses.map((licencia) => (
            <tr key={licencia.id}>
              <td className="px-4 py-2 border-b">{licencia.id}</td>
              <td className="px-4 py-2 border-b">{licencia.name}</td>
              <td className="px-4 py-2 border-b">{licencia.type}</td>
              <td className="px-4 py-2 border-b">{licencia.fee_type}</td>
              <td className="px-4 py-2 border-b">{renderPriceRanges(licencia.price_ranges)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LicenciasSAPTable;
