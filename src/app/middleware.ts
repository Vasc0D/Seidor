// middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'NOT_YOUR_BUSINESS_TOKEN_V43C0D147_SECRET';  // La misma clave usada para firmar los tokens

export function middleware(req: NextRequest) {
  const token = req.cookies.get('authToken')?.value;
  console.log('Token recibido:', token);

  if (!token) {
    return NextResponse.json({error: 'Usuario NO AUTENTICADO'}, {status: 401});
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; id: number };
    console.log('Token decodificado:', decoded);

    // Si el usuario es un operario y está tratando de acceder a una página de administrador
    if (decoded.role === 'Gerente Comercial' && req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));  // Los Gerentes Comerciales no pueden acceder a /admin
    }
    
    if (decoded.role === 'Gerente de Operaciones' && req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));  // Los Gerentes de Operaciones tampoco pueden acceder
    }

    if (decoded.role === 'Gerente Ejecutivo' && req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));  // Los Gerentes Ejecutivos tampoco pueden acceder
    }

    // Adjuntar el rol y el ID en los encabezados (headers)
    const response = NextResponse.next();
    response.headers.set('x-user-id', String(decoded.id));
    response.headers.set('x-user-role', decoded.role);

    console.log('Middleware ejecutado para:', req.url);

    return response;
  } catch (error) {
    // Si el token es inválido o ha expirado
    return NextResponse.redirect(new URL('/', req.url));
  }
}

// Definir qué rutas se protegen con el middleware
export const config = {
  matcher: ['/admin/:path*', '/homepage/:path*', '/api/:path*'],  // Proteger las rutas específicas
};
