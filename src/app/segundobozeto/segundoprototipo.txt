'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

export default function Detalles() {

  // Estados para manejar los selects de Tipo de Cotización y Subtipo de Cotización
  const [cotizacionTipo, setCotizacionTipo] = useState<string>(''); 
  const [subtipoCotizacion, setSubtipoCotizacion] = useState<string>(''); 

  // Estados para manejar la base de datos y la infraestructura (solution)
  const [baseDeDatos, setBaseDeDatos] = useState<string>(''); 
  const [solution, setSolution] = useState<string>(''); 

  // Estado para mostrar el primer o segundo pop-up
  const [mostrarModalTipo, setMostrarModalTipo] = useState(false);
  const [mostrarModalLicencias, setMostrarModalLicencias] = useState(false);

  const [cantidadesLicencias, setCantidadesLicencias] = useState<{ [key: string]: number }>({});
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
  const [cantidadesOriginales, setCantidadesOriginales] = useState<{ [key: string]: number }>({});

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
    'Servicio': ['Consultoría', 'Soporte', 'Capacitación'],
    'Infraestructura': ['Servidores', 'Almacenamiento', 'Redes'],
  };

  const licenciasSAP = [
    {
      categoria: "SAP Business One Usuarios Nombrados",
      licencias: [
        { 
          tipo: "SAP Business One Professional User",  
          salesUnit: 1,
          metricas: "Users",
          costoOP: 2700, 
          costoOC: 101,
          parametro: "Licencia de Unica Vez"
        },
        { 
          tipo: "SAP Business One Limited User", 
          salesUnit: 1,
          metricas: "Users",
          costoOP: 1400, 
          costoOC: 57,
          parametro: "Licencia de Unica Vez"
        },
        { 
          tipo: "SAP Business One Indirect Access User",  
          salesUnit: 1,
          metricas: "Users",
          costoOP: 250, 
          costoOC: 8,
          parametro: "Licencia de Unica Vez"
        },
        { 
          tipo: "SAP Business One Mobile Application User", 
          salesUnit: 1,
          metricas: "Users",
          costoOP: 450, 
          costoOC: 15,
          parametro: "Licencia de Unica Vez"
        },
        { 
          tipo: "SAP B1 Limited to SAP B1 Professional User", 
          salesUnit: 1,
          metricas: "Users",
          costoOP: 1350, 
          costoOC: 0,
          parametro: "Licencia de Unica Vez"
        },
      ],
    },
    {
      categoria: "SAP Business Databases",
      licencias: [
        { 
          tipo: "SAP Business One Engine for SAP HANA", 
          salesUnit: 64,
          metricas: "GB of memory",
          costoOP: 2000, 
          costoOC: 0,
          parametro: "Licencia de Unica Vez"
        },
        { 
          tipo: "Microsoft SQL Standard edition (User based)", 
          salesUnit: 1,
          metricas: "Users",
          costoOP: 175, 
          costoOC: 0,
          parametro: "Licencia de Unica Vez"
        },
      ],
    },
  ];  

  const licenciasSeidor = [
    {
      categoria: "Horizontales SAP Business One",
      licencias: [
        { 
          tipo: "Office on the web Frame", 
          costoOP: 5000, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "AddOn Cuentas Destino", 
          costoOP: 1500, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "AddOn Numeración Fiscal", 
          costoOP: 2500, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "AddOn Pagos Masivos", 
          costoOP: 2500, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "Validador SUNAT (Ruc y Tipo de Cambio)", 
          costoOP: 2500, 
          costoOC: 0,
          parametro: "x cada 2000 Consultas"
        },
        { 
          tipo: "AddOn de Letras", 
          costoOP: 5000, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "AddOn de Facturas Negociables", 
          costoOP: 5000, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "Middleware Facturación Electrónica", 
          costoOP: 2000, 
          costoOC: 100,
          parametro: "x cada 5 Razones Sociales"
        },
        { 
          tipo: "Middleware Retenciones Electrónicas", 
          costoOP: 1500, 
          costoOC: 100,
          parametro: "x cada 5 Razones Sociales"
        },
        { 
          tipo: "Middleware Percepciones Electrónicas", 
          costoOP: 1500, 
          costoOC: 0,
          parametro: "x cada 5 Razones Sociales"
        },
        { 
          tipo: "Middleware Guías de Remisión Electrónicas", 
          costoOP: 1500, 
          costoOC: 0,
          parametro: "x cada 5 Razones Sociales"
        },
        { 
          tipo: "AddOn de Provisión de Gastos", 
          costoOP: 2500, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "AddOn Extractor de Pedidos B2B", 
          costoOP: 5000, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "Intercompany Seidor", 
          costoOP: 2500, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "Aplicación Mobile Seidor", 
          costoOP: 5000, 
          costoOC: 0,
          parametro: "Usuarios Ilimitados"
        },
        { 
          tipo: "Portal Web Caja Chica / Entregas a Rendir (SICER)", 
          costoOP: 5000, 
          costoOC: 0,
          parametro: "Usuarios Ilimitados"
        },
        { 
          tipo: "Portal Web de Requerimientos", 
          costoOP: 5000, 
          costoOC: 0,
          parametro: "Usuarios Ilimitados"
        },
        { 
          tipo: "Web Reporting", 
          costoOP: 3000, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
    ],
    },
    {
      categoria: "Verticales SAP Business One",
      licencias: [
        { 
          tipo: "AddOn de Lotes y Ubicaciones", 
          costoOP: 5000, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "AddOn de Transporte y Distribución", 
          costoOP: 1500, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "AddOn de Manifiesto de Transporte", 
          costoOP: 3500, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "AddOn Bitácora de Importaciones", 
          costoOP: 5000, 
          costoOC: 250,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "AddOn de Mantenimiento de Equipos", 
          costoOP: 5000, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "Addon de Inmobiliaria Seidor", 
          costoOP: 5000, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "Addon de Educación Seidor", 
          costoOP: 5000, 
          costoOC: 0,
          parametro: "Licencia de Única Vez"
        },
        { 
          tipo: "Portal Web Proveedores", 
          costoOP: 5000, 
          costoOC: 0,
          parametro: "Usuarios Ilimitados"
        },
        { 
          tipo: "Reporteros Electrónicos", 
          costoOP: 5000, 
          costoOC: 0,
          parametro: "Usuarios Ilimitados"
        }
    ],
    },
  ];

  const [cliente, setCliente] = useState({
    nombre: '',
    ruc: '',
    sociedades: '',
    empleados: ''
  });

  // Función que trae los datos del cliente precargados
  useEffect(() => {
    const datosCliente = JSON.parse(localStorage.getItem('cliente') || '{}');
    setCliente({
      nombre: datosCliente.nombre || 'Nombre de Cliente',
      ruc: datosCliente.ruc || '1234567890',
      sociedades: datosCliente.sociedades || '2',
      empleados: datosCliente.empleados || '10',
    });
  }, []);

  // Filtrar licencias según la base de datos seleccionada (SQL o Hana)
  const filtrarLicenciasPorBD = (licencias: typeof licenciasSAP, bd: string) => {
    return licencias.map((grupo) => {
      const licenciasFiltradas = grupo.licencias.filter((licencia) => {
        if (bd === 'Hana' && licencia.tipo === 'Microsoft SQL Standard edition (User based)') {
          return false; // Ocultar SQL licencias si la base de datos es HANA
        }
        if (bd === 'SQL' && licencia.tipo === 'SAP Business One Engine for SAP HANA') {
          return false; // Ocultar HANA licencias si la base de datos es SQL
        }
        return true; // Mostrar todas las demás licencias
      });
      return { ...grupo, licencias: licenciasFiltradas };
    });
  };

  // Función para manejar cuando se abre el segundo pop-up
  const handleAceptarCotizacionTipo = () => {
    setMostrarModalTipo(false); // Cerrar el primer pop-up
    setMostrarModalLicencias(true); // Abrir el segundo pop-up
  };

  const handleCantidadChange = (licencia: string, value: number) => {
    setCantidadesLicencias((prev) => ({
      ...prev,
      [licencia]: value,
    }));
    calcularSubtotales(); // Recalcular subtotales cuando cambia la cantidad
  };
  
  useEffect(() => {
    calcularSubtotales(); // Asegura que los subtotales se recalculan cuando cambia la BD o el Solution
  }, [baseDeDatos, solution, cantidadesLicencias, descuentoEspecial, descuentoEspecialPartner]);  

  // Función para formatear números en el formato de moneda
  const formatNumber = (number: number) => {
    return number.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  // Función para calcular los subtotales y aplicar descuentos
  const calcularSubtotales = () => {
    let subtotalUsuarioTemp = 0;
    let subtotalBDTemp = 0;
  
    // Calcular subtotales dependiendo del subtipo de cotización
    if (subtipoCotizacion === 'Licencias SAP') {
      licenciasSAP.forEach((grupo) => {
        grupo.licencias.forEach((licencia) => {
          const cantidad = cantidadesLicencias[licencia.tipo] || 0;
          const costo = solution === 'OP' ? licencia.costoOP : licencia.costoOC;
          const total = cantidad * costo;
  
          if (grupo.categoria.includes("Usuarios")) {
            subtotalUsuarioTemp += total;
          } else if (grupo.categoria.includes("Databases")) {
            subtotalBDTemp += total;
          }
        });
      });
  
      // Aplicar el descuento por volumen solo si es SAP
      const totalConBD = subtotalUsuarioTemp + subtotalBDTemp;
      let descuento = 0;
  
      if (totalConBD > 300000) {
        descuento = subtotalUsuarioTemp * 0.40;
      } else if (totalConBD > 150000) {
        descuento = subtotalUsuarioTemp * 0.30;
      } else if (totalConBD > 30000) {
        descuento = subtotalUsuarioTemp * 0.20;
      } else if (totalConBD > 15000) {
        descuento = subtotalUsuarioTemp * 0.10;
      }
  
      if (subtotalUsuarioTemp === 0) {
        setDescuentoPorVolumen(0);
        setDescuentoPorVolumenPorcentaje(0);
      } else {
        setDescuentoPorVolumen(descuento);
        setDescuentoPorVolumenPorcentaje((descuento / subtotalUsuarioTemp) * 100);
      }
  
      // Calcular el total de la venta restando los descuentos
      const totalVentaTemp = (subtotalUsuarioTemp + subtotalBDTemp)
        - (subtotalUsuarioTemp * (descuentoPorVolumenPorcentaje / 100))
        - (subtotalUsuarioTemp * (descuentoEspecial / 100));
      
      setTotalVenta(totalVentaTemp);
  
      // Calcular el costo de venta, aplicando descuentos
      const costoVentaTemp = ((subtotalUsuarioTemp + subtotalBDTemp - (subtotalUsuarioTemp * descuentoPorVolumenPorcentaje / 100)) / 2)
        - (descuentoEspecialPartner / 100 * (subtotalUsuarioTemp + subtotalBDTemp - (subtotalUsuarioTemp * descuentoPorVolumenPorcentaje / 100)));
      
      setCostoVenta(costoVentaTemp);
      console.log(descuentoEspecial, subtotalUsuarioTemp, subtotalBDTemp, totalVentaTemp, costoVentaTemp);
      // Calcular el margen de venta (solo basado en subtotalUsuario)
      const margenVentaTemp = (subtotalUsuario
        - (subtotalUsuario * (descuentoPorVolumenPorcentaje / 100))
        - (subtotalUsuario * (descuentoEspecial / 100)) 
        - ((subtotalUsuario - (subtotalUsuario * descuentoPorVolumenPorcentaje / 100)) / 2)
        - (descuentoEspecialPartner / 100 * (subtotalUsuario + subtotalBD - (subtotalUsuario * descuentoPorVolumenPorcentaje / 100))));
  
      setMargenVenta(margenVentaTemp);
  
    } else if (subtipoCotizacion === 'Licencias Seidor') {
      licenciasSeidor.forEach((grupo) => {
        grupo.licencias.forEach((licencia) => {
          const cantidad = cantidadesLicencias[licencia.tipo] || 0;
          const costo = solution === 'OP' ? licencia.costoOP : licencia.costoOC;
          subtotalUsuarioTemp += cantidad * costo;
        });
      });
  
      // No aplicamos el descuento por volumen en Seidor
      setDescuentoPorVolumen(0);
      setDescuentoPorVolumenPorcentaje(0);
  
      // Para Seidor, el total de venta no incluye BD
      const totalVentaTemp = subtotalUsuarioTemp - (subtotalUsuarioTemp * (descuentoEspecial / 100));
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
  };

  // Define el tipo de las licencias seleccionadas
  interface LicenciaSeleccionada {
    tipo: string;
    cantidad: number;
    costo: number;
    total: number;
  }
  
  // Función para agregar un ítem a la cotización
  const agregarItemCotizacion = () => {
    const licenciasSeleccionadas = Object.entries(cantidadesLicencias)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([licencia, cantidad]) => {
      // Buscar la licencia en licenciasSAP y licenciasSeidor
      const licenciaObj = licenciasSAP.find(grupo =>
        grupo.licencias.find(l => l.tipo === licencia)
      )?.licencias.find(l => l.tipo === licencia) || licenciasSeidor.find(grupo =>
        grupo.licencias.find(l => l.tipo === licencia)
      )?.licencias.find(l => l.tipo === licencia);
      
      // Si licenciaObj no existe, usar costo por defecto (0 en este caso)
      const costo = licenciaObj ? (solution === 'OP' ? licenciaObj.costoOP : licenciaObj.costoOC) : 0;

      return {
        tipo: licencia,
        cantidad: cantidad as number,
        costo,
        total: cantidad * costo, // Calcular el total usando el costo
      };
    });
    const nuevoItem = {
      tipoCotizacion: subtipoCotizacion,
      baseDeDatos,
      solution,
      subtotalUsuario,
      subtotalBD,
      descuentoPorVolumen,
      descuentoEspecial,
      totalVenta,
      costoVenta,
      margenVenta,
      licenciasSeleccionadas,
    };
  
    let nuevosItems;
    if (editingIndex !== null) {
      // Actualizamos el ítem que estamos editando
      nuevosItems = [...itemsCotizacion];
      nuevosItems[editingIndex] = nuevoItem;
    } else {
      // Agregamos un nuevo ítem
      nuevosItems = [...itemsCotizacion, nuevoItem];
    }
  
    setItemsCotizacion(nuevosItems);
  
    // Cerrar el modal de licencias
    setMostrarModalLicencias(false);
  
    // Resetear los campos y el índice de edición
    resetearCampos();

    setSubtipoCotizacion('');
  };  

  // Función para eliminar un ítem de la cotización
  const eliminarItemCotizacion = (index: number) => {
    const itemsActualizados = [...itemsCotizacion];
    itemsActualizados.splice(index, 1); // Eliminar el ítem en el índice dado
    setItemsCotizacion(itemsActualizados);
    setCantidadesLicencias({});
  };

  // Función para editar un ítem de la cotización (puedes implementar esta función según el requerimiento)
  const editarItemCotizacion = (index: number) => {
    const itemAEditar = itemsCotizacion[index];

    // Guardamos las cantidades originales antes de editar
    setCantidadesOriginales(cantidadesLicencias);

    // Cargar los valores del ítem en los estados correspondientes
    setSubtipoCotizacion(itemAEditar.tipoCotizacion);
    setBaseDeDatos(itemAEditar.baseDeDatos);
    setSolution(itemAEditar.solution);
    setSubtotalUsuario(itemAEditar.subtotalUsuario);
    setSubtotalBD(itemAEditar.subtotalBD);
    setDescuentoPorVolumen(itemAEditar.descuentoPorVolumen);
    setDescuentoEspecial(itemAEditar.descuentoEspecial);
    setTotalVenta(itemAEditar.totalVenta);
    setCostoVenta(itemAEditar.costoVenta);
    setMargenVenta(itemAEditar.margenVenta);

    // Guardamos temporalmente el índice del ítem que estamos editando
    setEditingIndex(index);

    // Mostrar el modal para editar
    setMostrarModalLicencias(true);
  };

  return (
    <div
      className="bg-cover bg-center h-screen"
      style={{
        backgroundImage: 'url(/images/my-background.png)',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="p-10 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Detalles del Cliente</h1>

        {/* Formulario de información del cliente */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input
              value={cliente.nombre}
              disabled
              className="bg-gray-200 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">RUC</label>
            <Input
              value={cliente.ruc}
              disabled
              className="bg-gray-200 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">N° de Compañías</label>
            <Input
              value={cliente.sociedades}
              disabled
              className="bg-gray-200 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Empleados</label>
            <Input
              value={cliente.empleados}
              disabled
              className="bg-gray-200 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Botón para abrir modal de agregar item */}
        <div className="flex justify-end mt-6">
          <Button className="bg-blue-500 text-white" onClick={() => setMostrarModalTipo(true)}>
            Crear Item
          </Button>
        </div>

        {/* Tabla de ítems agregados a la cotización */}
        {itemsCotizacion.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Conceptos</h3>
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
                      <td className="px-4 py-2 border-b">{item.tipoCotizacion}</td>
                      <td className="px-4 py-2 border-b text-center">{item.baseDeDatos}</td>
                      <td className="px-4 py-2 border-b text-center">{item.solution}</td>
                      <td className="px-4 py-2 border-b text-center">{item.totalVenta.toFixed(2)}</td>
                      <td className="px-4 py-2 border-b text-center">{item.costoVenta.toFixed(2)}</td>
                      <td className="px-4 py-2 border-b text-center">{item.margenVenta.toFixed(2)}</td>
                      <td className="px-4 py-2 border-b text-center">
                        <Button
                          className="bg-yellow-500 text-white px-2 py-1 mr-2"
                          onClick={() => editarItemCotizacion(index)}
                        >
                          Editar
                        </Button>
                        <Button
                          className="bg-red-500 text-white px-2 py-1"
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
                                <td className="px-4 py-2">{licencia.tipo}</td>
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
            {cotizacionTipo && (
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
            {cotizacionTipo && subtipoCotizacion && (
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
        <DialogContent className="max-w-6xl h-fit">
          <DialogHeader>
            <DialogTitle>Agregar Licencias</DialogTitle>
          </DialogHeader>

          {/* Selectores de Base de Datos y Solution */}
          <div className="flex space-x-4 mb-4">
            {subtipoCotizacion === 'Licencias SAP' && (
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">Base de Datos</label>
                <Select value={baseDeDatos} onValueChange={setBaseDeDatos}>
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
              <Select value={solution} onValueChange={setSolution}>
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
            <div className="overflow-auto max-h-72">
              <h3 className="text-lg font-semibold">Licencias SAP</h3>
              <table className="min-w-full bg-white border border-gray-200 text-sm">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Tipo de Licencia</th>
                    <th className="py-2 px-4 border-b">En bloques de</th>
                    <th className="py-2 px-4 border-b">Métricas</th>
                    <th className="py-2 px-4 border-b">Costo</th>
                    <th className="py-2 px-4 border-b">Cantidad</th>
                    <th className="py-2 px-4 border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarLicenciasPorBD(licenciasSAP, baseDeDatos).map((grupo, grupoIndex) => (
                    <React.Fragment key={grupoIndex}>
                      <tr>
                        <td className="bg-gray-200 font-semibold px-4 py-2" colSpan={6}>
                          {grupo.categoria}
                        </td>
                      </tr>
                      {grupo.licencias.map((licencia, licenciaIndex) => (
                        <tr key={licenciaIndex}>
                          <td className="px-4 py-2 border-b">{licencia.tipo}</td>
                          <td className="px-4 py-2 border-b text-center">{licencia.salesUnit}</td>
                          <td className="px-4 py-2 border-b text-center">{licencia.metricas}</td>
                          <td className="px-4 py-2 border-b text-center">
                            {solution === 'OP' ? licencia.costoOP : licencia.costoOC}
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            <HookUsage
                              value={cantidadesLicencias[licencia.tipo] || 0}
                              onChange={(value) => handleCantidadChange(licencia.tipo, value)}
                            />
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            {(cantidadesLicencias[licencia.tipo] || 0) * (solution === 'OP' ? licencia.costoOP : licencia.costoOC)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabla de Licencias Seidor */}
          {subtipoCotizacion === 'Licencias Seidor' && (
            <div className="overflow-auto max-h-72">
              <h3 className="text-lg font-semibold">Licencias Seidor</h3>
              <table className="min-w-full bg-white border border-gray-200 text-sm">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Tipo de Licencia</th>
                    <th className="py-2 px-4 border-b">Costo</th>
                    <th className="py-2 px-4 border-b">Cantidad</th>
                    <th className="py-2 px-4 border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {licenciasSeidor.map((grupo, grupoIndex) => (
                    <React.Fragment key={grupoIndex}>
                      <tr>
                        <td className="bg-gray-200 font-semibold px-4 py-2" colSpan={4}>
                          {grupo.categoria}
                        </td>
                      </tr>
                      {grupo.licencias.map((licencia, licenciaIndex) => (
                        <tr key={licenciaIndex}>
                          <td className="px-4 py-2 border-b">{licencia.tipo}</td>
                          <td className="px-4 py-2 border-b text-center">
                            {solution === 'OP' ? licencia.costoOP : licencia.costoOC}
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            <HookUsage
                              value={cantidadesLicencias[licencia.tipo] || 0}
                              onChange={(value) => handleCantidadChange(licencia.tipo, value)}
                            />
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            {(cantidadesLicencias[licencia.tipo] || 0) * (solution === 'OP' ? licencia.costoOP : licencia.costoOC)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
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
                  <Input
                    value={descuentoPorVolumenPorcentaje}
                    readOnly
                    className='w-12 text-center text-sm'
                  />
                  <span className="ml-4 text-red-600 font-bold text-sm">- {formatNumber(descuentoPorVolumen)}</span>
                </div>
              )}

              {/* Descuento Especial - Siempre visible */}
              <div className="flex justify-between items-center">
                <label className="font-medium text-sm">Descuento Especial:</label>
                <div className="flex items-center">
                  <Input
                    value={descuentoEspecial}
                    onChange={(e) => {
                      const newDescuentoEspecial = parseFloat(e.target.value) || 0;
                      setDescuentoEspecial(newDescuentoEspecial);
                      calcularSubtotales();
                    }}
                    className="w-12 text-center text-sm"
                  />
                </div>
                <span className="ml-4 text-red-600 font-bold text-sm">- {formatNumber(subtotalUsuario * descuentoEspecial / 100)}</span>
              </div>

              {/* Descuento Especial Partner solo para SAP */}
              {subtipoCotizacion === 'Licencias SAP' && (
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Descuento Especial Partner:</label>
                  <div className="flex items-center">
                    <Input
                      value={descuentoEspecialPartner}
                      onChange={(e) => {
                        const newDescuentoEspecialPartner = parseFloat(e.target.value) || 0;
                        setDescuentoEspecialPartner(newDescuentoEspecialPartner);
                        calcularSubtotales();
                      }}
                      className="w-12 text-center text-sm"
                    />
                  </div>
                  <span className="ml-4 text-green-600 font-bold text-sm">- {formatNumber((descuentoEspecialPartner / 100) * (subtotalUsuario - descuentoPorVolumen))}</span>
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
            <Button onClick={() => {setMostrarModalLicencias(false); resetearCampos(); setCantidadesLicencias(cantidadesOriginales)}} className="bg-gray-500 text-white px-4 py-2 mr-2">
              Cancelar
            </Button>
            <Button className="bg-blue-500 text-white px-4 py-2" onClick={(agregarItemCotizacion)}>
              Guardar Cotización
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}