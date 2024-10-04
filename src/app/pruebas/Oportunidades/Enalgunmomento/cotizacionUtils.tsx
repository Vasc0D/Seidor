// // Función para formatear números a formato de moneda
// export const formatNumber = (number: number): string => {
//     return number.toLocaleString("en-US", {
//       style: "currency",
//       currency: "USD",
//     });
//   };
  
//   // Función para calcular el subtotal de usuarios y BD
//   export const calcularSubtotales = (
//     licenciasSAP: any[],
//     licenciasSeidor: any[],
//     cantidadesLicenciasSAP: Record<string, number>,
//     cantidadesLicenciasSeidor: Record<string, number>,
//     subtipoCotizacion: string,
//     baseDeDatos: string,
//     solution: string
//   ) => {
//     let subtotalUsuarioTemp = 0;
//     let subtotalBDTemp = 0;
  
//     if (subtipoCotizacion === 'Licencias SAP') {
//       // Calcular subtotales para Licencias SAP
//       licenciasSAP.forEach((grupo) => {
//         grupo.licencias.forEach((licencia) => {
//           const cantidad = cantidadesLicenciasSAP[licencia.tipo] || 0;
//           const costo = solution === 'OP' ? licencia.costoOP : licencia.costoOC;
//           const total = cantidad * costo;
  
//           if (grupo.categoria.includes("Usuarios")) {
//             subtotalUsuarioTemp += total;
//           } else if (grupo.categoria.includes("Databases")) {
//             subtotalBDTemp += total;
//           }
//         });
//       });
//     } else if (subtipoCotizacion === 'Licencias Seidor') {
//       // Calcular subtotales para Licencias Seidor
//       licenciasSeidor.forEach((grupo) => {
//         grupo.licencias.forEach((licencia) => {
//           const cantidad = cantidadesLicenciasSeidor[licencia.tipo] || 0;
//           const costo = solution === 'OP' ? licencia.costoOP : licencia.costoOC;
//           subtotalUsuarioTemp += cantidad * costo;
//         });
//       });
//     }
  
//     return { subtotalUsuarioTemp, subtotalBDTemp };
//   };
  
//   // Función para calcular los totales de venta, costo y margen
//   export const calcularTotales = (
//     itemsCotizacion: any[],
//     subtotalUsuario: number,
//     subtotalBD: number,
//     descuentoPorVolumen: number,
//     descuentoEspecial: number,
//     descuentoEspecialPartner: number
//   ) => {
//     const totalVentaGeneral = itemsCotizacion.reduce((acc, item) => acc + item.totalVenta, 0);
//     const costoVentaGeneral = itemsCotizacion.reduce((acc, item) => acc + item.costoVenta, 0);
//     const margenVentaGeneral = itemsCotizacion.reduce((acc, item) => acc + item.margenVenta, 0);
  
//     const A = subtotalUsuario + subtotalBD - (subtotalUsuario * descuentoPorVolumen / 100);
//     const B = subtotalUsuario - (subtotalUsuario * descuentoPorVolumen / 100);
//     const C = (B / 2) + (B * (descuentoEspecialPartner / 100));
//     const costoVentaTemp = A - C;
  
//     const margenVentaTemp = totalVentaGeneral - costoVentaTemp;
  
//     return { totalVentaGeneral, costoVentaTemp, margenVentaTemp };
//   };
  