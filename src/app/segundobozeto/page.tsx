'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function HookUsage({
  value,
  onChange,
  totalUsuarios,  // Número total de usuarios permitidos
  totalLicencias, // Cantidad total de licencias seleccionadas en el ítem actual
  licenciasSeleccionadas,  // Número total de licencias ya seleccionadas en todos los ítems
}: {
  value: number;
  onChange: (value: number) => void;
  totalUsuarios: number;
  totalLicencias: number;
  licenciasSeleccionadas: number;  // Licencias ya seleccionadas en todos los ítems
}) {
  // Calculamos cuántas licencias disponibles quedan para asignar
  const licenciasDisponibles = totalUsuarios - licenciasSeleccionadas;

  const handleIncrement = () => {
    // Solo incrementar si no supera el total de licencias disponibles
    if (totalLicencias < licenciasDisponibles) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => onChange(value > 0 ? value - 1 : 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue === "") {
      onChange(0);  // Si el campo está vacío, se reemplaza por 0
      return;
    }

    const parsedValue = parseInt(newValue, 10);

    if (!isNaN(parsedValue) && parsedValue >= 0) {
      // Calculamos el nuevo total de licencias sumando las nuevas licencias seleccionadas
      const nuevoTotalLicencias = totalLicencias - value + parsedValue;

      // Solo permitir si el nuevo total de licencias no supera las licencias disponibles
      if (nuevoTotalLicencias <= licenciasDisponibles) {
        onChange(parsedValue);
      }
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
        disabled={totalLicencias >= licenciasDisponibles}  // Deshabilitar si ya alcanzó el número de licencias disponibles
      >
        +
      </Button>
    </div>
  );
}

// Definir los tipos disponibles para cotización
type CotizacionTipo = 'Licencia + Mantenimiento' | 'Servicio' | 'Infraestructura';

export default function CotizacionPage() {
  const [cliente, setCliente] = useState({
    nombre: '',
    ruc: '',
    companias: '',
    empleados: '',
    usuarios: '',
    bd: '', // Base de datos
    solution: '' as 'OP' | 'OC' | '', // Solution (On-Premise u Hosted by Partner)
  });

  const [mostrarModalTipo, setMostrarModalTipo] = useState(false);  // Modal para el primer pop-up (tipo de cotización)
  const [mostrarModalLicencias, setMostrarModalLicencias] = useState(false);  // Modal para el segundo pop-up (licencias)
  const [cotizacionTipo, setCotizacionTipo] = useState<CotizacionTipo | ''>('');  // Tipo de cotización seleccionado
  const [subtipoCotizacion, setSubtipoCotizacion] = useState('');  // Subtipo de cotización seleccionado
  const [itemsCotizados, setItemsCotizados] = useState<any[]>([]);  // Cotizaciones agregadas en la tabla final

  const [subtotalUsuario, setSubtotalUsuario] = useState(0);
  const [subtotalBD, setSubtotalBD] = useState(0);
  const [dsctoVolumenPorcentaje, setDsctoVolumenPorcentaje] = useState(0); 
  const [descuentoPorVolumen, setDescuentoPorVolumen] = useState(0);

  const [descuentoEspecial, setDescuentoEspecial] = useState(0);
  const [descuentoEspecialPartner, setDescuentoEspecialPartner] = useState(0);

  const [totalVenta, setTotalVenta] = useState(0);
  const [costoVenta, setCostoVenta] = useState(0);
  const [margenVenta, setMargenVenta] = useState(0);

  const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);  // Índice del ítem que se está editando

  const [totalLicenciasSeleccionadas, setTotalLicenciasSeleccionadas] = useState(0);

  const cotizacionMap: Record<CotizacionTipo, string[]> = {
    'Licencia + Mantenimiento': ['Licencias SAP', 'Licencias Seidor', 'Licencias Boyum'],
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

  const [cantidadesSAP, setCantidadesSAP] = useState<number[][]>(() =>
    licenciasSAP.map(grupo => Array(grupo.licencias.length).fill(0))
  );
  
  const [cantidadesSeidor, setCantidadesSeidor] = useState<number[][]>(() =>
    licenciasSeidor.map(grupo => Array(grupo.licencias.length).fill(0))
  );  

  const [errores, setErrores] = useState({
    nombre: '',
    ruc: '',
    companias: '',
    empleados: '',
    usuarios: '',
    bd: '',
    solution: '',
  });

  const validarCampos = () => {
    const nuevosErrores = {
      nombre: cliente.nombre ? '' : 'Este campo es obligatorio',
      ruc: cliente.ruc ? '' : 'Este campo es obligatorio',
      companias: cliente.companias ? '' : 'Este campo es obligatorio',
      empleados: cliente.empleados ? '' : 'Este campo es obligatorio',
      usuarios: cliente.usuarios ? '' : 'Este campo es obligatorio',
      bd: cliente.bd ? '' : 'Este campo es obligatorio',
      solution: cliente.solution ? '' : 'Este campo es obligatorio',
    };
    setErrores(nuevosErrores);

    return !Object.values(nuevosErrores).some((error) => error !== '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setCliente({ ...cliente, [field]: e.target.value });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { // Solo permitir números
      setCliente({ ...cliente, [field]: value });
    }
  };

  const handleSelectChange = (value: string, field: string) => {
    setCliente({ ...cliente, [field]: value });
  };

  const handleAgregarItem = () => {
    if (validarCampos()) {
      setMostrarModalTipo(true); // Mostrar primer pop-up si los campos son válidos
    }
  };

  const handleCotizacionTipoChange = (value: CotizacionTipo) => {
    setCotizacionTipo(value);
    setSubtipoCotizacion('');
  };

  const handleAceptarCotizacionTipo = () => {
    setMostrarModalTipo(false); // Cerrar el primer pop-up
    setMostrarModalLicencias(true); // Abrir el segundo pop-up para seleccionar las licencias
  };

  const filtrarLicenciasPorBaseDeDatos = (licencias: typeof licenciasSAP, bd: string) => {
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

  const calcularSumaTotal = (cantidad: number, costo: number) => {
    const cantidadValida = isNaN(cantidad) ? 0 : cantidad;
    const costoValido = isNaN(costo) ? 0 : costo;
    return (cantidadValida * costoValido).toFixed(2);
  };

  const calcularTotalLicencias = () => {
    let totalLicencias = 0;
  
    if (subtipoCotizacion === 'Licencias SAP') {
      cantidadesSAP.forEach((grupo) => {
        grupo.forEach((cantidad) => {
          totalLicencias += cantidad;
        });
      });
    } else if (subtipoCotizacion === 'Licencias Seidor') {
      cantidadesSeidor.forEach((grupo) => {
        grupo.forEach((cantidad) => {
          totalLicencias += cantidad;
        });
      });
    }
  
    return totalLicencias;
  };  

  const handleCantidadChange = (grupoIndex: number, licenciaIndex: number, value: number) => {
    if (subtipoCotizacion === 'Licencias SAP') {
      const nuevasCantidades = [...cantidadesSAP];
      nuevasCantidades[grupoIndex][licenciaIndex] = value || 0;
      setCantidadesSAP(nuevasCantidades);
    } else if (subtipoCotizacion === 'Licencias Seidor') {
      const nuevasCantidades = [...cantidadesSeidor];
      nuevasCantidades[grupoIndex][licenciaIndex] = value || 0;
      setCantidadesSeidor(nuevasCantidades);
    }
  
    calcularSubtotales(); // Llama a la función que recalcula los totales
  };  

  const handleAgregarCotizacion = () => {
    const nuevoItem = {
      grupo : subtipoCotizacion,
      costo : costoVenta,
      margen : margenVenta,
      total : totalVenta,
      cantidadesSAP: subtipoCotizacion === 'Licencias SAP' ? cantidadesSAP : [],  // Guardar las cantidades de SAP
      cantidadesSeidor: subtipoCotizacion === 'Licencias Seidor' ? cantidadesSeidor : [],  // Guardar las cantidades de Seidor

      subtotalUsuario: subtotalUsuario,
      subtotalBD: subtotalBD,

      totalLicenciasItem: calcularTotalLicencias(),

      descuentoPorVolumen: descuentoPorVolumen,
      dsctoVolumenPorcentaje: dsctoVolumenPorcentaje,
      descuentoEspecial: descuentoEspecial,
      descuentoEspecialPartner: descuentoEspecialPartner,
    };
    
    if (indiceEdicion !== null) {
      const nuevasCotizaciones = [...itemsCotizados];
      nuevasCotizaciones[indiceEdicion] = nuevoItem;
      setItemsCotizados(nuevasCotizaciones);
    } else {
      setItemsCotizados([...itemsCotizados, nuevoItem]);
    }

    setIndiceEdicion(null);
    setMostrarModalLicencias(false);
    handleClosePopup();

    // Actualizar el total de licencias seleccionadas entre todos los ítems
    const totalLicenciasSeleccionadas = itemsCotizados.reduce((acc, item) => acc + item.totalLicenciasItem, 0) + nuevoItem.totalLicenciasItem;
    setTotalLicenciasSeleccionadas(totalLicenciasSeleccionadas);  // Actualiza el estado con el nuevo total

  };

  const handleEliminarCotizacion = (index: number) => {
    const nuevasCotizaciones = [...itemsCotizados];
    nuevasCotizaciones.splice(index, 1);
    setItemsCotizados(nuevasCotizaciones);
  };

  const handleEditarCotizacion = (index: number) => {
    const item = itemsCotizados[index];
  
    setSubtipoCotizacion(item.grupo);
    setCostoVenta(item.costo);
    setMargenVenta(item.margen);
    setTotalVenta(item.total);
    
    if (item.grupo === 'Licencias SAP') {
      // Cargar las cantidades correspondientes para SAP
      const nuevasCantidadesSAP = cantidadesSAP.map((grupo, grupoIndex) =>
        grupo.map((_, licenciaIndex) =>
          item.cantidadesSAP[grupoIndex] ? item.cantidadesSAP[grupoIndex][licenciaIndex] : 0
        )
      );
      setCantidadesSAP(nuevasCantidadesSAP);
  
      // Cargar subtotales para SAP
      setSubtotalUsuario(item.subtotalUsuario || 0);  // Restablece el subtotal de usuario
      setSubtotalBD(item.subtotalBD || 0);  // Restablece el subtotal de BD
  
      // Cargar los descuentos para SAP
      setDescuentoPorVolumen(item.descuentoPorVolumen || 0);
      setDsctoVolumenPorcentaje(item.dsctoVolumenPorcentaje || 0);
      setDescuentoEspecial(item.descuentoEspecial || 0);
      setDescuentoEspecialPartner(item.descuentoEspecialPartner || 0);
    } else if (item.grupo === 'Licencias Seidor') {
      // Cargar las cantidades correspondientes para Seidor
      const nuevasCantidadesSeidor = cantidadesSeidor.map((grupo, grupoIndex) =>
        grupo.map((_, licenciaIndex) =>
          item.cantidadesSeidor[grupoIndex] ? item.cantidadesSeidor[grupoIndex][licenciaIndex] : 0
        )
      );
      setCantidadesSeidor(nuevasCantidadesSeidor);
      setDescuentoEspecial(item.descuentoEspecial || 0);
      // En Seidor, los subtotales de usuario y BD no aplican
      setSubtotalUsuario(item.subtotalUsuario || 0);  // Solo subtotal de usuario
    }
  
    setIndiceEdicion(index);
    setMostrarModalLicencias(true);
  };  

  const calcularDescuento = (subtotalUsuario: number, subtotalBD: number): void => {
    const totalConBD = subtotalUsuario + subtotalBD;
    let descuento = 0;

    if (totalConBD > 300000) {
      descuento = subtotalUsuario * 0.40;
    } else if (totalConBD > 150000) {
      descuento = subtotalUsuario * 0.30;
    } else if (totalConBD > 30000) {
      descuento = subtotalUsuario * 0.20;
    } else if (totalConBD > 15000) {
      descuento = subtotalUsuario * 0.10;
    }

    setDescuentoPorVolumen(descuento);
    setDsctoVolumenPorcentaje((descuento / subtotalUsuario) * 100);

  };  

  const calcularTotales = (subtotalUsuario: number, subtotalBD: number) => {
    if (subtipoCotizacion === 'Licencias SAP') {
      // Calcular el total de la venta sumando subtotalUsuario y subtotalBD
      const totalVenta = (subtotalUsuario + subtotalBD)
        - (subtotalUsuario * (dsctoVolumenPorcentaje / 100))
        - (subtotalUsuario * (descuentoEspecial / 100));
  
      setTotalVenta(totalVenta);
  
      // El costo de venta incluye subtotalUsuario y subtotalBD, aplicando descuentos
      const costoVenta = ((subtotalUsuario + subtotalBD - (subtotalUsuario * dsctoVolumenPorcentaje / 100)) / 2)
        - (descuentoEspecialPartner / 100 * (subtotalUsuario + subtotalBD - (subtotalUsuario * dsctoVolumenPorcentaje / 100)));
  
      setCostoVenta(costoVenta);
  
      // El margen de venta es totalVenta - costoVenta, pero sin incluir subtotalBD en el cálculo de margen
      const margenVenta = (subtotalUsuario
      - (subtotalUsuario * (dsctoVolumenPorcentaje / 100))
      - (subtotalUsuario * (descuentoEspecial / 100)) - ((subtotalUsuario - (subtotalUsuario * dsctoVolumenPorcentaje / 100)) / 2)
      - (descuentoEspecialPartner / 100 * (subtotalUsuario + subtotalBD - (subtotalUsuario * dsctoVolumenPorcentaje / 100))));

      setMargenVenta(margenVenta);
    } else if (subtipoCotizacion === 'Licencias Seidor') {
      // Para Seidor, no hay subtotal de BD, así que seguimos calculando como antes
      const totalVenta = subtotalUsuario - (subtotalUsuario * (descuentoEspecial / 100));
      setTotalVenta(totalVenta);
      setCostoVenta(0);  // No calculas el costo de venta en Seidor
      setMargenVenta(totalVenta);  // El margen es igual al total en Seidor
    }
  };  

  useEffect(() => {
    if (subtipoCotizacion === 'Licencias SAP') {
      calcularTotales(subtotalUsuario, subtotalBD);
    } else if (subtipoCotizacion === 'Licencias Seidor') {
      calcularTotales(subtotalUsuario, 0); // No hay subtotal BD en Seidor
    }
  }, [subtotalUsuario, subtotalBD, descuentoPorVolumen, descuentoEspecial, descuentoEspecialPartner]);
  
  const calcularSubtotalesSAP = () => {
    let totalUsuario = 0;
    let totalBD = 0;
  
    const licenciasFiltradas = filtrarLicenciasPorBaseDeDatos(licenciasSAP, cliente.bd);
  
    // Calcular subtotales de las licencias de SAP
    licenciasFiltradas.forEach((grupo, grupoIndex) => {
      grupo.licencias.forEach((licencia, licenciaIndex) => {
        const cantidad = cantidadesSAP[grupoIndex][licenciaIndex];
        const costo = cliente.solution === 'OP' ? licencia.costoOP : licencia.costoOC;
        const total = cantidad * costo;
  
        if (cantidad > 0) {
          if (grupo.categoria.includes("Usuarios")) {
            totalUsuario += total;
          } else if (grupo.categoria.includes("Databases")) {
            totalBD += total;
          }
        }
      });
    });
  
    setSubtotalUsuario(totalUsuario);
    setSubtotalBD(totalBD);
  
    // Aplicar descuento por volumen solo en SAP
    calcularDescuento(totalUsuario, totalBD);
  };
  
  const calcularSubtotalesSeidor = () => {
    let totalUsuario = 0;
  
    // Calcular subtotales de las licencias de Seidor
    licenciasSeidor.forEach((grupo, grupoIndex) => {
      grupo.licencias.forEach((licencia, licenciaIndex) => {
        const cantidad = cantidadesSeidor[grupoIndex][licenciaIndex];
        const costo = cliente.solution === 'OP' ? licencia.costoOP : licencia.costoOC;
        const total = cantidad * costo;
  
        if (cantidad > 0) {
          totalUsuario += total;
        }
      });
    });
  
    setSubtotalUsuario(totalUsuario);
    setSubtotalBD(0);  // No hay BD en Seidor
  
    // No aplicar descuento por volumen en Seidor, solo descuento especial
    calcularTotales(totalUsuario, 0);
  };

  const calcularSubtotales = () => {
    if (subtipoCotizacion === 'Licencias SAP') {
      calcularSubtotalesSAP();
    } else if (subtipoCotizacion === 'Licencias Seidor') {
      calcularSubtotalesSeidor();
    }
  };

  const resetValores = () => {
    setCantidadesSAP(licenciasSAP.map(grupo => Array(grupo.licencias.length).fill(0)));
    setCantidadesSeidor(licenciasSeidor.map(grupo => Array(grupo.licencias.length).fill(0)));
    setSubtotalUsuario(0);
    setSubtotalBD(0);
    setDsctoVolumenPorcentaje(0);
    setDescuentoPorVolumen(0);
    setDescuentoEspecial(0);
    setDescuentoEspecialPartner(0);
    setTotalVenta(0);
    setCostoVenta(0);
    setMargenVenta(0);
  };

  const handleClosePopup = () => {
    setIndiceEdicion(null); // Reiniciar el índice de edición
    resetValores(); // Reiniciar los valores
    setMostrarModalLicencias(false); // Cerrar el pop-up
  };   

  const formatNumber = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };  
  
  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Universal Quoter</h1>

      {/* Formulario */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <Input 
            placeholder="Escribe..."
            value={cliente.nombre}
            onChange={(e) => handleInputChange(e, 'nombre')}
            className={errores.nombre ? 'border-red-500' : ''}
          />
          {errores.nombre && <p className="text-red-500 text-xs">{errores.nombre}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">RUC</label>
          <Input 
            placeholder="Escribe..."
            value={cliente.ruc}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              target.value = target.value.replace(/\D/g, ''); // Reemplazar todo lo que no sea número
              setCliente({ ...cliente, ruc: target.value });
            }}
            className={errores.ruc ? 'border-red-500' : ''}
          />
          {errores.ruc && <p className="text-red-500 text-xs">{errores.ruc}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">N° de Compañías</label>
          <Input 
            placeholder="Escribe..."
            value={cliente.companias}
            onChange={(e) => handleNumberInputChange(e, 'companias')}
            className={errores.companias ? 'border-red-500' : ''}
          />
          {errores.companias && <p className="text-red-500 text-xs">{errores.companias}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Empleados</label>
          <Input 
            placeholder="Escribe..."
            value={cliente.empleados}
            onChange={(e) => handleNumberInputChange(e, 'empleados')}
            className={errores.empleados ? 'border-red-500' : ''}
          />
          {errores.empleados && <p className="text-red-500 text-xs">{errores.empleados}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Usuarios</label>
          <Input 
            placeholder="Escribe..."
            value={cliente.usuarios}
            onChange={(e) => handleNumberInputChange(e, 'usuarios')}
            className={errores.usuarios ? 'border-red-500' : ''}
          />
          {errores.usuarios && <p className="text-red-500 text-xs">{errores.usuarios}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Base de Datos</label>
          <Select value={cliente.bd} onValueChange={(value) => handleSelectChange(value, 'bd')}>
            <SelectTrigger className={`w-full ${errores.bd ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecciona base de datos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SQL">SQL</SelectItem>
              <SelectItem value="Hana">Hana</SelectItem>
            </SelectContent>
          </Select>
          {errores.bd && <p className="text-red-500 text-xs">{errores.bd}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Solution</label>
          <Select value={cliente.solution} onValueChange={(value) => handleSelectChange(value, 'solution')}>
            <SelectTrigger className={`w-full ${errores.solution ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecciona solution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OP">On-Premise</SelectItem>
              <SelectItem value="OC">Hosted by Partner</SelectItem>
            </SelectContent>
          </Select>
          {errores.solution && <p className="text-red-500 text-xs">{errores.solution}</p>}
        </div>
      </div>

      {/* Botón "Agregar Item" */}
      <div className="mb-6 flex justify-end">
        <Button className="bg-black text-white px-4 py-2" onClick={handleAgregarItem}>
          Agregar Item
        </Button>
      </div>

      {/* Tabla de cotizaciones agregadas */}
      <div className=" mb-6">
        <h2 className="text-lg font-semibold mb-2">Cotizaciones Agregadas</h2>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Grupo</th>
              <th className="px-4 py-2 border">Costo</th>
              <th className="px-4 py-2 border">Margen</th>
              <th className="px-4 py-2 border">Total</th>
              <th className="px-4 py-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {itemsCotizados.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border">{item.grupo}</td>
                <td className="px-4 py-2 border">{formatNumber(item.costo)}</td>
                <td className="px-4 py-2 border">{formatNumber(item.margen)}</td>
                <td className="px-4 py-2 border">{formatNumber(item.total)}</td>
                <td className="px-4 py-2 border text-center">
                  <Button className="bg-yellow-500 text-white mr-2 px-2 py-1" onClick={() => handleEditarCotizacion(index)}>
                    Editar
                  </Button>
                  <Button className="bg-red-500 text-white px-2 py-1" onClick={() => handleEliminarCotizacion(index)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Primer Pop-up para seleccionar tipo de cotización */}
      <Dialog open={mostrarModalTipo} onOpenChange={setMostrarModalTipo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Item</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tipo de Cotización</label>
            <Select value={cotizacionTipo} onValueChange={handleCotizacionTipoChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona tipo de cotización" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Licencia + Mantenimiento">Licencia + Mantenimiento</SelectItem>
                <SelectItem value="Servicio">Servicio</SelectItem>
                <SelectItem value="Infraestructura">Infraestructura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {cotizacionTipo && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Subtipo de Cotización</label>
              <Select value={subtipoCotizacion} onValueChange={setSubtipoCotizacion}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona subtipo de cotización" />
                </SelectTrigger>
                <SelectContent>
                  {cotizacionMap[cotizacionTipo]?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end">
            <Button className="bg-blue-500 text-white px-4 py-2" onClick={handleAceptarCotizacionTipo}>
              Aceptar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Segundo Pop-up para seleccionar licencias */}
      <Dialog open={mostrarModalLicencias} onOpenChange={() => setMostrarModalLicencias(mostrarModalLicencias)}>
        <DialogContent className='max-w-screen-xl' style={{height: '700px'}}>
          <DialogHeader>
            <DialogTitle>Agregar Licencias</DialogTitle>
          </DialogHeader>

          {/* Subtipo de cotizacion SAP */}
          {subtipoCotizacion === 'Licencias SAP' && (
          <>
            {cliente.bd && (
              <div className="mt-4 overflow-auto max-h-72">
                <h3 className="text-lg font-semibold">Licencias SAP</h3>

                {filtrarLicenciasPorBaseDeDatos(licenciasSAP, cliente.bd).map((grupo, grupoIndex) => (
                  <div key={grupoIndex} className="mb-4">
                    <h4 className="text-md font-semibold">{grupo.categoria}</h4>
                    <table className="min-w-full bg-white border border-gray-200 text-sm">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b">Tipo de Licencia</th>
                          <th className="py-2 px-4 border-b">En bloques de</th>
                          <th className="py-2 px-4 border-b">Métricas</th>
                          <th className="py-2 px-4 border-b">Costo</th>
                          <th className="py-2 px-4 border-b">Cantidad</th>
                          <th className="py-2 px-4 border-b">Total</th>
                          <th className="py-2 px-4 border-b">Parámetro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grupo.licencias.map((licencia, licenciaIndex) => (
                          <tr key={licenciaIndex}>
                            <td className="py-2 px-4 border-b">{licencia.tipo}</td>
                            <td className="py-2 px-4 border-b text-center">{licencia.salesUnit}</td>
                            <td className="py-2 px-4 border-b text-center">{licencia.metricas}</td>
                            <td className="py-2 px-4 border-b text-center">{formatNumber(cliente.solution === 'OP' ? licencia.costoOP : licencia.costoOC)}</td>
                            <td className="py-2 px-4 border-b w-32">
                            <HookUsage
                              value={cantidadesSAP[grupoIndex][licenciaIndex] || 0}
                              onChange={(value) => handleCantidadChange(grupoIndex, licenciaIndex, value)}
                              totalUsuarios={parseInt(cliente.usuarios, 10) || 0}  // Máximo permitido según el número de usuarios
                              totalLicencias={calcularTotalLicencias()}  // Cantidad total de licencias seleccionadas
                              licenciasSeleccionadas={totalLicenciasSeleccionadas}
                            />
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                              {formatNumber(parseFloat(calcularSumaTotal(cantidadesSAP[grupoIndex][licenciaIndex], cliente.solution === 'OP' ? licencia.costoOP : licencia.costoOC)))}
                            </td>
                            <td className="py-2 px-4 border-b text-center">{licencia.parametro}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {/* Subtotales y Descuento */}
            <div className="flex justify-between mt-4">
              {/* Parte izquierda con subtotales y descuento */}
              <div className="w-2/3 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Subtotal de Licencias de Usuario:</label>
                  <span className="text-gray-700 text-sm">$ {formatNumber(subtotalUsuario)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Subtotal de Licencias de BD:</label>
                  <span className="text-gray-700 text-sm">$ {formatNumber(subtotalBD)}</span>
                </div>

                {/* Descuento por Volumen */}
                <div className='flex justify-between items-center'>
                  <label className="font-medium text-sm">Descuento por Volumen:</label>
                  <div className="flex items-end">
                    <Input
                      value={dsctoVolumenPorcentaje}
                      readOnly
                      className="w-12 text-center text-sm"
                    />
                  </div>
                  <span className="ml-4 text-red-600 font-bold text-sm">-$ {formatNumber(descuentoPorVolumen)}</span> 
                </div>

                {/* Descuento Especial */}
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Descuento especial:</label>
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
                  <span className="ml-4 text-red-600 font-bold text-sm">-${formatNumber(subtotalUsuario * descuentoEspecial / 100)}</span>
                </div>

                {/* Descuento Especial del Partner */}
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Descuento especial del Partner (%):</label>
                  <div>
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
                  <span className="ml-4 text-green-600 font-bold text-sm">$ {formatNumber((descuentoEspecialPartner / 100) * (subtotalUsuario - descuentoPorVolumen))}</span>
                </div>

                {/* Total de Venta */}
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Total Venta:</label>
                  <span className="text-gray-700 text-sm">$ {formatNumber(totalVenta)}</span>
                </div>

                {/* Costo de Venta */}
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Costo Venta:</label>
                  <span className="text-gray-700 text-sm">$ {formatNumber(costoVenta)}</span>
                </div>

                {/* Margen de Venta */}
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Margen Venta:</label>
                  <span className="text-yellow-500 text-sm">$ {formatNumber(margenVenta)}</span>
                </div>
              </div>
            </div>
          </>
          )}

          {/* Subtipo de cotizacion Seidor */}
          {subtipoCotizacion === 'Licencias Seidor' && (
          <>
            {cliente.bd && (
            <div className="mt-4 overflow-auto max-h-72">
              <h4 className="text-md font-semibold">Licencias Seidor</h4>

              {licenciasSeidor.map((grupo, grupoIndex) => (
                <div key={grupoIndex} className="mb-4">
                  <h4 className="text-md font-semibold">{grupo.categoria}</h4>
                  <table className="min-w-full bg-white border border-gray-200 text-sm">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Tipo de Licencia</th>
                        <th className="py-2 px-4 border-b">Costo</th>
                        <th className="py-2 px-4 border-b">Cantidad</th>
                        <th className="py-2 px-4 border-b">Total</th>
                        <th className="py-2 px-4 border-b">Parámetro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.licencias.map((licencia, licenciaIndex) => (
                        <tr key={licenciaIndex}>
                          <td className="py-2 px-4 border-b">{licencia.tipo}</td>
                          <td className="py-2 px-4 border-b text-center">{formatNumber(cliente.solution === 'OP' ? licencia.costoOP : licencia.costoOC)}</td>
                          <td className="py-2 px-4 border-b w-32">
                            <HookUsage
                              value={cantidadesSeidor[grupoIndex][licenciaIndex] || 0} // Cantidad por licencia
                              onChange={(value) => handleCantidadChange(grupoIndex, licenciaIndex, value)} // Actualiza la cantidad
                              totalUsuarios={parseInt(cliente.usuarios, 10) || 0} // Máximo permitido según el número de usuarios
                              totalLicencias={calcularTotalLicencias()} // Cantidad total de licencias seleccionadas
                              licenciasSeleccionadas={totalLicenciasSeleccionadas}
                            />
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {formatNumber(parseFloat(calcularSumaTotal(cantidadesSeidor[grupoIndex][licenciaIndex], cliente.solution === 'OP' ? licencia.costoOP : licencia.costoOC)))}
                          </td>
                          <td className="py-2 px-4 border-b text-center">{licencia.parametro}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                ))}
              </div>
            )}
            
            {/* Subtotales y Descuento */}
            <div className="flex justify-between mt-4">
              <div className="w-2/3 space-y-2"> 
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Subtotal de Licencias de Usuario:</label>
                  <span className="text-gray-700 text-sm">$ {formatNumber(subtotalUsuario)}</span> 
                </div>

                {/* Descuento Especial */}
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Descuento especial:</label>
                  <div className="flex items-center">
                    <Input
                      value={descuentoEspecial}
                      onChange={(e) => {
                        const newDescuentoEspecial = parseFloat(e.target.value) || 0;
                        setDescuentoEspecial(newDescuentoEspecial);
                        calcularSubtotales(); // Recalcula los subtotales al cambiar el descuento especial
                      }}
                      className="w-12 text-center text-sm"
                    />
                  </div>
                  <span className="ml-4 text-red-600 font-bold text-sm">-${formatNumber(subtotalUsuario * descuentoEspecial / 100)}</span>
                </div>

                {/* Total de Venta */}
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Total Venta:</label> 
                  <span className="text-gray-700 text-sm">$ {formatNumber(totalVenta)}</span>
                </div>

                {/* Costo de Venta */}
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Costo Venta:</label> 
                  <span className="text-gray-700 text-sm">$ {0}</span>
                </div>

                {/* Margen de Venta */}
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Margen Venta:</label> 
                  <span className="text-yellow-500 text-sm">$ {formatNumber(totalVenta)}</span>
                </div>
              </div>
            </div>
          </>
          )}

          <div className="flex justify-end">
            <Button onClick={handleClosePopup} className="bg-gray-500 text-white px-4 py-2 mr-2">
              Cancelar
            </Button>
            <Button className="bg-blue-500 text-white px-4 py-2" onClick={() => handleAgregarCotizacion()}>
              {indiceEdicion !== null ? 'Confirmar cambios' : 'Agregar Cotización'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};