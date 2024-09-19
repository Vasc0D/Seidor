import { NextResponse } from 'next/server';
import sql from 'mssql';

// Configuración de la conexión a SQL Server
const sqlConfig = {
    user: 'vdiaz',
    password: '+15nOrO23!JX',
    database: 'prueba-001',
    server: '172.16.0.95',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
    options: {
        encrypt: false, // Cambia según tu configuración
        trustServerCertificate: true,
    },
};

// API Route para obtener todas las oportunidades
export async function GET() {
    try {
        // Conectarse a la base de datos
        await sql.connect(sqlConfig);

        // Ejecutar una consulta para obtener las oportunidades y sus totales
        const result = await sql.query(`
            SELECT o.id, c.nombre AS cliente, o.total_venta, o.costo_venta, o.margen_venta 
            FROM Oportunidades o
            JOIN Clientes c ON o.cliente_id = c.id
        `);

        // Devolver los resultados
        return NextResponse.json(result.recordset);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al obtener oportunidades' }, { status: 500 });
    }
}
