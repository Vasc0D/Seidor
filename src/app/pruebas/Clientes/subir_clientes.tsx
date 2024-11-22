import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const SubirClientes: React.FC<{ onUpload: () => void }> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ""; // Reiniciar el valor del input
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Por favor selecciona un archivo.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5015/api/clientes/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        onUpload(); // Refresca la lista de clientes
        setFile(null); // Limpiar el archivo después de subirlo
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) {
          fileInput.value = ""; // Reiniciar el valor del input
        }
      } else {
        alert(data.error || 'Error al subir el archivo.');
      }
    } catch (error) {
      console.error('Error al subir el archivo:', error);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        className="hidden"
        id="file-input"
      />
      <label
        htmlFor="file-input"
        className="bg-gray-100 border px-3 py-1 rounded cursor-pointer flex items-center space-x-2"
      >
        {file ? (
          <>
            <img
              src="https://img.icons8.com/color/48/000000/microsoft-excel-2019.png" // Ícono de Excel
              alt="Excel Icon"
              className="w-6 h-6"
            />
            <span>{file.name}</span>
          </>
        ) : (
          "Seleccionar archivo"
        )}
      </label>
      {file && (
        <button onClick={handleRemoveFile} className="text-red-500 text-sm">
          ✖
        </button>
      )}
      <Button onClick={handleUpload} className="bg-blue-500 text-white">
        Subir Clientes
      </Button>
    </div>
  );
};

export default SubirClientes;
