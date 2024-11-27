// Oportunidades.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { toast, ToastContainer } from 'react-toastify';  // Importar Toastify
import 'react-toastify/dist/ReactToastify.css';  // Importar los estilos de Toastify
import ServiciosTabla from './ServiciosTabla';

import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import MostrarModalServicios from './MostrarModalServicios';
import EditarServicio from './EditarServicioModal';

import { Servicio , Concepto } from './interfaces'

function HookUsage({
  value,
  onChange
}: {
  value: number;
  onChange: (value: number) => void;
}) {

  const handleIncrement = () => {
    onChange(value + 1);  // Simplemente incrementa el valor
  };

  const handleDecrement = () => {
    onChange(value > 0 ? value - 1 : 0);  // Decrementa pero asegura que no baje de 0
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue === "") {
      onChange(0);  // Si el campo está vacío, se reemplaza por 0
      return;
    }

    const parsedValue = parseInt(newValue, 10);

    if (!isNaN(parsedValue) && parsedValue >= 0) {
      onChange(parsedValue);  // Actualiza el valor con el nuevo valor numérico
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={handleDecrement} 
        className="bg-gray-200 hover:bg-gray-300 text-black rounded-full px-4 py-2"
      >
        -
      </Button>
      
      <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        className="w-16 text-center border border-gray-300 rounded-md"
      />

      <Button
        onClick={handleIncrement} 
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2"
      >
        +
      </Button>
    </div>
  );
}

export default function Home() {
  const [oportunidades, setOportunidades] = useState<any[]>([]);
  const [isCreatingClient, setIsCreatingClient] = useState(false); // Estado para manejar el pop-up de crear cliente
  const [clientes, setClientes] = useState<any[]>([]); // Estado para manejar los clientes
  const [nombreOportunidad, setNombreOportunidad] = useState('');  // Nuevo estado para el nombre de la oportunidad  

  const token = sessionStorage.getItem('token'); // Obtener el token almacenado
  
  // Función para obtener las oportunidades
  const fetchOportunidades = async () => {
    try {
      const response = await fetch('http://localhost:5015/api/oportunidades', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setOportunidades(data); // Actualiza el estado con las nuevas oportunidades
      } else {
        console.error('Error al cargar oportunidades:', data.message);
      }
    } catch (error) {
      console.error('Error al obtener oportunidades:', error);
    } finally {
      setLoadingOportunidades(false);
    }
  };

  // useEffect que usa fetchOportunidades para obtener las oportunidades al montar el componente
  useEffect(() => {
    fetchOportunidades();
  }, []);

  // Obtener la lista de clientes desde la base de datos
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        if (!token) {
          throw new Error('No se encontró el token');
        }
  
        const response = await fetch('http://localhost:5015/api/clientes', {
          method: 'GET',
          credentials: 'include', 
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
  
        const data = await response.json();
        setClientes(data);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      }
    };
  
    fetchClientes();
  }, []);  

  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);  // Estado para manejar el cliente seleccionado
  
  const [mostrarDetalles, setMostrarDetalles] = useState(false); // Para alternar entre la tabla y los detalles

  const handleCrearOportunidad = () => {
    if (!clienteSeleccionado) {
      console.error('No se ha seleccionado un cliente');
      return;
    }
  
    // Aquí haces lo necesario para crear la oportunidad
    console.log('Creando oportunidad para el cliente:', clienteSeleccionado.nombre);
  
    setMostrarDetalles(true);  // Cambiar el estado para mostrar detalles
  };   

  const volverAHome = () => {
    setMostrarDetalles(false);  // Ocultar los detalles y mostrar la tabla
    setClienteSeleccionado(null);  // Limpiar el cliente seleccionado
  };  

  const handleEstadoChange = async (index: number, nuevoEstado: string) => {
    const oportunidad = oportunidades[index];
    const { id } = oportunidad;
  
    try {
      // Hacer la petición PATCH a la API
      const response = await fetch(`http://localhost:5015/api/oportunidades/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
  
      if (response.ok) {
        // Si la petición es exitosa, actualizamos el estado localmente
        const nuevasOportunidades = [...oportunidades];
        nuevasOportunidades[index].estado = nuevoEstado;
        setOportunidades(nuevasOportunidades);
      } else {
        console.error('Error al actualizar el estado');
        // Manejar error en el frontend si es necesario
      }
    } catch (error) {
      console.error('Error en la petición:', error);
    }
  };  
  `` 
  const handleEditarOportunidad = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5015/api/oportunidades/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
  
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener la oportunidad');
      }
      console.log('Data', data);
      setOportunidadEnEdicion(data.id);
      console.log('Data', data.id);
      setClienteSeleccionado(data.cliente);
      console.log('Cliente seleccionado:', data.cliente);
      setItemsCotizacion(data.itemsCotizacion);  // Aquí colocas los datos de la cotización
      console.log('Items Cotización:', data.itemsCotizacion);  // Agrega esto para ver los datos
      setNombreOportunidad(data.nombre_op);
      console.log('Nombre Oportunidad:', data.nombre_op);
      setMostrarDetalles(true);

      setServicios(data.servicios);
    } catch (error) {
      console.error('Error al editar la oportunidad:', error);
    }
  };  

///////////////////////DETALLES//////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Estados para manejar los selects de Tipo de Cotización y Subtipo de Cotización
  const [cotizacionTipo, setCotizacionTipo] = useState<string>(''); 
  const [subtipoCotizacion, setSubtipoCotizacion] = useState<string>(''); 

  // Estados para manejar la base de datos y la infraestructura (solution)
  const [baseDeDatos, setBaseDeDatos] = useState<string>(''); 
  const [solution, setSolution] = useState<string>(''); 

  // Estado para mostrar el primer o segundo pop-up
  const [mostrarModalTipo, setMostrarModalTipo] = useState(false);
  const [mostrarModalLicencias, setMostrarModalLicencias] = useState(false);

  const [subtotalUsuario, setSubtotalUsuario] = useState<number>(0);
  const [subtotalBD, setSubtotalBD] = useState<number>(0);
  const [descuentoPorVolumen, setDescuentoPorVolumen] = useState<number>(0);
  const [descuentoPorVolumenPorcentaje, setDescuentoPorVolumenPorcentaje] = useState<number>(0);
  const [descuentoEspecial, setDescuentoEspecial] = useState<number>(0);
  const [descuentoEspecialPartner, setDescuentoEspecialPartner] = useState<number>(0);
  const [totalVenta, setTotalVenta] = useState<number>(0);
  const [costoVenta, setCostoVenta] = useState<number>(0);
  const [margenVenta, setMargenVenta] = useState<number>(0);

  const [desplegados, setDesplegados] = useState<number[]>([]);  // Ítems desplegados (expandidos)

  // Estado para almacenar los ítems agregados a la cotización
  const [itemsCotizacion, setItemsCotizacion] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [cantidadesLicenciasSAP, setCantidadesLicenciasSAP] = useState<{ [key: string]: number }>({});
  const [cantidadesLicenciasSeidor, setCantidadesLicenciasSeidor] = useState<{ [key: string]: number }>({});

  const [cantidadesOriginalesSAP, setCantidadesOriginalesSAP] = useState<{ [key: string]: number }>({});
  const [cantidadesOriginalesSeidor, setCantidadesOriginalesSeidor] = useState<{ [key: string]: number }>({});  

  const [estado, setEstado] = useState('Pendiente');  // Nuevo estado para el estado de la oportunidad

  const [oportunidadEnEdicion, setOportunidadEnEdicion] = useState<any>(null); // Estado para la oportunidad que se está editando

  const [licenciasSAP, setLicenciasSAP] = useState<any[]>([]);  // Estado para las licencias SAP
  const [licenciasSeidor, setLicenciasSeidor] = useState<any[]>([]);  // Estado para las licencias Seidor

  const [mostrarModalServicio, setMostrarModalServicio] = useState<boolean>(false);  // Estado para mostrar el pop-up de servicios

  const [servicios, setServicios] = useState<any[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);

  // Función para agregar un servicio al estado
  const agregarServicio = (nuevoServicio: any) => {
    setServicios([...servicios, nuevoServicio]);
  };


  const handleEditarServicio = (servicio: Servicio) => {
    setServicioSeleccionado(servicio);
  };
  

  const handleGuardarServicio = (servicioEditado: Servicio) => {
    const serviciosActualizados = servicios.map((s) =>
      s.nombre_proyecto === servicioEditado.nombre_proyecto ? servicioEditado : s
    );
    setServicios(serviciosActualizados);
    setServicioSeleccionado(null);
  };

  const handleCancelarEdicion = () => {
    setServicioSeleccionado(null); // Regresar a la vista principal
  };  
  
  // Función para manejar el despliegue/colapso
  const toggleDespliegue = (index: number) => {
    setDesplegados(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)  // Si ya está desplegado, lo colapsamos
        : [...prev, index]  // Si no está desplegado, lo expandimos
    );
  };

  // Estructura de opciones de cotización
  const cotizacionMap: Record<string, string[]> = {
    'Licencia': ['Licencias SAP', 'Licencias Seidor', 'Licencias Boyum'],
    'Infraestructura': ['Servidores', 'Almacenamiento', 'Redes'],
  };

  useEffect(() => {
    // Función para obtener las licencias SAP
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
        setLicenciasSAP(data);
      } catch (error) {
        console.error('Error al obtener las licencias SAP:', error);
      }
    };

    // Función para obtener las licencias Seidor
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
        setLicenciasSeidor(data);
      } catch (error) {
        console.error('Error al obtener las licencias Seidor:', error);
      }
    };

    // Llamar a las funciones
    fetchLicenciasSAP();
    fetchLicenciasSeidor();
  }, []);

  // Filtrar licencias según la base de datos seleccionada (SQL o Hana)
  const filtrarLicencias = (licencias: any[], bd: string, solution: string) => {
    return licencias.filter((licencia) => {
      // Filtrar según la base de datos (solo aplica a SAP)
      if (licencia.user_type === 'Database') {
        if (bd === 'Hana' && licencia.name.includes('SQL')) {
          return false; // Ocultar SQL si se selecciona HANA
        }
        if (bd === 'SQL' && licencia.name.includes('HANA')) {
          return false; // Ocultar HANA si se selecciona SQL
        }
      }
  
      // Filtrar según el tipo de licencia (On-Premise u On-Cloud)
      if (solution === 'OP' && licencia.type !== 'On-Premise') {
        return false; // Mostrar solo licencias On-Premise si se selecciona OP
      }
      if (solution === 'OC' && licencia.type !== 'On-Cloud') {
        return false; // Mostrar solo licencias On-Cloud si se selecciona OC
      }
  
      return true; // Mostrar todas las demás licencias que cumplen los filtros
    });
  };

  // Función para manejar cuando se abre el segundo pop-up
  const handleAceptarCotizacionTipo = () => {
    setMostrarModalTipo(false); // Cerrar el primer pop-up
    if(cotizacionTipo === 'Licencia') {
      setMostrarModalLicencias(true); // Abrir el segundo pop-up
    } else if (cotizacionTipo === 'Servicio') {
      setMostrarModalServicio(true);
    }
  };

  const handleCantidadChange = (licenciaId: string, value: number) => {
    if (subtipoCotizacion === 'Licencias SAP') {
      setCantidadesLicenciasSAP((prev) => {
        const newCantidades = { ...prev, [licenciaId]: isNaN(value) ? 0 : value };
        console.log('Cantidades de licencias SAP actualizadas:', newCantidades);
        return newCantidades;
      });
    } else if (subtipoCotizacion === 'Licencias Seidor') {
      setCantidadesLicenciasSeidor((prev) => {
        const newCantidades = { ...prev, [licenciaId]: isNaN(value) ? 0 : value };
        console.log('Cantidades de licencias Seidor actualizadas:', newCantidades);
        return newCantidades;
      });
    }
  
    calcularSubtotales();
  };  
  
  // Función para formatear números en el formato de moneda
  const formatNumber = (number: number) => {
    if(isNaN(number)) return "$ 0.00";
    const formattedNumber = number.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    
    // Reemplazamos el símbolo de dólar seguido del número con "$ "
    return formattedNumber.replace("$", "$ ");
  };

  useEffect(() => {
    calcularSubtotales();
  }, [subtotalUsuario, subtotalBD, descuentoPorVolumen, cantidadesLicenciasSAP, cantidadesLicenciasSeidor, descuentoEspecial, descuentoEspecialPartner, solution]);  // Array de dependencias
  
  // Función para obtener el precio correcto de acuerdo a la solución (On-Premise o On-Cloud) y la cantidad seleccionada
  const obtenerPrecio = (priceRanges: any[], cantidad: number) => {
    const rango = priceRanges.find((rango) =>
      (rango.from_range <= cantidad && (!rango.to_range || cantidad <= rango.to_range))
    );
  
    return rango ? parseFloat(rango.price) : 0; // Asegúrate de devolver solo el precio
  };

  // Función para obtener el precio según el tipo (OP = On-Premise, OC = On-Cloud)
  const obtenerPrecioPorTipo = (priceType: any[], solution: string) => {
    const tipoSeleccionado = solution === 'OP' ? 'On-Premise' : 'On-Cloud';
    const precio = priceType.find((p) => p.type === tipoSeleccionado);
    return precio ? Number(precio.price) : 0;
  };

// Función para calcular los subtotales y aplicar descuentos
const calcularSubtotales = () => {
  let subtotalUsuarioTemp = 0;
  let subtotalBDTemp = 0;

  // Asegúrate de que las variables de descuento y solución estén inicializadas correctamente
  const descuentoEspecialParsed = Number(descuentoEspecial) || 0;
  const descuentoEspecialPartnerParsed = Number(descuentoEspecialPartner) || 0;
  const descuentoPorVolumenParsed = Number(descuentoPorVolumenPorcentaje) || 0;

  // Calcular subtotales dependiendo del subtipo de cotización
  if (subtipoCotizacion === 'Licencias SAP') {
    // Calcular subtotales para Licencias SAP
    licenciasSAP.forEach((licencia) => {
      const cantidad = cantidadesLicenciasSAP[licencia.id] || 0;  // Usamos las cantidades de SAP
      const costo = solution === 'OP' ? obtenerPrecio(licencia.price_ranges, cantidad) : obtenerPrecio(licencia.price_ranges, cantidad);
      const total = cantidad * costo;

      // Identificar si es Named User o Database
      if (licencia.user_type.includes('Named User')) {
        subtotalUsuarioTemp += total;
      } else if (licencia.user_type.includes('Database')) {
        subtotalBDTemp += total;
      } else if (licencia.user_type.includes('Partner Hosted Option')) {
        subtotalUsuarioTemp += total;
      } else if (licencia.user_type.includes('Product Option')) {
        subtotalUsuarioTemp += total
      }
    });
    console.log('Subtotal Usuario:', subtotalUsuarioTemp);
    // Aplicar descuento por volumen solo si es SAP
    const totalConBD = subtotalUsuarioTemp + subtotalBDTemp;
    let descuentoPorVolumenTemp = 0;

    if (totalConBD > 300000) {
      descuentoPorVolumenTemp = subtotalUsuarioTemp * 0.40;
    } else if (totalConBD > 150000) {
      descuentoPorVolumenTemp = subtotalUsuarioTemp * 0.30;
    } else if (totalConBD > 30000) {
      descuentoPorVolumenTemp = subtotalUsuarioTemp * 0.20;
    } else if (totalConBD > 15000) {
      descuentoPorVolumenTemp = subtotalUsuarioTemp * 0.10;
    }

    // Actualizar descuentos por volumen
    if (subtotalUsuarioTemp === 0) {
      setDescuentoPorVolumen(0);
      setDescuentoPorVolumenPorcentaje(0);
    } else {
      setDescuentoPorVolumen(descuentoPorVolumenTemp);
      setDescuentoPorVolumenPorcentaje((descuentoPorVolumenTemp / subtotalUsuarioTemp) * 100);
    }

    // Calcular total de venta después de los descuentos
    const totalVentaTemp = (subtotalUsuarioTemp + subtotalBDTemp)
      - (subtotalUsuarioTemp * (descuentoPorVolumenParsed / 100))
      - (subtotalUsuarioTemp * (descuentoEspecialParsed / 100));

    setTotalVenta(totalVentaTemp);

    // Calcular costo de venta
    const A = subtotalUsuarioTemp + subtotalBDTemp - (subtotalUsuarioTemp * descuentoPorVolumenParsed / 100);
    const B = subtotalUsuarioTemp - (subtotalUsuarioTemp * descuentoPorVolumenParsed / 100);
    const C = (B / 2) + (B * (descuentoEspecialPartnerParsed / 100));
    const costoVentaTemp = A - C;

    setCostoVenta(costoVentaTemp);

    // Calcular margen de venta
    const margenVentaTemp = totalVentaTemp - costoVentaTemp;
    setMargenVenta(margenVentaTemp);
  } 
  else if (subtipoCotizacion === 'Licencias Seidor') {
    // Calcular subtotales para Licencias Seidor
    licenciasSeidor.forEach((licencia) => {
      const cantidad = cantidadesLicenciasSeidor[licencia.id] || 0;  // Usamos las cantidades de Seidor
      const costo = obtenerPrecioPorTipo(licencia.price_type, solution);
      subtotalUsuarioTemp += cantidad * costo;
    });

    // No aplicamos descuento por volumen en Seidor
    setDescuentoPorVolumen(0);
    setDescuentoPorVolumenPorcentaje(0);

    // Para Seidor, el total de venta no incluye BD
    const totalVentaTemp = subtotalUsuarioTemp - (subtotalUsuarioTemp * (descuentoEspecialParsed / 100));
    setTotalVenta(totalVentaTemp);

    // El costo de venta y margen en Seidor es más simple
    setCostoVenta(0);  // No calculas el costo de venta en Seidor
    setMargenVenta(totalVentaTemp);  // El margen es igual al total de venta en Seidor
  }

  // Establecemos los subtotales de usuario y BD
  setSubtotalUsuario(subtotalUsuarioTemp);
  setSubtotalBD(subtotalBDTemp);
};
  
  // Función para resetear los campos de licencias
  const resetearCampos = () => {
    setBaseDeDatos('');
    setSolution('');
    setSubtotalUsuario(0);
    setSubtotalBD(0);
    setDescuentoPorVolumen(0);
    setDescuentoEspecial(0);
    setTotalVenta(0);
    setCostoVenta(0);
    setMargenVenta(0);
    setEditingIndex(null);  // Restablecer el índice de edición
  
    // Resetear las cantidades según el subtipo de cotización
    if (subtipoCotizacion === 'Licencias SAP') {
      setCantidadesLicenciasSAP({});
    } else if (subtipoCotizacion === 'Licencias Seidor') {
      setCantidadesLicenciasSeidor({});
    }
  };
  

  // Define el tipo de las licencias seleccionadas
  interface LicenciaSeleccionada {
    tipo: string;
    name: string;
    cantidad: number;
    costo: number;
    total: number;
  }
  
  // Función para agregar un ítem a la cotización
  const agregarItemCotizacion = () => {
    const licenciasSeleccionadas = subtipoCotizacion === 'Licencias SAP' 
      ? Object.entries(cantidadesLicenciasSAP).filter(([, cantidad]) => cantidad > 0).map(([licenciaId, cantidad]) => {
          // Buscar la licencia en licenciasSAP usando el id directamente
          const licenciaObj = licenciasSAP.find(l => l.id === licenciaId);
          console.log('Licencia:', licenciaObj);
          
          // Usar la función obtenerPrecio para determinar el costo basado en la cantidad
          const costo = licenciaObj ? obtenerPrecio(licenciaObj.price_ranges, cantidad) : 0;

          return {
            tipo: licenciaObj.id,  // ID de la licencia
            name: licenciaObj.name,  // Nombre de la licencia
            cantidad,
            costo,
            total: cantidad * costo,  // Calcular el total basado en la cantidad y el costo
          };
        })
      : Object.entries(cantidadesLicenciasSeidor).filter(([, cantidad]) => cantidad > 0).map(([licenciaId, cantidad]) => {
          // Buscar la licencia en licenciasSeidor usando el id directamente
          const licenciaObj = licenciasSeidor.find(l => l.id === licenciaId);
          
          // Usar la función obtenerPrecioPorTipo para determinar el costo basado en On-Premise o On-Cloud
          const costo = licenciaObj 
            ? obtenerPrecioPorTipo(licenciaObj.price_types, solution) 
            : 0;

          return {
            tipo: licenciaObj.id,  // Usar el ID de la licencia
            name: licenciaObj.name,  // Nombre de la licencia
            cantidad,
            costo,
            total: cantidad * costo,  // Calcular el total basado en la cantidad y el costo
          };
        });
    console.log('SOLUTION', solution);
    const nuevoItem = {
      tipoCotizacion: subtipoCotizacion,
      baseDeDatos, // Solo para SAP
      solution,    // On-Premise o On-Cloud
      subtotalUsuario,
      subtotalBD,
      descuentoPorVolumen,
      totalVenta,
      costoVenta,
      margenVenta,
      licenciasSeleccionadas,  // Lista de licencias seleccionadas con tipo, cantidad, costo y total
    };

    let nuevosItems;
    if (editingIndex !== null) {
      nuevosItems = [...itemsCotizacion];
      nuevosItems[editingIndex] = nuevoItem;  // Reemplazar el item editado
    } else {
      nuevosItems = [...itemsCotizacion, nuevoItem];  // Agregar un nuevo item a la cotización
    }

    setItemsCotizacion(nuevosItems);  // Actualizar el estado de los items de cotización

    // Cerrar el modal de licencias y resetear los campos
    setMostrarModalLicencias(false);
    resetearCampos();
    setSubtipoCotizacion('');
  };

  // Función para eliminar un ítem de la cotización
  const eliminarItemCotizacion = (index: number) => {
    const itemsActualizados = [...itemsCotizacion];
    itemsActualizados.splice(index, 1); // Eliminar el ítem en el índice dado
    setItemsCotizacion(itemsActualizados);
    setCantidadesLicenciasSAP({});
    setCantidadesLicenciasSeidor({});
  };

  // Funcion para editar un item de la cotizacion
  const editarItemCotizacion = (index: number) => {
    const itemAEditar = itemsCotizacion[index];
  
    // Guardar las cantidades originales antes de editar
    if (itemAEditar.tipoCotizacion === 'Licencias SAP') {
      setCantidadesOriginalesSAP(cantidadesLicenciasSAP);  // Guardamos las cantidades originales de SAP
      setCantidadesLicenciasSAP(
        itemAEditar.licenciasSeleccionadas.reduce((prev: { [key: string]: number }, curr: { tipo: string; cantidad: number }) => {
          prev[curr.tipo] = curr.cantidad;
          return prev;
        }, {})  // Valor inicial del reduce
      );      
    } else if (itemAEditar.tipoCotizacion === 'Licencias Seidor') {
      setCantidadesOriginalesSeidor(cantidadesLicenciasSeidor);  // Guardamos las cantidades originales de Seidor
      
      setCantidadesLicenciasSeidor(
        itemAEditar.licenciasSeleccionadas.reduce((prev: { [key: string]: number }, curr: { tipo: string; cantidad: number }) => {
          prev[curr.tipo] = curr.cantidad;  // Agregamos la cantidad de la licencia actual al acumulador
          return prev;
        }, {} as { [key: string]: number })  // Valor inicial como un objeto vacío con el tipo correcto
      );
    }
    
  
    // Cargar los demás datos del ítem en los estados correspondientes
    setSubtipoCotizacion(itemAEditar.tipoCotizacion);
    setBaseDeDatos(itemAEditar.baseDeDatos);
    setSolution(itemAEditar.solution);
    setSubtotalUsuario(itemAEditar.subtotalUsuario);
    setSubtotalBD(itemAEditar.subtotalBD);
    setDescuentoPorVolumen(itemAEditar.descuentoPorVolumen);
    setDescuentoEspecial(itemAEditar.descuentoEspecial || 0);
    setTotalVenta(itemAEditar.totalVenta);
    setCostoVenta(itemAEditar.costoVenta);
    setMargenVenta(itemAEditar.margenVenta);
  
    // Guardamos temporalmente el índice del ítem que estamos editando
    setEditingIndex(index);
  
    // Mostrar el modal para editar
    setMostrarModalLicencias(true);
  }; 
  
  // Estado para manejar el loading
  const [loading, setLoading] = useState(false);

  // Función para enviar la cotización a la base de datos
  const enviarCotizacion = async () => {
    // Evitar solicitudes duplicadas
    if (loading) return;

    setLoading(true);  // Establecer loading en true

    const { totalVentaGeneral, costoVentaGeneral, margenVentaGeneral } = calcularTotalesGenerales();

    console.log('Total Venta:', totalVentaGeneral);
    console.log('Costo Venta:', costoVentaGeneral);
    console.log('Margen Venta:', margenVentaGeneral);
    console.log("Nombre oopr", nombreOportunidad);
    try {
      const nuevaOportunidad = {
        cliente_id: clienteSeleccionado.id,
        nombre_op: nombreOportunidad,
        total_venta: totalVentaGeneral,
        costo_venta: costoVentaGeneral,
        margen_venta: margenVentaGeneral,
        estado: 'Pendiente',  // Estado inicial
        itemsCotizacion: itemsCotizacion,
        servicios: servicios,
      };

      let response;
      let message;
      // Si estamos editando (oportunidadEnEdicion tiene un id), entonces hacemos un PUT
      if (oportunidadEnEdicion) {
        response = await fetch(`http://localhost:5015/api/oportunidades/${oportunidadEnEdicion}`, {
          method: 'PUT',  // PUT para editar
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nuevaOportunidad),  // Actualizamos con los nuevos datos
        });
        message = 'Oportunidad actualizada con éxito';
      } else {
        // Si no hay id, estamos creando una nueva oportunidad
        response = await fetch('http://localhost:5015/api/oportunidades', {
          method: 'POST',  // POST para crear una nueva oportunidad
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nuevaOportunidad),
        });
        message = 'Oportunidad creada con éxito';
      }

      // Manejar la respuesta del servidor
      if (response.ok) {
        const data = await response.json();
        toast.success(message);  // Mostrar notificación de éxito
        setMostrarDetalles(false);    // Cerrar los detalles
      
        await fetchOportunidades();  // Actualizar la lista de oportunidades
        setClienteSeleccionado(null);  // Limpiar el cliente seleccionado
        setItemsCotizacion([]);  // Limpiar los items de la cotización
        setNombreOportunidad('');  // Limpiar el nombre de la oportunidad
        setEstado('Pendiente');  // Reiniciar el estado

        console.log('Data:', data);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al crear la oportunidad');
      }
    } catch (error) {
      console.error('Error al crear la oportunidad:', error);
      toast.error('Error al crear la oportunidad');
    } finally {
      setLoading(false);  // Restablecer loading a false
    }
  };

  // Función para calcular los totales de venta, costo y margen
  const calcularTotalesGenerales = () => {
    const totalVentaGeneralLicencias = itemsCotizacion.reduce((acc, item) => acc + item.totalVenta, 0);
    const costoVentaGeneralLicencias = itemsCotizacion.reduce((acc, item) => acc + item.costoVenta, 0);
    const margenVentaGeneralLicencias = itemsCotizacion.reduce((acc, item) => acc + item.margenVenta, 0);

    const totalVentaGeneralServicios = servicios.reduce((acc, servicio) => acc + parseInt(servicio.total_venta), 0);
    const costoVentaGeneralServicios = servicios.reduce((acc, servicio) => acc + parseInt(servicio.costo_venta), 0);
    const margenVentaGeneralServicios = servicios.reduce((acc, servicio) => acc + parseInt(servicio.margen_venta), 0);

    const totalVentaGeneral = totalVentaGeneralLicencias + totalVentaGeneralServicios;
    const costoVentaGeneral = costoVentaGeneralLicencias + costoVentaGeneralServicios;
    const margenVentaGeneral = margenVentaGeneralLicencias + margenVentaGeneralServicios;
    
    return { totalVentaGeneral, costoVentaGeneral, margenVentaGeneral };
  };

  const handleBaseDeDatosChange = (value: string) => {
    setBaseDeDatos(value);
  
    // Crear una copia de las cantidades actuales
    const nuevasCantidades = {...cantidadesLicenciasSAP};
  
    // Filtrar licencias que son del tipo "Database"
    const basededatoslicencias = licenciasSAP.filter(licencia => licencia.user_type === 'Database');
  
    // Reiniciar las cantidades de las licencias de base de datos según el tipo seleccionado
    basededatoslicencias.forEach(licencia => {
      if (value === 'SQL' && licencia.db_engine === 'SQL') {
        nuevasCantidades[licencia.id] = 0;
      } else if (value === 'Hana' && licencia.db_engine === 'HANA') {
        nuevasCantidades[licencia.id] = 0;
      }
    });
  
    setCantidadesLicenciasSAP(nuevasCantidades);
  }; 
  
  const handleSolutionChange = (newSolution: string) => {
    // Actualizar la solución seleccionada
    setSolution(newSolution);
  
    // Reiniciar las cantidades de licencias SAP y Seidor al cambiar de solución
    if (subtipoCotizacion === 'Licencias SAP') {
      const nuevasCantidadesSAP = Object.keys(cantidadesLicenciasSAP).reduce((acc, key) => {
        acc[key] = 0;  // Reinicia todas las cantidades a 0
        return acc;
      }, {} as Record<string, number>);
      setCantidadesLicenciasSAP(nuevasCantidadesSAP);
    } else if (subtipoCotizacion === 'Licencias Seidor') {
      const nuevasCantidadesSeidor = Object.keys(cantidadesLicenciasSeidor).reduce((acc, key) => {
        acc[key] = 0;  // Reinicia todas las cantidades a 0
        return acc;
      }, {} as Record<string, number>);
      setCantidadesLicenciasSeidor(nuevasCantidadesSeidor);
    }
  
    // Vuelve a calcular los subtotales con las nuevas cantidades en cero
    calcularSubtotales();
  };

  const [loadingOportunidades, setLoadingOportunidades] = useState(true);

  // funcion para cuando esta cargando las oportunidades
  if (loadingOportunidades) {
    return <p>Cargando oportunidades...</p>;
  }

  ////////////////////////////////////////////////////RETURN//////////////////////////////////////////////////////////////////////////////////////

  return (
    <div>
      <ToastContainer />
  
      <div className="p-5">
  
        {/* Mostrar la página de homepage con la tabla de Oportunidades */}
        {!mostrarDetalles && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Lista de Oportunidades:</h1>
  
            {/* Tabla de oportunidades */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre de Oportunidad</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total Venta</TableHead>
                  <TableHead>Costo Venta</TableHead>
                  <TableHead>Margen Venta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oportunidades.length > 0 ? (
                  oportunidades.map((oportunidad, index) => (
                    <TableRow key={index}>
                      <TableCell>{oportunidad.nombre_op}</TableCell>
                      <TableCell>{oportunidad.cliente}</TableCell>
                      <TableCell>{formatNumber(parseInt(oportunidad.total_venta))}</TableCell>
                      <TableCell>{formatNumber(parseInt(oportunidad.costo_venta))}</TableCell>
                      <TableCell>{formatNumber(parseInt(oportunidad.margen_venta))}</TableCell>
                      <TableCell>
                      <Select
                        value={oportunidad.estado}
                        onValueChange={(value) => handleEstadoChange(index, value)}
                      >
                        <SelectTrigger
                          className={`p-1 rounded ${
                            oportunidad.estado === 'Ganada' ? 'bg-green-500 text-white' : 
                            oportunidad.estado === 'Perdida' ? 'bg-red-500 text-white' :
                            'bg-yellow-500 text-white'
                          }`}
                        >
                          <span>{oportunidad.estado}</span>
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="Ganada">Ganada</SelectItem>
                          <SelectItem value="Perdida">Perdida</SelectItem>
                        </SelectContent>
                      </Select>
                      </TableCell>
                      <TableCell>
                        <Button className="bg-blue-500 text-white" onClick={() => handleEditarOportunidad(oportunidad.id)}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-5">
                      No hay oportunidades creadas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* Botones para crear cliente y crear oportunidad */}
            <div className="mt-6 flex flex-col items-end space-y-4">
              {/* Crear Oportunidad */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-green-500 text-white">Crear Oportunidad</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Oportunidad</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Selecciona un cliente */}
                    <Select 
                      value={clienteSeleccionado?.id || ''}
                      onValueChange={(value) => {
                        const selectedCliente = clientes.find(c => c.id === value);  
                        setClienteSeleccionado(selectedCliente || null); 
                      }}
                    >
                      <SelectTrigger className="w-full p-2 border rounded-md">
                        {clienteSeleccionado ? clienteSeleccionado.nombre : 'Selecciona un cliente'}
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente, index) => (
                          <SelectItem key={index} value={cliente.id}>
                            {cliente.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Nombre de la oportunidad */}
                    <Input
                      value={nombreOportunidad}  // Controlado con useState
                      onChange={(e) => setNombreOportunidad(e.target.value)}
                      placeholder="Nombre de la Oportunidad"
                      className="w-full p-2 border rounded-md"
                    />

                    {/* Botón para crear la oportunidad */}
                    <Button onClick={handleCrearOportunidad} className="bg-green-500 text-white">
                      Crear
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
  
        {/* Mostrar los detalles del cliente seleccionado */}
        {mostrarDetalles && clienteSeleccionado && (
          <div>
            <h1 className="text-xl font-bold mb-4">Detalles del Cliente</h1>
            
            {/* Detalles del cliente */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input value={clienteSeleccionado.nombre} readOnly className="bg-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">RUC</label>
                <Input value={clienteSeleccionado.ruc} readOnly className="bg-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">N° de Sociedades</label>
                <Input value={clienteSeleccionado.sociedades} readOnly className="bg-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Empleados</label>
                <Input value={clienteSeleccionado.empleados} readOnly className="bg-gray-200" />
              </div>
            </div>
  
            <div className="flex justify-between w-full">
              {/* Botón para regresar a la vista de oportunidades */}
              <Button className="bg-red-500 text-white" onClick={volverAHome}>
                Cancelar
              </Button>

              {/* Botón para abrir modal de agregar item */}
              <Button className="bg-blue-500 text-white" onClick={() => setMostrarModalTipo(true)}>
                Crear Item
              </Button>
            </div>

            {/* Primer Pop-up para seleccionar tipo y subtipo de cotización */}
            <Dialog open={mostrarModalTipo} onOpenChange={setMostrarModalTipo}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Item</DialogTitle>
                </DialogHeader>

                {/* Primer Select - Tipo de Cotización */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Tipo de Cotización</label>
                  <Select value={cotizacionTipo} onValueChange={setCotizacionTipo}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona tipo de cotización" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Licencia">Licencia</SelectItem>
                      <SelectItem value="Servicio">Servicio</SelectItem>
                      <SelectItem value="Infraestructura">Infraestructura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Segundo Select - Subtipo de Cotización (aparece después de seleccionar el tipo) */}
                {cotizacionTipo && cotizacionTipo != "Servicio" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Subtipo de Cotización</label>
                    <Select value={subtipoCotizacion} onValueChange={setSubtipoCotizacion}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona subtipo de cotización" />
                      </SelectTrigger>
                      <SelectContent>
                        {cotizacionMap[cotizacionTipo]?.map((subtipo) => (
                          <SelectItem key={subtipo} value={subtipo} 
                          disabled={itemsCotizacion.some(item => item.tipoCotizacion===subtipo)}>
                            {subtipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Botón Aceptar solo aparece cuando ambos selects tienen valores */}
                {(cotizacionTipo === "Servicio" || (cotizacionTipo && subtipoCotizacion)) && (
                  <div className="flex justify-end">
                    <Button className="bg-blue-500 text-white" onClick={handleAceptarCotizacionTipo}>
                      Aceptar
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Segundo Pop-up para agregar licencias */}
            <Dialog open={mostrarModalLicencias} onOpenChange={setMostrarModalLicencias}>
            <DialogContent className="max-w-screen-lg max-h-screen">
              <DialogHeader>
                <DialogTitle>Agregar Licencias</DialogTitle>
              </DialogHeader>

              {/* Selectores de Base de Datos y Solution */}
              <div className="flex">
                {subtipoCotizacion === 'Licencias SAP' && (
                  <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1">Base de Datos</label>
                    <Select value={baseDeDatos} onValueChange={handleBaseDeDatosChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona BD" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SQL">SQL</SelectItem>
                        <SelectItem value="Hana">Hana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Select para Solution */}
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">Solution</label>
                  <Select value={solution} onValueChange={handleSolutionChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona Solution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OP">On-Premise</SelectItem>
                      <SelectItem value="OC">On Cloud</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tabla de Licencias SAP */}
              {subtipoCotizacion === 'Licencias SAP' && (
              <div className="overflow-auto max-h-48">
                <h3 className="text-md font-semibold">Licencias SAP</h3>
                <table className="min-w-full bg-white border border-gray-200 text-sm">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Tipo de Licencia</th>
                      <th className="py-2 px-4 border-b">En bloques de</th>
                      <th className="py-2 px-4 border-b">Métricas</th>
                      <th className="py-2 px-4 border-b">Costo</th>
                      <th className="py-2 px-4 border-b">Cantidad</th>
                      <th className="py-2 px-6 border-b">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                  {/* Separación entre Named Users y Database */}
                  {solution === 'OP' && (
                    <>
                      {/* Sección para Named Users */}
                      <tr>
                        <td colSpan={6} className="bg-gray-200 font-semibold px-4 py-2">SAP Business One Named Users</td>
                      </tr>
                      {filtrarLicencias(licenciasSAP, baseDeDatos, solution)
                        .filter(licencia => licencia.user_type === 'Named User')
                        .map((licencia) => (
                          <tr key={licencia.id}>
                            <td className="px-4 py-2 border-b">{licencia.name}</td>
                            <td className="px-4 py-2 border-b text-center">{licencia.sales_unit}</td>
                            <td className="px-4 py-2 border-b text-center">{licencia.metric}</td>
                            <td className="px-4 py-2 border-b text-center">
                              {obtenerPrecio(licencia.price_ranges, cantidadesLicenciasSAP[licencia.id])}
                            </td>
                            <td className="px-4 py-2 border-b text-center">
                              <HookUsage
                                value={cantidadesLicenciasSAP[licencia.id] || 0}
                                onChange={(value) => handleCantidadChange(licencia.id, Number(value))}
                              />
                            </td>
                            <td className="px-4 py-2 border-b text-center">
                              {(cantidadesLicenciasSAP[licencia.id] || 0) * obtenerPrecio(licencia.price_ranges, cantidadesLicenciasSAP[licencia.id])}
                            </td>
                          </tr>
                        ))}

                      {/* Sección para Product Option */}
                      <tr>
                        <td colSpan={6} className="bg-gray-200 font-semibold px-4 py-2">SAP Business One Product Option</td>
                      </tr>
                      {filtrarLicencias(licenciasSAP, baseDeDatos, solution)
                        .filter(licencia => licencia.user_type === 'Product Option')
                        .map((licencia) => (
                          <tr key={licencia.id}>
                            <td className="px-4 py-2 border-b">{licencia.name}</td>
                            <td className="px-4 py-2 border-b text-center">{licencia.sales_unit}</td>
                            <td className="px-4 py-2 border-b text-center">{licencia.metric}</td>
                            <td className="px-4 py-2 border-b text-center">
                              {obtenerPrecio(licencia.price_ranges, cantidadesLicenciasSAP[licencia.id])}
                            </td>
                            <td className="px-4 py-2 border-b text-center">
                              <HookUsage
                                value={cantidadesLicenciasSAP[licencia.id] || 0}
                                onChange={(value) => handleCantidadChange(licencia.id, Number(value))}
                              />
                            </td>
                            <td className="px-4 py-2 border-b text-center">
                              {(cantidadesLicenciasSAP[licencia.id] || 0) * obtenerPrecio(licencia.price_ranges, cantidadesLicenciasSAP[licencia.id])}
                            </td>
                          </tr>
                        ))}

                      {/* Sección para Database */}
                      <tr>
                        <td colSpan={6} className="bg-gray-200 font-semibold px-4 py-2">SAP Business One Databases</td>
                      </tr>
                      {filtrarLicencias(licenciasSAP, baseDeDatos, solution)
                        .filter(licencia => licencia.user_type === 'Database')
                        .map((licencia) => (
                          <tr key={licencia.id}>
                            <td className="px-4 py-2 border-b">{licencia.name}</td>
                            <td className="px-4 py-2 border-b text-center">{licencia.sales_unit}</td>
                            <td className="px-4 py-2 border-b text-center">{licencia.metric}</td>
                            <td className="px-4 py-2 border-b text-center">
                              {obtenerPrecio(licencia.price_ranges, cantidadesLicenciasSAP[licencia.id])}
                            </td>
                            <td className="px-4 py-2 border-b text-center">
                              <HookUsage
                                value={cantidadesLicenciasSAP[licencia.id] || 0}
                                onChange={(value) => handleCantidadChange(licencia.id, Number(value))}
                              />
                            </td>
                            <td className="px-4 py-2 border-b text-center">
                              {(cantidadesLicenciasSAP[licencia.id] || 0) * obtenerPrecio(licencia.price_ranges, cantidadesLicenciasSAP[licencia.id])}
                            </td>
                          </tr>
                        ))}
                    </>
                  )}

                  {/* Cuando no es On-Premise (por ejemplo, On-Cloud), mostrar todas las licencias sin separar */}
                  {solution === 'OC' && (
                    <>
                      {filtrarLicencias(licenciasSAP, baseDeDatos, solution).map((licencia) => (
                        <tr key={licencia.id}>
                          <td className="px-4 py-2 border-b">{licencia.name}</td>
                          <td className="px-4 py-2 border-b text-center">{licencia.sales_unit}</td>
                          <td className="px-4 py-2 border-b text-center">{licencia.metric}</td>
                          <td className="px-4 py-2 border-b text-center">
                            {obtenerPrecio(licencia.price_ranges, cantidadesLicenciasSAP[licencia.id])}
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            <HookUsage
                              value={cantidadesLicenciasSAP[licencia.id] || 0}
                              onChange={(value) => handleCantidadChange(licencia.id, Number(value))}
                            />
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            {(cantidadesLicenciasSAP[licencia.id] || 0) * obtenerPrecio(licencia.price_ranges, cantidadesLicenciasSAP[licencia.id])}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
                </table>
              </div>
            )}

            {/* Tabla de Licencias Seidor */}
            {subtipoCotizacion === 'Licencias Seidor' && (solution == 'OP' || solution == 'OC') && (
              <div className="overflow-auto max-h-72">
                <h3 className="text-md font-semibold">Licencias Seidor</h3>
                <table className="min-w-full bg-white border border-gray-200 text-sm">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left align-middle">Tipo de Licencia</th>
                      <th className="py-2 px-4 border-b text-center align-middle">Costo</th>
                      <th className="py-2 px-16 border-b text-left align-middle">Cantidad</th>
                      <th className="py-2 px-6 border-b text-center align-middle">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenciasSeidor.map((licencia) => (
                      <tr key={licencia.id}>
                        <td className="px-4 py-2 border-b">{licencia.name}</td>
                        <td className="px-4 py-2 border-b text-center">
                          {obtenerPrecioPorTipo(licencia.price_type, solution)}
                        </td>
                        <td className="px-4 py-2 border-b text-center">
                          <HookUsage
                            value={cantidadesLicenciasSeidor[licencia.id] || 0}
                            onChange={(value) => handleCantidadChange(licencia.id, Number(value))}
                          />
                        </td>
                        <td className="px-4 py-2 border-b text-center align-middle">
                          {(cantidadesLicenciasSeidor[licencia.id] || 0) *
                            obtenerPrecioPorTipo(licencia.price_type, solution)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

              {/* Subtotales y Totales */}
              <div className="flex justify-between mt-4">
                <div className="w-2/3 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-medium text-sm">Subtotal de Licencias de Usuario:</label>
                    <span className="text-gray-700 text-sm">  {formatNumber(subtotalUsuario)}</span>
                  </div>

                  {/* Subtotal de Licencias de BD solo para SAP */}
                  {subtipoCotizacion === 'Licencias SAP' && (
                    <div className="py-2 flex justify-between items-center">
                      <label className="font-medium text-sm">Subtotal de Licencias de BD:</label>
                      <span className="text-gray-700 text-sm">  {formatNumber(subtotalBD)}</span>
                    </div>
                  )}

                  {/* Descuento por Volumen solo para SAP */}
                  {subtipoCotizacion === 'Licencias SAP' && (
                    <div className="flex justify-between items-center">
                      <label className="font-medium text-sm">Descuento por Volumen:</label>
                      <div className="flex items-center">
                        <Input
                          value={descuentoPorVolumenPorcentaje}
                          readOnly
                          className="w-16 text-center text-sm"
                        />
                        <span className="ml-2 text-sm">%</span>
                      </div>
                      <span className="ml-4 text-red-600 font-bold text-sm w-24 text-right">- {formatNumber(descuentoPorVolumen)}</span>
                    </div>
                  )}

                  {/* Descuento Especial - Siempre visible */}
                  <div className="flex justify-between items-center">
                    <label className="font-medium text-sm">Descuento Especial:</label>
                    <div className="flex items-center ml-8">
                      <Input
                        value={descuentoEspecial}
                        onChange={(e) => {
                          const newDescuentoEspecial = parseFloat(e.target.value) || 0;
                          setDescuentoEspecial(newDescuentoEspecial);
                          calcularSubtotales();
                        }}
                        className="w-16 text-center text-sm"
                      />
                      <span className="ml-2 text-sm">%</span>
                    </div>
                    <span className="ml-4 text-red-600 font-bold text-sm w-24 text-right">- {formatNumber(subtotalUsuario * descuentoEspecial / 100)}</span>
                  </div>

                  {/* Descuento Especial Partner solo para SAP */}
                  {subtipoCotizacion === 'Licencias SAP' && (
                    <div className="flex justify-between items-center">
                      <label className="font-medium text-sm">Descuento Especial Partner:</label>
                      <div className="flex items-center mr-5">
                        <Input
                          value={descuentoEspecialPartner}
                          onChange={(e) => {
                            const newDescuentoEspecialPartner = parseFloat(e.target.value) || 0;
                            setDescuentoEspecialPartner(newDescuentoEspecialPartner);
                            calcularSubtotales();
                          }}
                          className="w-16 text-center text-sm"
                        />
                        <span className="ml-2 text-sm">%</span>
                      </div>
                      <span className="ml-4 text-green-600 font-bold text-sm w-24 text-right">- {formatNumber((descuentoEspecialPartner / 100) * (subtotalUsuario - descuentoPorVolumen))}</span>
                    </div>
                  )}
                  
                  {/* Total Venta */}
                  <div className="flex justify-between items-center">
                    <label className="font-medium text-sm">Total Venta:</label>
                    <span className="text-gray-700 text-sm">  {formatNumber(totalVenta)}</span>
                  </div>

                  {/* Costo Venta */}
                  <div className="flex justify-between items-center">
                    <label className="font-medium text-sm">Costo Venta:</label>
                    <span className="text-gray-700 text-sm">  {formatNumber(costoVenta)}</span>
                  </div>

                  {/* Margen Venta */}
                  <div className="flex justify-between items-center">
                    <label className="font-medium text-sm">Margen Venta:</label>
                    <span className="text-yellow-500 text-sm">  {formatNumber(margenVenta)}</span>
                  </div>
                </div>
              </div>

              {/* Botones de Confirmar y Cancelar */}
              <div className="flex justify-end mt-4">
                <Button onClick={() => {setMostrarModalLicencias(false); resetearCampos(); setCantidadesOriginalesSeidor(cantidadesOriginalesSeidor) ; setCantidadesOriginalesSAP(cantidadesOriginalesSAP)}} className="bg-gray-500 text-white px-4 py-2 mr-2">
                  Cancelar
                </Button>
                <Button className="bg-blue-500 text-white px-4 py-2" onClick={(agregarItemCotizacion)}>
                  Guardar Cotización
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="max-h-[200px] overflow-y-auto overflow-x-">
            {/* Tabla de ítems agregados a la cotización */}
            {itemsCotizacion && itemsCotizacion.length > 0 && (
              <div className="mt-6">
                <h3 className="text-base font-semibold mb-4">Conceptos Licencias</h3>
                <table className="min-w-full bg-white border border-gray-200 text-sm">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b"></th>
                      <th className="py-2 px-4 border-b">Tipo de Concepto</th>
                      <th className="py-2 px-4 border-b">Base de Datos</th>
                      <th className="py-2 px-4 border-b">Solution</th>
                      <th className="py-2 px-4 border-b">Total Venta</th>
                      <th className="py-2 px-4 border-b">Costo Venta</th>
                      <th className="py-2 px-4 border-b">Margen Venta</th>
                      <th className="py-2 px-4 border-b">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsCotizacion.map((item, index) => (
                      <React.Fragment key={index}>
                        <tr>
                          <td className="px-4 py-2 border text-center">
                            {/* Botón para desplegar/contraer */}
                            <button onClick={() => toggleDespliegue(index)}>
                              {desplegados.includes(index) ? '▼' : '▶'}
                            </button>
                          </td>
                          <td className="px-4 py-1 border-b">{item.tipoCotizacion}</td>
                          <td className="px-4 py-1 border-b text-center">{item.baseDeDatos}</td>
                          <td className="px-4 py-1 border-b text-center">{item.solution}</td>
                          <td className="px-4 py-1 border-b text-center">{formatNumber(item.totalVenta)}</td>
                          <td className="px-4 py-1 border-b text-center">{formatNumber(item.costoVenta)}</td>
                          <td className="px-4 py-1 border-b text-center">{formatNumber(item.margenVenta)}</td>
                          <td className="px-4 py-1 border-b text-center">
                            <Button
                              className="bg-yellow-500 text-white rounded-full px-3 py-1 mr-2"
                              onClick={() => editarItemCotizacion(index)}
                            >
                              Editar
                            </Button>
                            <Button
                              className="bg-red-500 text-white rounded-full px-3 py-1"
                              onClick={() => eliminarItemCotizacion(index)}
                            >
                              Eliminar
                            </Button>
                          </td>
                        </tr>
                        {/* Fila de detalles adicionales, visible solo si está desplegado */}
                        {desplegados.includes(index) && (
                        <tr>
                          <td colSpan={7} className="px-4 py-2 border-b bg-blue-50">
                            {/* Aquí se muestra la tabla con las licencias seleccionadas */}
                            <table>
                              <thead>
                                <tr>
                                  <th className="px-4 py-2">Licencia</th>
                                  <th className="px-4 py-2 text-center">Cantidad</th>
                                  <th className="px-4 py-2 text-center">Costo</th>
                                  <th className="px-4 py-2 text-center">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.licenciasSeleccionadas.map((licencia: LicenciaSeleccionada, licIndex: number) => (
                                  <tr key={licIndex}>
                                    <td className="px-4 py-2">{licencia.name}</td>
                                    <td className="px-4 py-2 text-center">{licencia.cantidad}</td>
                                    <td className="px-4 py-2 text-center">{formatNumber(licencia.costo)}</td>
                                    <td className="px-4 py-2 text-center">{formatNumber(licencia.total)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
            </div>
            )}

            {/* Mostrar modal servicios */}
            <MostrarModalServicios
              isOpen={mostrarModalServicio}
              onClose={() => setMostrarModalServicio(false)}
              onGuardarServicio={agregarServicio}
            />

            <div>
              <ServiciosTabla servicios={servicios} setServicios={setServicios} onEditar={handleEditarServicio} />

              {servicioSeleccionado && (
                <EditarServicio
                  servicio={servicioSeleccionado}
                  isOpen={!!servicioSeleccionado}
                  onGuardar={handleGuardarServicio}
                  onCancelar={handleCancelarEdicion}
                />
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            {(() => {
              const { totalVentaGeneral, costoVentaGeneral, margenVentaGeneral } = calcularTotalesGenerales();
              return (
                <div className="space-y-2 text-right mr-10">
                  <div className="flex justify-between">
                    <label className="font-medium text-sm">Total Venta:</label>
                    <span className="font-bold text-gray-700 text-sm">
                      {formatNumber(totalVentaGeneral)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <label className="font-medium text-sm">Costo Venta:</label>
                    <span className="font-bold text-gray-700 text-sm">
                      {formatNumber(costoVentaGeneral)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <label className="font-medium text-sm">Margen Venta:</label>
                    <span className="font-bold text-yellow-500 text-sm">
                      {formatNumber(margenVentaGeneral)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

            {/* Botón de Crear Cotización */}
            <div className="flex justify-end mt-3">
              <Button
                onClick={enviarCotizacion} 
                disabled={loading} 
                className={`bg-blue-500 text-white rounded-full px-8 py-3 mt-4 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creando Cotización...' : 'Terminar Cotización'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
