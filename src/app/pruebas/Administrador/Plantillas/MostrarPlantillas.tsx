import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Plantilla {
  id: string;
  nombre: string;
  conceptos: any[];
}

interface MostrarPlantillasProps {
  onEditar: (plantilla: Plantilla) => void;
}

const MostrarPlantillas: React.FC<MostrarPlantillasProps> = ({ onEditar }) => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar las plantillas desde el backend
  useEffect(() => {
    const fetchPlantillas = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_IP}/api/plantillas/`);
        if (response.ok) {
          const data = await response.json();
          setPlantillas(data);
        } else {
          console.error("Error al cargar las plantillas.");
        }
      } catch (error) {
        console.error("Error al cargar las plantillas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlantillas();
  }, []);

  // Eliminar una plantilla
  const handleEliminarPlantilla = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta plantilla?")) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_IP}/api/plantillas/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          alert("Plantilla eliminada exitosamente.");
          setPlantillas(plantillas.filter((plantilla) => plantilla.id !== id));
        } else {
          alert("Error al eliminar la plantilla.");
        }
      } catch (error) {
        console.error("Error al eliminar la plantilla:", error);
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4">Plantillas Creadas</h1>
      {isLoading ? (
        <p>Cargando plantillas...</p>
      ) : (
        <table className="w-full border-collapse bg-gray-50 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700 font-semibold">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {plantillas.map((plantilla) => (
              <tr key={plantilla.id} className="text-center">
                <td className="p-2 border">{plantilla.id}</td>
                <td className="p-2 border">{plantilla.nombre}</td>
                <td className="p-2 border">
                  <Button onClick={() => onEditar(plantilla)} className="mr-2">
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleEliminarPlantilla(plantilla.id)}
                    variant="destructive"
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MostrarPlantillas;
