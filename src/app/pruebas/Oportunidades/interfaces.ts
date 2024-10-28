export interface Concepto {
    id: string;
    nombre_concepto: string;
    total_venta: number;
    costo_venta: number;
    margen_venta: number;
    porcentaje_margen: number;
  }
  
  export interface Servicio {
    id: string;
    nombre_proyecto: string;
    total_venta: number;
    costo_venta: number;
    margen_venta: number;
    conceptos: Concepto[];
  }

  export interface RecursoCotizacion {
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
  