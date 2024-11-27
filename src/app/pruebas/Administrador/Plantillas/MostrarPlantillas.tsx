import { useEffect, useState } from "react";

interface RecursoPlantilla {
  id: string;
  recurso: string;
  tarifa_lista: number;
  tarifa_venta: number;
  preparacion: number;
  bbp: number;
  r_dev: number;
  r_pya: number;
  pi_pya: number;
  pi_deply: number;
  acompanamiento: number;
  total_dias: number;
  total_venta: number;
  costo_venta: number;
  margen_venta: number;
  porcentaje_margen: number;
}

interface ConceptoPlantilla {
  id: string;
  nombre_concepto: string;
  recursos: RecursoPlantilla[];
}

interface Plantilla {
  id: string;
  nombre: string;
  conceptos: ConceptoPlantilla[];
}

const MostrarPlantillas: React.FC = () => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Obtener las plantillas desde la API
    const fetchPlantillas = async () => {
      try {
        const response = await fetch(process.env.API_IP + "/api/plantillas/");
        if (response.ok) {
          const data = await response.json();
          setPlantillas(data);
        } else {
          console.error("Error al obtener las plantillas");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantillas();
  }, []);

  if (loading) {
    return <div className="text-center">Cargando plantillas...</div>;
  }

  const handleVerPlantilla = (plantilla: Plantilla) => {
    console.log("Ver plantilla:", plantilla);
    // Redirigir o abrir modal
  };

  const handleEliminarPlantilla = async (id: string) => {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar esta plantilla?");
    if (!confirmacion) return;
  
    try {
      const response = await fetch(process.env.API_IP + `/api/plantillas/${id}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        alert("Plantilla eliminada exitosamente");
        setPlantillas((prev) => prev.filter((plantilla) => plantilla.id !== id));
      } else {
        alert("Error al eliminar la plantilla");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4">Plantillas Creadas</h1>
      {plantillas.length === 0 ? (
        <p className="text-gray-500">No hay plantillas creadas aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Conceptos</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {plantillas.map((plantilla) => (
                <tr key={plantilla.id}>
                  <td className="border border-gray-300 px-4 py-2">{plantilla.nombre}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {plantilla.conceptos.map((concepto) => (
                      <div key={concepto.id} className="mb-1">
                        <span className="font-semibold">{concepto.nombre_concepto}</span> - {concepto.recursos.length} recursos
                      </div>
                    ))}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="px-2 py-1 bg-blue-500 text-white text-sm rounded"
                      onClick={() => handleVerPlantilla(plantilla)}
                    >
                      Ver
                    </button>
                    <button
                      className="ml-2 px-2 py-1 bg-red-500 text-white text-sm rounded"
                      onClick={() => handleEliminarPlantilla(plantilla.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MostrarPlantillas;
