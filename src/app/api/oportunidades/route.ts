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

// API Route para obtener todas las oportunidades filtradas por rol
export async function GET(req: Request) {
    try {
        // Acceder a los encabezados que contienen la información del usuario
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');

        if (!userRole) {
            return NextResponse.json({ error: 'User role no pasado' }, { status: 401 });
        }

        if (!userId) {
            return NextResponse.json({ error: 'User id no pasado' }, { status: 401 });
        }
        
        // Conectarse a la base de datos
        await sql.connect(sqlConfig);

        let query = '';

        if (userRole === 'Admin') {
            // El administrador ve todas las oportunidades
            query = `
                SELECT O.id, O.cliente_id, O.nombre_op, O.total_venta, O.costo_venta, O.margen_venta, O.estado, C.nombre AS cliente
                FROM Oportunidades O
                JOIN Clientes C ON O.cliente_id = C.id
            `;
        } else if (userRole === 'Gerente Comercial') {
            // El Gerente Comercial ve sus oportunidades y las de los gerentes de operaciones y ejecutivos
            query = `
                SELECT O.id, O.cliente_id, O.nombre_op, O.total_venta, O.costo_venta, O.margen_venta, O.estado, C.nombre AS cliente
                FROM Oportunidades O
                JOIN Clientes C ON O.cliente_id = C.id
                WHERE O.cotizador = ${userId} OR O.cotizador IN (
                    SELECT id FROM Users WHERE role IN ('Gerente de Operaciones', 'Gerente Ejecutivo')
                )
            `;
        } else if (userRole === 'Gerente de Operaciones') {
            // El Gerente de Operaciones ve sus oportunidades y las de los gerentes ejecutivos
            query = `
                SELECT O.id, O.cliente_id, O.nombre_op, O.total_venta, O.costo_venta, O.margen_venta, O.estado, C.nombre AS cliente
                FROM Oportunidades O
                JOIN Clientes C ON O.cliente_id = C.id
                WHERE O.cotizador = ${userId} OR O.cotizador IN (
                    SELECT id FROM Users WHERE role = 'Gerente Ejecutivo'
                )
            `;
        } else if (userRole === 'Gerente Ejecutivo') {
            // El Gerente Ejecutivo solo ve sus propias oportunidades
            query = `
                SELECT O.id, O.cliente_id, O.nombre_op, O.total_venta, O.costo_venta, O.margen_venta, O.estado, C.nombre AS cliente
                FROM Oportunidades O
                JOIN Clientes C ON O.cliente_id = C.id
                WHERE O.cotizador = ${userId}
            `;
        }

        // Ejecutar la consulta y devolver los resultados
        const result = await sql.query(query);
        return NextResponse.json(result.recordset);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al obtener oportunidades' }, { status: 500 });
    }
}

// API Route para agregar una nueva oportunidad
export async function POST(req: Request) {
    console.log('Headers recibidos: ', req.headers);
    try {
        // Obtener el cuerpo de la solicitud (los datos de la oportunidad)
        const { cliente_id, nombre_op, total_venta, costo_venta, margen_venta, itemsCotizacion } = await req.json();

        const estado = 'pendiente';

        // Obtener el ID del cotizador desde los headers
        const cotizadorId = req.headers.get('X-User-Id');

        // Verifica que todos los campos requeridos están presentes
        if (!cliente_id || !nombre_op || !estado) {
            return NextResponse.json({ error: 'Faltan datos de la oportunidad' }, { status: 400 });
        }

        if (!cotizadorId) {
            return NextResponse.json({ error: 'No se pudo obtener el ID del cotizador' }, { status: 400 });
        }

        // Convertir `cotizadorId` a número
        const cotizadorIdNumber = parseInt(cotizadorId, 10);
        if (isNaN(cotizadorIdNumber)) {
            return NextResponse.json({ error: 'ID de cotizador inválido' }, { status: 400 });
        }

        // Conectarse a la base de datos
        await sql.connect(sqlConfig);

        // Insertar la oportunidad en la tabla Oportunidades
        const insertOportunidadQuery = `
            INSERT INTO Oportunidades (cliente_id, nombre_op, total_venta, costo_venta, margen_venta, estado, cotizador) 
            OUTPUT Inserted.id  -- Obtener el ID de la nueva oportunidad
            VALUES (${cliente_id}, '${nombre_op}', ${total_venta || 0}, ${costo_venta || 0}, ${margen_venta || 0}, '${estado}', ${cotizadorIdNumber})
        `;

        const result = await sql.query(insertOportunidadQuery);
        const oportunidadId = result.recordset[0].id;  // Obtener el ID de la oportunidad insertada

        // Verificar que la oportunidad fue insertada correctamente
        if (!oportunidadId) {
            return NextResponse.json({ error: 'No se pudo crear la oportunidad' }, { status: 500 });
        }

        // Insertar los conceptos relacionados a la oportunidad
        if (itemsCotizacion && itemsCotizacion.length > 0) {
            for (const item of itemsCotizacion) {
                const insertConceptoQuery = `
                    INSERT INTO Conceptos (oportunidad_id, nombre_concepto, base_datos, total_venta, costo_venta)
                    OUTPUT Inserted.id  -- Obtener el ID del concepto
                    VALUES (${oportunidadId}, '${item.tipoCotizacion}', '${item.baseDeDatos || ''}', ${item.totalVenta || 0}, ${item.costoVenta || 0})
                `;

                const resultConcepto = await sql.query(insertConceptoQuery);
                const conceptoId = resultConcepto.recordset[0].id;  // Obtener el ID del concepto insertado

                // Insertar los detalles del concepto en Detalle_Conceptos
                if (item.licenciasSeleccionadas && item.licenciasSeleccionadas.length > 0) {
                    for (const licencia of item.licenciasSeleccionadas) {
                        const insertDetalleQuery = `
                            INSERT INTO Detalle_Conceptos (concepto_id, nombre_item, cantidad, costo)
                            VALUES (${conceptoId}, '${licencia.tipo}', ${licencia.cantidad || 0}, ${licencia.costo || 0})
                        `;

                        await sql.query(insertDetalleQuery);
                    }
                }
            }
        }

        // Devolver una respuesta exitosa
        return NextResponse.json({ message: 'Oportunidad, conceptos y detalles creados correctamente' }, { status: 201 });
    } catch (error) {
        console.error('Error al crear la oportunidad:', error);
        return NextResponse.json({ error: 'Error al crear la oportunidad' }, { status: 500 });
    }
}