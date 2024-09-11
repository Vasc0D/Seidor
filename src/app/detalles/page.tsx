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
  totalLicencias  // Cantidad total de licencias seleccionadas
}: {
  value: number;
  onChange: (value: number) => void;
  totalUsuarios: number;
  totalLicencias: number;
}) {
  const handleIncrement = () => {
    if (totalLicencias < totalUsuarios) {
      onChange(value + 1);
    }
  };
  
  const handleDecrement = () => onChange(value > 0 ? value - 1 : 0);

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={handleDecrement} className="bg-gray-200 hover:bg-gray-300 text-black rounded-full px-4 py-2">-</Button>
      
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-16 text-center border border-gray-300 rounded-md"
      />

      <Button
        onClick={handleIncrement}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2"
        disabled={totalLicencias >= totalUsuarios}  // Deshabilitar si la cantidad total de licencias alcanza el número de usuarios
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
        }
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

  const [cantidades, setCantidades] = useState<number[][]>(() =>
    licenciasSAP.map(grupo => Array(grupo.licencias.length).fill(0))
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
    cantidades.forEach((grupo) => {
      grupo.forEach((cantidad) => {
        totalLicencias += cantidad;
      });
    });
    return totalLicencias;
  };  

  const handleCantidadChange = (grupoIndex: number, licenciaIndex: number, value: number) => {
    const nuevasCantidades = [...cantidades];
    nuevasCantidades[grupoIndex][licenciaIndex] = value || 0;
    setCantidades(nuevasCantidades);

    calcularSubtotales();
  };

  const handleAgregarCotizacion = (grupo: string) => {
    const nuevoItem = {
      grupo,
    };
    setItemsCotizados([...itemsCotizados, nuevoItem]);
    setMostrarModalLicencias(false);
  };

  const handleEliminarCotizacion = (index: number) => {
    const nuevasCotizaciones = [...itemsCotizados];
    nuevasCotizaciones.splice(index, 1);
    setItemsCotizados(nuevasCotizaciones);
  };

  const handleEditarCotizacion = (index: number) => {
    // Lógica para editar el item seleccionado
  };

  // Este useEffect se ejecutará cada vez que descuentoPorVolumen cambie
  useEffect(() => {
    if (subtotalUsuario > 0) {
      calcularCostoVenta(subtotalUsuario);  // Recalcula el costo de venta cuando descuentoPorVolumen cambie
    }
  }, [descuentoPorVolumen, subtotalUsuario]);

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

  const calcularTotalVenta = (subtotalUsuario: number) => {
    const dsctoEspecial = subtotalUsuario * (descuentoEspecial / 100);
    const total = subtotalUsuario - descuentoPorVolumen - dsctoEspecial;
    setTotalVenta(total);
  };
  
  const calcularCostoVenta = (subtotalUsuario: number) => {
    const totalVnta = subtotalUsuario - descuentoPorVolumen;
    const dsctoAdicionalPartner = (descuentoEspecialPartner / 100) * totalVnta;
    const costo = ( totalVnta / 2 ) - dsctoAdicionalPartner;
    setCostoVenta(costo);
  };  

  const calcularMargenVenta = () => {
    const margen = totalVenta - costoVenta;
    setMargenVenta(margen);
  };  

  const calcularSubtotales = () => {
    let totalUsuario = 0;
    let totalBD = 0;
  
    const licenciasFiltradas = filtrarLicenciasPorBaseDeDatos(licenciasSAP, cliente.bd);
  
    licenciasFiltradas.forEach((grupo, grupoIndex) => {
      grupo.licencias.forEach((licencia, licenciaIndex) => {
        const cantidad = cantidades[grupoIndex][licenciaIndex];
        const costo = cliente.solution === 'OP' ? licencia.costoOP : licencia.costoOC;
        const total = cantidad * costo;
  
        if (cantidad > 0) {  // Solo sumar si la cantidad es mayor que 0
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
  
    // Llamar a la función de descuento
    calcularDescuento(totalUsuario, totalBD);
    calcularTotalVenta(totalUsuario);
    calcularCostoVenta(totalUsuario);

    calcularMargenVenta();
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
              <th className="px-4 py-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {itemsCotizados.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border">{item.grupo}</td>
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
      <Dialog open={mostrarModalLicencias} onOpenChange={setMostrarModalLicencias}>
        <DialogContent className='max-w-screen-xl'>
          <DialogHeader>
            <DialogTitle>Agregar Licencias</DialogTitle>
          </DialogHeader>

          {cliente.bd && (
            <div className="mt-4 overflow-auto max-h-72">
              <h3 className="text-lg font-semibold">Licencias Filtradas</h3>
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
                            value={cantidades[grupoIndex][licenciaIndex] || 0}
                            onChange={(value) => handleCantidadChange(grupoIndex, licenciaIndex, value)}
                            totalUsuarios={parseInt(cliente.usuarios, 10) || 0}  // Máximo permitido según el número de usuarios
                            totalLicencias={calcularTotalLicencias()}  // Cantidad total de licencias seleccionadas
                          />
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {formatNumber(parseFloat(calcularSumaTotal(cantidades[grupoIndex][licenciaIndex], cliente.solution === 'OP' ? licencia.costoOP : licencia.costoOC)))}
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
          <div className="flex justify-between mt-6">
            {/* Parte izquierda con subtotales y descuento */}
            <div className="w-2/3 space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-medium">Subtotal de Licencias de Usuario:</label>
                <span className="text-gray-700">${formatNumber(subtotalUsuario)}</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="font-medium">Subtotal de Licencias de BD:</label>
                <span className="text-gray-700">${formatNumber(subtotalBD)}</span>
              </div>
              <div className='flex justify-between items-center'>
                <label className="font-medium">Descuento por Volumen:</label>
                <span className="text-gray-700">{dsctoVolumenPorcentaje}%</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="font-medium">Descuento especial:</label>
                <Input
                  value={descuentoEspecial}
                  onChange={(e) => {
                    const newDescuentoEspecial = parseFloat(e.target.value) || 0;
                    setDescuentoEspecial(newDescuentoEspecial);
                    calcularSubtotales(); // Recalcula los subtotales al cambiar el descuento especial
                  }}
                  className="w-16 text-center"
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="font-medium">Descuento especial del Partner (%):</label>
                <Input
                  value={descuentoEspecialPartner}
                  onChange={(e) => {
                    const newDescuentoEspecialPartner = parseFloat(e.target.value) || 0;
                    setDescuentoEspecialPartner(newDescuentoEspecialPartner);
                    calcularSubtotales(); // Recalcula los subtotales al cambiar el descuento especial del partner
                  }}
                  className="w-16 text-center"
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="font-medium">Total Venta:</label>
                <span className="text-gray-700">${formatNumber(totalVenta)}</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="font-medium">Costo Venta:</label>
                <span className="text-gray-700">${formatNumber(costoVenta)}</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="font-medium">Margen Venta:</label>
                <span className="text-gray-700">${formatNumber(margenVenta)}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="bg-blue-500 text-white px-4 py-2" onClick={() => handleAgregarCotizacion(subtipoCotizacion)}>
              Agregar Cotización
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

