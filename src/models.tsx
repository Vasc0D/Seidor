export interface Cliente {
    nombre: string;
    ruc: string;
    companias:string;
    empleados:number;
    usuarios: number;
    bd: "SQL" | "HANNA";
    infraestructura: "OP" | "OC";
}