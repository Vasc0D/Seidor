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
    const resultOportunidad = await sql.query(`SELECT * FROM Oportunidades WHERE id = ${id}`);
    const resultCliente = await sql.query(`SELECT * FROM Clientes WHERE id = ${resultOportunidad.recordset[0].cliente_id}`);
    const resultItems = await sql.query(`SELECT * FROM Conceptos WHERE oportunidad_id = ${id}`);

    return NextResponse.json({
      oportunidad: resultOportunidad.recordset[0],
      cliente: resultCliente.recordset[0],
      itemsCotizacion: resultItems.recordset,
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
