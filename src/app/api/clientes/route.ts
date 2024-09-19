// app/api/clientes/route.ts

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

// API Route para obtener todos los clientes
export async function GET() {
    try {
        // Conectarse a la base de datos
        await sql.connect(sqlConfig);

        // Ejecutar una consulta para obtener los clientes
        const result = await sql.query(`
            SELECT * FROM Clientes
        `);

        // Devolver los resultados
        return NextResponse.json(result.recordset);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 });
    }
}

// API Route para agregar un nuevo cliente
export async function POST(req: Request) {
    try {
        const { nombre, ruc, sociedades, empleados } = await req.json();

        // Validar que todos los campos están presentes
        if (!nombre || !ruc || !sociedades || !empleados) {
            return NextResponse.json({ error: 'Faltan datos del cliente' }, { status: 400 });
        }

        // Conectarse a la base de datos
        await sql.connect(sqlConfig);

        // Insertar el cliente en la base de datos
        await sql.query(`
            INSERT INTO Clientes (nombre, ruc, sociedades, empleados) 
            VALUES ('${nombre}', '${ruc}', ${sociedades}, ${empleados})
        `);

        // Devolver una respuesta exitosa
        return NextResponse.json({ message: 'Cliente creado correctamente' }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 });
    }
}
