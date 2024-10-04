import { ChakraProvider } from "@chakra-ui/react";
import Home from './pruebas/page'; // Asegúrate de ajustar la ruta de importación

function App() {
  return (
    <ChakraProvider>
      <Home /> {/* Renderiza el componente Detalles donde tienes tu tabla */}
    </ChakraProvider>
  );
}

export default App;