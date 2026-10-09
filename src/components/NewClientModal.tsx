import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: { name: string; codCliente: string; empresaRemitente: string }) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose, onAddClient }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [codCliente, setCodCliente] = useState('');
  const [empresaRemitente, setEmpresaRemitente] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddClient({
      name: name.trim(),
      codCliente: codCliente.trim() || '2000',
      empresaRemitente: empresaRemitente.trim() || name.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl text-slate-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Agregar Cliente
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Alta de nuevo cliente contratante
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Razón Social del Cliente</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: MOLINOS RIO DE LA PLATA"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Código de Cliente</label>
            <input
              type="text"
              value={codCliente}
              onChange={(e) => setCodCliente(e.target.value)}
              placeholder="Ej: 1750"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Empresa Remitente Mercadería</label>
            <input
              type="text"
              value={empresaRemitente}
              onChange={(e) => setEmpresaRemitente(e.target.value)}
              placeholder="Ej: GRUPO AGRO SA"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
            >
              Registrar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
