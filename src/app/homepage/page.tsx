'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Cliente } from '@/lib/models/cliente';



export default function Home() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const agregarCliente = () => {
      router.push('/detalles');
  };
  return (
    <div className="p-20">
      <h1 className="text-2xl font-bold mb-">Clientes:</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lista de clientes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente, index) => (
            <TableRow key={index}>
              <TableCell>{cliente.nombre}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-end">
        <Button onClick={agregarCliente}>Crear</Button>
      </div>
    </div>
  );
}
