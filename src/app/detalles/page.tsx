'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";

function HookUsage({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const handleIncrement = () => onChange(value + 1);
  const handleDecrement = () => onChange(value > 0 ? value - 1 : 0); // Evitar números negativos

  return (
    <div className="flex items-center space-x-2"> {/* Flex para alinear los botones */}
      <Button onClick={handleDecrement} className="bg-gray-200 hover:bg-gray-300 text-black rounded-full px-4 py-2">-</Button>
      
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}  // Cambiar el valor manualmente
        className="w-16 text-center border border-gray-300 rounded-md"
      />

      <Button onClick={handleIncrement} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2">+</Button>
    </div>
  );
}

export default function Detalles() {
  const [cliente, setCliente] = useState({
    nombre: '',
    ruc: '',
    companias: '',
    empleados: '',
    usuarios: '',
    bd: '',
    solution: '' as 'OP' | 'OC' | '',
  });

  const [mostrarPrimeraPagina, setMostrarPrimeraPagina] = useState(true); // Controla qué página mostrar
  const [cotizacionTipo, setCotizacionTipo] = useState<CotizacionTipo | ''>('');
  const [cotizacionOpciones, setCotizacionOpciones] = useState<string[]>([]);
  const [subtipoCotizacion, setSubtipoCotizacion] = useState('');

  // Estados de error para cada campo
  const [errores, setErrores] = useState({
    nombre: '',
    ruc: '',
    companias: '',
    empleados: '',
    usuarios: '',
    bd: '',
    solution: '',
  });

  const cotizacionMap = {
    'Licencia + Mantenimiento': ['Licencia SAP', 'Licencia Seidor', 'Licencia Boyum'],
    'Servicio': ['Consultoría', 'Soporte', 'Capacitación'],
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCliente({ ...cliente, [field]: value });
    }
  };

  type CotizacionTipo = 'Licencia + Mantenimiento' | 'Servicio';

  const handleCotizacionTipoChange = (value: CotizacionTipo) => {
    setCotizacionTipo(value);
    setCotizacionOpciones(cotizacionMap[value] || []);
    setSubtipoCotizacion('');
  };

  // Validación de campos
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

    // Verificar si hay errores
    return !Object.values(nuevosErrores).some((error) => error !== '');
  };

  const handleContinuar = () => {
    if (validarCampos()) {
      setMostrarPrimeraPagina(false); // Cambia a la segunda página si no hay errores
    }
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
    { tipo: "Office on the web Frame", parametro: "Licencia de Única Vez", costoOP: 5000, costoOC: 0 },
    { tipo: "AddOn Cuentas Destino", parametro: "Licencia de Única Vez", costoOP: 1500, costoOC: 0 },
    { tipo: "AddOn Numeración Fiscal", parametro: "Licencia de Única Vez", costoOP: 2500, costoOC: 0 },
    { tipo: "AddOn Pagos Masivos", parametro: "Licencia de Única Vez", costoOP: 2500, costoOC: 0 },
    { tipo: "Validador SUNAT (Ruc y Tipo de Cambio)", parametro: "x cada 2000 Consultas", costoOP: 2500, costoOC: 0 },
    { tipo: "AddOn de Letras", parametro: "Licencia de Única Vez", costoOP: 5000, costoOC: 0 },
    { tipo: "AddOn de Facturas Negociables", parametro: "Licencia de Única Vez", costoOP: 5000, costoOC: 0 },
    { tipo: "Middleware Facturación Electrónica", parametro: "x cada 5 Razones Sociales", costoOP: 2000, costoOC: 100 },
    { tipo: "Middleware Retenciones Electrónicas", parametro: "x cada 5 Razones Sociales", costoOP: 1500, costoOC: 100 },
    { tipo: "Middleware Percepciones Electrónicas", parametro: "x cada 5 Razones Sociales", costoOP: 1500, costoOC: 0 },
    { tipo: "Middleware Guías de Remisión Electrónicas", parametro: "x cada 5 Razones Sociales", costoOP: 1500, costoOC: 0 },
    { tipo: "AddOn de Provisión de Gastos", parametro: "Licencia de Única Vez", costoOP: 2500, costoOC: 0 },
    { tipo: "AddOn Extractor de Pedidos B2B", parametro: "Licencia de Única Vez", costoOP: 5000, costoOC: 0 },
    { tipo: "Intercompany Seidor", parametro: "Licencia de Única Vez", costoOP: 2500, costoOC: 0 },
    { tipo: "Aplicación Mobile Seidor", parametro: "Usuarios Ilimitados", costoOP: 5000, costoOC: 0 },
    { tipo: "Portal Web Caja Chica / Entregas a Rendir (SICER)", parametro: "Usuarios Ilimitados", costoOP: 5000, costoOC: 0 },
    { tipo: "Portal Web de Requerimientos", parametro: "Usuarios Ilimitados", costoOP: 5000, costoOC: 0 },
    { tipo: "Web Reporting", parametro: "Licencia de Única Vez", costoOP: 3000, costoOC: 0 },
  
    // Verticales SAP Business One
    { tipo: "AddOn de Lotes y Ubicaciones", parametro: "Licencia de Única Vez", costoOP: 5000, costoOC: 0 },
    { tipo: "AddOn de Transporte y Distribución", parametro: "Licencia de Única Vez", costoOP: 1500, costoOC: 0 },
    { tipo: "AddOn de Manifiesto de Transporte", parametro: "Licencia de Única Vez", costoOP: 3500, costoOC: 0 },
    { tipo: "AddOn Bitácora de Importaciones", parametro: "Licencia de Única Vez", costoOP: 5000, costoOC: 250 },
    { tipo: "AddOn de Mantenimiento de Equipos", parametro: "Licencia de Única Vez", costoOP: 5000, costoOC: 0 },
    { tipo: "Addon de Inmobiliaria Seidor", parametro: "Licencia de Única Vez", costoOP: 5000, costoOC: 0 },
    { tipo: "Addon de Educación Seidor", parametro: "Licencia de Única Vez", costoOP: 5000, costoOC: 0 },
    { tipo: "Portal Web Proveedores", parametro: "Usuarios Ilimitados", costoOP: 5000, costoOC: 0 },
    { tipo: "Reporteros Electrónicos", parametro: "Usuarios Ilimitados", costoOP: 5000, costoOC: 0 },
  ];

  const [cantidades, setCantidades] = useState<number[][]>(() =>
    licenciasSAP.map(grupo => Array(grupo.licencias.length).fill(0))
  );

  // Función para obtener el costo según la solution seleccionada
  const getCosto = (licencia: { costoOP: number, costoOC: number }) => {
    return cliente.solution === 'OP' ? licencia.costoOP : licencia.costoOC;
  };

    // Calcula el total de la licencia multiplicando la cantidad por el costo de la licencia
    const calcularSumaTotal = (cantidad: number, costo: number) => {
      const cantidadValida = isNaN(cantidad) ? 0 : cantidad;
      const costoValido = isNaN(costo) ? 0 : costo;
      return (cantidadValida * costoValido).toFixed(2);
    };

  const handleCantidadChange = (grupoIndex: number, licenciaIndex: number, value: number) => {
    const nuevasCantidades = [...cantidades];
    nuevasCantidades[grupoIndex][licenciaIndex] = value || 0;
    setCantidades(nuevasCantidades);
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

  const formatNumber = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };  

  return (
    <div className="p-20 font-poppins">
      {mostrarPrimeraPagina ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">Detalles del Cliente</h1>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <Input
              className={errores.nombre ? 'border-red-500' : ''}
              value={cliente.nombre}
              onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
              placeholder="Nombre"
            />
            {errores.nombre && <p className="text-red-500 text-xs">{errores.nombre}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">RUC</label>
            <Input
              className={errores.ruc ? 'border-red-500' : ''}
              value={cliente.ruc}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value.replace(/\D/g, '');
                setCliente({ ...cliente, ruc: target.value });
              }}
              placeholder="RUC"
            />
            {errores.ruc && <p className="text-red-500 text-xs">{errores.ruc}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">N° de Compañías</label>
            <Input
              className={errores.companias ? 'border-red-500' : ''}
              value={cliente.companias}
              onChange={(e) => handleNumberInputChange(e, 'companias')}
              placeholder="N° de Compañías"
              type="text"
            />
            {errores.companias && <p className="text-red-500 text-xs">{errores.companias}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Empleados</label>
            <Input
              className={errores.empleados ? 'border-red-500' : ''}
              value={cliente.empleados}
              onChange={(e) => handleNumberInputChange(e, 'empleados')}
              placeholder="N° Empleados"
              type="text"
            />
            {errores.empleados && <p className="text-red-500 text-xs">{errores.empleados}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Usuarios</label>
            <Input
              className={errores.usuarios ? 'border-red-500' : ''}
              value={cliente.usuarios}
              onChange={(e) => handleNumberInputChange(e, 'usuarios')}
              placeholder="N° Usuarios"
              type="text"
            />
            {errores.usuarios && <p className="text-red-500 text-xs">{errores.usuarios}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Base de Datos</label>
            <Select value={cliente.bd} onValueChange={(value) => setCliente({ ...cliente, bd: value })}>
                <SelectTrigger className={errores.bd ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Base de datos" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="SQL">SQL</SelectItem>
                    <SelectItem value="Hana">Hana</SelectItem>
                </SelectContent>
                </Select>
            {errores.bd && <p className="text-red-500 text-xs">{errores.bd}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Solution</label>
            <Select value={cliente.solution} onValueChange={(value) => setCliente({ ...cliente, solution: value as 'OP' | 'OC' })}>
                <SelectTrigger className={errores.solution ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Solution" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="OP">On-Premise</SelectItem>
                    <SelectItem value="OC">Hosted by Partner</SelectItem>
                </SelectContent>
                </Select>
            {errores.solution && <p className="text-red-500 text-xs">{errores.solution}</p>}
          </div>
          <div className="flex justify-end py-5">
            <Button className="bg-black text-white rounded-full px-4 py-2 shadow-md hover:bg-primary" onClick={handleContinuar}>
                Continuar a la cotización
            </Button>
          </div>
        </div>
    ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">Detalles Cotización</h1>
          <label className="block text-sm font-medium mb-2">Tipo de Cotización</label>
          <Select value={cotizacionTipo} onValueChange={handleCotizacionTipoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de cotización" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Licencia + Mantenimiento">Licencia + Mantenimiento</SelectItem>
              <SelectItem value="Servicio">Servicio</SelectItem>
              <SelectItem value="solution">Solution</SelectItem>
            </SelectContent>
          </Select>

          {cotizacionTipo && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Selecciona el Subtipo de Cotización</label>
              <Select value={subtipoCotizacion} onValueChange={(value) => setSubtipoCotizacion(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Subtipo de cotización" />
                </SelectTrigger>
                <SelectContent>
                  {cotizacionOpciones.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mostrar tabla de licencias SAP */}
          {cliente.solution && subtipoCotizacion === "Licencia SAP" && (
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-2">Licencias SAP Business One</h2>
              {filtrarLicenciasPorBaseDeDatos(licenciasSAP, cliente.bd).map((grupo, grupoIndex) => (
                <div key={grupoIndex} className="mb-4">
                  <h3 className="text-lg font-semibold">{grupo.categoria}</h3>
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Tipo de Licencia</th>
                        <th className="py-2 px-4 border-b">En bloques de:</th>
                        <th className="py-2 px-4 border-b">Metricas</th>
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
                          <td className="py-2 px-4 border-b text-center">
                            {formatNumber(getCosto(licencia))}
                          </td>
                          <td className="py-2 px-4 border-b w-32">
                            <HookUsage
                              value={cantidades[grupoIndex][licenciaIndex] || 0}
                              onChange={(value) => handleCantidadChange(grupoIndex, licenciaIndex, value)}
                            />
                          </td>
                          <td className="py-2 px-4 border-b w-28 text-center">
                            {formatNumber(parseFloat(calcularSumaTotal(cantidades[grupoIndex][licenciaIndex], getCosto(licencia))))}
                          </td>
                          <td className="py-2 px-4 border-b text-center">{licencia.parametro}</td> {/* Parámetro como última columna */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* Botón para regresar a la primera página */}
          <div className="mt-4">
            <Button className = "bg-black text-white rounded-full px-4 py-2 shadow-md hover:bg-primary" onClick={() => setMostrarPrimeraPagina(true)}>Regresar</Button>
          </div>
        </div>
      )}
    </div>
    );
}