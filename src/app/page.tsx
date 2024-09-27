'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'react-toastify';  // Para mostrar notificaciones
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // Enviar cookies
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();

      if (response.ok) {
        toast.success('Login succesfull');
        router.push('/homepage');
      } else {
        toast.error(data.error || 'Invalid credentials');
      } 
    } catch (error) {
        toast.error('Something went wrong');
        console.error('Error during login:', error);
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        <div className="mb-4">
          <Input 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Username" 
            className="w-full"
          />
        </div>
        <div className="mb-4">
          <Input 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" 
            type="password"
            className="w-full"
          />
        </div>
        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </Button>
      </div>
    </div>
  );
}
