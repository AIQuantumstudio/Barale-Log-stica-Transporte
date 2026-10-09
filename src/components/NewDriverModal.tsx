import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';

interface NewDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDriver: (driver: { name: string; transporte: string; tipo: 'Propio' | 'Fletero'; codChofer: string }) => void;
}

export const NewDriverModal: React.FC<NewDriverModalProps> = ({ isOpen, onClose, onAddDriver }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [transporte, setTransporte] = useState('JUAN y MIGUEL');
  const [tipo, setTipo] = useState<'Propio' | 'Fletero'>('Propio');
  const [codChofer, setCodChofer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddDriver({
      name: name.trim(),
      transporte: tipo === 'Propio' ? 'JUAN y MIGUEL' : (transporte.trim() || 'Fletero Asignado'),
      tipo,
      codChofer: codChofer.trim() || (tipo === 'Propio' ? '20' : '550')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl text-slate-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Agregar Chofer o Fletero
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Alta en el padrón de conductores de Barale
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">Modalidad</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTipo('Propio');
                  setTransporte('JUAN y MIGUEL');
                }}
                className={`py-2 px-3 rounded-lg font-medium cursor-pointer ${
                  tipo === 'Propio' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Flota Propia
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipo('Fletero');
                  if (transporte === 'JUAN y MIGUEL') setTransporte('');
                }}
                className={`py-2 px-3 rounded-lg font-medium cursor-pointer ${
                  tipo === 'Fletero' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Fletero Tercero
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Nombre Completo del Chofer</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Marcelo Gomez"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Empresa / Razón Social del Transporte</label>
            <input
              type="text"
              required
              value={transporte}
              onChange={(e) => setTransporte(e.target.value)}
              placeholder="Ej: Transportes San Martin"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Código de Chofer</label>
            <input
              type="text"
              value={codChofer}
              onChange={(e) => setCodChofer(e.target.value)}
              placeholder="Ej: 18 o 405"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
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
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
            >
              Registrar Chofer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
