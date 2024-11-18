'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const Home: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br text-gray-800">
      {/* Título principal */}
      <h1 className="text-5xl font-bold text-blue-900 mb-4">Universal Quoter</h1>

    </div>
  );
};

export default Home;
