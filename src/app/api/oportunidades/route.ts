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

        // Ejecutar una consulta para obtener las oportunidades
        const result = await sql.query(`
            SELECT O.id, O.cliente_id, O.nombre_op, O.total_venta, O.costo_venta, O.margen_venta, O.estado, C.nombre AS cliente
            FROM Oportunidades O
            JOIN Clientes C ON O.cliente_id = C.id
        `);

        // Devolver los resultados
        return NextResponse.json(result.recordset);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al obtener oportunidades' }, { status: 500 });
    }
}

// API Route para agregar una nueva oportunidad
export async function POST(req: Request) {
    try {
        const { cliente_id, nombre_op, total_venta, costo_venta, margen_venta } = await req.json();

        const estado = 'pendiente';

        // Validar que todos los campos están presentes
        if (!cliente_id || !nombre_op || !estado) {
            return NextResponse.json({ error: 'Faltan datos de la oportunidad' }, { status: 400 });
        }

        // Conectarse a la base de datos
        await sql.connect(sqlConfig);

        // Insertar la oportunidad en la base de datos
        const result = await sql.query(`
            INSERT INTO Oportunidades (cliente_id, nombre_op, total_venta, costo_venta, margen_venta, estado) 
            VALUES (${cliente_id}, '${nombre_op}', ${total_venta || 0}, ${costo_venta || 0}, ${margen_venta || 0}, '${estado}')
        `);

        // Verificar que la inserción fue exitosa
        if (result.rowsAffected[0] === 0) {
            return NextResponse.json({ error: 'No se pudo crear la oportunidad' }, { status: 500 });
        }

        // Devolver una respuesta exitosa
        return NextResponse.json({ message: 'Oportunidad creada correctamente' }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al crear la oportunidad' }, { status: 500 });
    }
}
