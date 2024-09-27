// app/api/auth/route.ts

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import sql from 'mssql';
import bcrypt from 'bcrypt';

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
      encrypt: false,
      trustServerCertificate: true,
    },
  };

// Clave secreta para firmar el token JWT
const JWT_SECRET = 'NOT_YOUR_BUSINESS_TOKEN_V43C0D147_SECRET';  // Debe ser un valor fuerte y seguro

export async function POST(req: Request) {
    const { username, password } = await req.json();  // Datos enviados en el login

    try {
        // Conectarse a la base de datos
        await sql.connect(sqlConfig);

        // Verificar si el usuario existe en la base de datos
        const result = await sql.query(`
            SELECT * FROM Users WHERE username = '${username}'
        `);

        if (result.recordset.length === 0) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const user = result.recordset[0];

        // Comparar la contraseña ingresada con la encriptada en la base de datos
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
        }

        // Generar un token JWT con el rol del usuario
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, // Datos en el token
            JWT_SECRET, // Clave secreta
            { expiresIn: '1h' } // Tiempo de expiración
        );

        // Guardar el token en una cookie
        const response = NextResponse.json({ message: 'Login exitoso' });

        response.cookies.set('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Asegúrate de que esté configurado para producción
            sameSite: 'strict',
            maxAge: 60 * 60, // 1 hora
            path: '/',
        });

        return response;

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error en el login' }, { status: 500 });
    }
}