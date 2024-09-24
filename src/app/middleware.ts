// middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'NOT_YOUR_BUSINESS_TOKEN_V43C0D147_SECRET';  // La misma clave usada para firmar los tokens

export function middleware(req: NextRequest) {
  const token = req.cookies.get('authToken')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));  // Redirigir al login si no hay token
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; id: number };

    // Si el usuario es un operario y está tratando de acceder a una página de administrador
    if (decoded.role === 'operario' && req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));  // Redirigir si no tiene permisos
    }

    // Si pasa la verificación, el usuario sigue navegando normalmente
    return NextResponse.next();
  } catch (error) {
    // Si el token es inválido o ha expirado
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Definir qué rutas se protegen con el middleware
export const config = {
  matcher: ['/admin/:path*', '/homepage/:path*'],  // Proteger las rutas específicas
};
