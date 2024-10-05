import { useEffect, useState } from 'react';

const LicenciasSeidorTable = () => {
  const [horizontal, setHorizontal] = useState<any[]>([]);
  const [vertical, setVertical] = useState<any[]>([]);

  useEffect(() => {
    // Obtener las licencias Seidor desde el backend
    const fetchLicenciasSeidor = async () => {
      try {
        const response = await fetch('http://localhost:5015/api/licencias_seidor', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Error en la solicitud: ' + response.status);
        }

        const data = await response.json();

        // Filtrar las licencias en dos categorías (Horizontales y Verticales)
        const horizontalesData = data.filter((licencia: any) => licencia.user_type === 'Horizontal');
        const verticalesData = data.filter((licencia: any) => licencia.user_type === 'Vertical');

        setHorizontal(horizontalesData);
        setVertical(verticalesData);
      } catch (error) {
        console.error('Error al obtener las licencias Seidor:', error);
      }
    };

    fetchLicenciasSeidor();
  }, []);

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
        </tr>
      </thead>
      <tbody>
        {data.map((licencia) => (
          <tr key={licencia.id}>
            <td className="px-4 py-2 border-b">{licencia.id}</td>
            <td className="px-4 py-2 border-b">{licencia.name}</td>
            <td className="px-4 py-2 border-b">{licencia.fee_type}</td>
            <td className="px-4 py-2 border-b">{renderPriceTypes(licencia.price_type)}</td>
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
          {renderTableSection('Licencias Horizontales', horizontal)}
          {renderTableSection('Licencias Verticales', vertical)}
        </table>
        </div>
    </div>
  );
};

export default LicenciasSeidorTable;
