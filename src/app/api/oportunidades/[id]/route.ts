import { NextResponse } from 'next/server';
import sql from 'mssql';

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
    encrypt: false,
    trustServerCertificate: true,
  },
};

// GET - Obtener detalles de una oportunidad por su ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await sql.connect(sqlConfig);

    // Consultar la oportunidad por ID
    const resultOportunidad = await sql.query(`SELECT * FROM Oportunidades WHERE id = ${id}`);
    
    // Consultar el cliente relacionado
    const resultCliente = await sql.query(`SELECT * FROM Clientes WHERE id = ${resultOportunidad.recordset[0].cliente_id}`);
    
    // Consultar los conceptos asociados con la oportunidad
    const resultConceptos = await sql.query(`SELECT * FROM Conceptos WHERE oportunidad_id = ${id}`);

    // Consultar los ítems (detalles) para cada concepto
    const conceptosConDetalles = await Promise.all(
      resultConceptos.recordset.map(async (concepto) => {
        const resultDetalles = await sql.query(`SELECT * FROM Detalle_Conceptos WHERE concepto_id = ${concepto.id}`);
        return {
          ...concepto,
          detalles: resultDetalles.recordset,  // Anidar los detalles al concepto
        };
      })
    );

    // Devolver la oportunidad, cliente y los conceptos con ítems
    return NextResponse.json({
      oportunidad: resultOportunidad.recordset[0],
      cliente: resultCliente.recordset[0],
      itemsCotizacion: conceptosConDetalles,  // Aquí los conceptos tienen sus ítems anidados
    });
  } catch (error) {
    console.error('Error al obtener la oportunidad:', error);
    return NextResponse.json({ error: 'Error al obtener la oportunidad' }, { status: 500 });
  }
}

// PATCH - Actualizar detalles de una oportunidad
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { total_venta, costo_venta, margen_venta, itemsCotizacion } = await request.json();

  try {
    await sql.connect(sqlConfig);

    // Actualizar la oportunidad
    await sql.query(`
      UPDATE Oportunidades 
      SET total_venta = ${total_venta}, costo_venta = ${costo_venta}, margen_venta = ${margen_venta} 
      WHERE id = ${id}
    `);

    // Opcionalmente, actualizar los ítems de la cotización
    for (const item of itemsCotizacion) {
      await sql.query(`
        UPDATE Conceptos
        SET total_venta = ${item.total_venta}, costo_venta = ${item.costo_venta}
        WHERE id = ${item.id}
      `);
    }

    return NextResponse.json({ message: 'Oportunidad actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la oportunidad:', error);
    return NextResponse.json({ error: 'Error al actualizar la oportunidad' }, { status: 500 });
  }
}
