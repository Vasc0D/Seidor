import { ChakraProvider } from "@chakra-ui/react";
import Detalles from './detalles/page'; // Asegúrate de ajustar la ruta de importación

function App() {
  return (
    <ChakraProvider>
      <Detalles /> {/* Renderiza el componente Detalles donde tienes tu tabla */}
    </ChakraProvider>
  );
}

export default App;