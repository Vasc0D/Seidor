'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);

    try {
      const response = await fetch(process.env.API_IP + '/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('role', data.role);

        router.push('/pruebas');
      } else {
        console.error('Error al iniciar sesión:', data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-4">Universal Quoter</h1>
        <p className="text-center text-gray-500 mb-8">Accede a tu cuenta para continuar</p>
        
        <div className="mb-6">
          <Input 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Nombre de usuario" 
            className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <Input 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Contraseña" 
            type="password"
            className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <Button 
          className={`w-full py-3 rounded-lg text-white ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} transition-all duration-200 ease-in-out`} 
          onClick={handleLogin} 
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </Button>
      </div>
    </div>
  );
}
