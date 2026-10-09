import React, { useState } from 'react';
import { TripRecord } from '../types/logistics';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { BarChart3, PieChart as PieIcon, Building2, Plus } from 'lucide-react';

interface ChartsProps {
  trips: TripRecord[];
  onSelectProduct?: (prod: string) => void;
  onSelectClient?: (client: string) => void;
  selectedProduct?: string;
  selectedClient?: string;
  onOpenNewTrip?: () => void;
  onOpenNewDriver?: () => void;
  onOpenNewClient?: () => void;
}

export const Charts: React.FC<ChartsProps> = ({ 
  trips,
  onSelectProduct,
  onSelectClient,
  selectedProduct,
  selectedClient,
  onOpenNewTrip,
  onOpenNewDriver,
  onOpenNewClient
}) => {
  const [metricType, setMetricType] = useState<'neto' | 'margen' | 'volumen'>('neto');

  // Group by Product
  const productData = trips.reduce((acc, t) => {
    const prod = t.tipoProducto || 'Otros';
    if (!acc[prod]) {
      acc[prod] = { name: prod, neto: 0, margen: 0, volumen: 0, count: 0 };
    }
    acc[prod].neto += t.netoGravado || 0;
    acc[prod].margen += t.margenPesos || 0;
    acc[prod].volumen += t.kgsCargados || 0;
    acc[prod].count += 1;
    return acc;
  }, {} as Record<string, { name: string; neto: number; margen: number; volumen: number; count: number }>);

  const productList = Object.values(productData).sort((a, b) => {
    if (metricType === 'neto') return b.neto - a.neto;
    if (metricType === 'margen') return b.margen - a.margen;
    return b.volumen - a.volumen;
  });

  const maxProductVal = Math.max(...productList.map(p => metricType === 'neto' ? p.neto : metricType === 'margen' ? p.margen : p.volumen), 1);

  // Group by Transport Type (Propio vs Fletero)
  const transportData = trips.reduce((acc, t) => {
    const type = t.tipoTransporte;
    if (!acc[type]) {
      acc[type] = { type, viajes: 0, neto: 0, margen: 0, volumen: 0 };
    }
    acc[type].viajes += 1;
    acc[type].neto += t.netoGravado || 0;
    acc[type].margen += t.margenPesos || 0;
    acc[type].volumen += t.kgsCargados || 0;
    return acc;
  }, {} as Record<string, { type: string; viajes: number; neto: number; margen: number; volumen: number }>);

  const totalViajes = trips.length || 1;
  const propioPct = ((transportData['Propio']?.viajes || 0) / totalViajes) * 100;
  const fleteroPct = ((transportData['Fletero']?.viajes || 0) / totalViajes) * 100;

  // Group by Top Clients
  const clientData = trips.reduce((acc, t) => {
    const client = t.clienteContrata || 'Sin Asignar';
    if (!acc[client]) {
      acc[client] = { name: client, neto: 0, margen: 0, volumen: 0, count: 0 };
    }
    acc[client].neto += t.netoGravado || 0;
    acc[client].margen += t.margenPesos || 0;
    acc[client].volumen += t.kgsCargados || 0;
    acc[client].count += 1;
    return acc;
  }, {} as Record<string, { name: string; neto: number; margen: number; volumen: number; count: number }>);

  const clientList = Object.values(clientData)
    .sort((a, b) => b.neto - a.neto)
    .slice(0, 5);

  const maxClientNeto = Math.max(...clientList.map(c => c.neto), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. SECTOR: CARGA & PRODUCTOS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold tracking-wide text-slate-200">Sector: Carga & Productos</h3>
            </div>
            {onOpenNewTrip && (
              <button
                onClick={onOpenNewTrip}
                className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                title="Cargar viaje para esta u otra carga"
              >
                <Plus className="w-3 h-3" />
                <span>+ Carga</span>
              </button>
            )}
          </div>

          {/* Metric Switcher */}
          <div className="flex items-center justify-end mb-3">
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setMetricType('neto')}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${metricType === 'neto' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                Venta
              </button>
              <button
                onClick={() => setMetricType('margen')}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${metricType === 'margen' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                Margen
              </button>
              <button
                onClick={() => setMetricType('volumen')}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${metricType === 'volumen' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                Tn
              </button>
            </div>
          </div>

          <div className="space-y-3 mt-1">
            {productList.map(item => {
              const currentVal = metricType === 'neto' ? item.neto : metricType === 'margen' ? item.margen : item.volumen;
              const barPercent = Math.round((currentVal / maxProductVal) * 100);
              const isSelected = selectedProduct === item.name;

              return (
                <div 
                  key={item.name}
                  onClick={() => onSelectProduct && onSelectProduct(isSelected ? '' : item.name)}
                  className={`group cursor-pointer p-2 rounded-lg transition-all ${isSelected ? 'bg-slate-800/90 ring-1 ring-blue-500' : 'hover:bg-slate-800/50'}`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                      {item.name}
                      <span className="text-slate-500 font-normal">({item.count} vjes)</span>
                    </span>
                    <span className="font-mono tabular-nums text-slate-300 font-semibold">
                      {metricType === 'volumen' ? `${formatNumber(item.volumen, 1)} Tn` : formatCurrency(currentVal)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        metricType === 'margen' 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                          : metricType === 'volumen'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-400'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                      }`}
                      style={{ width: `${Math.max(barPercent, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedProduct && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-blue-400">
            <span>Filtrado por: {selectedProduct}</span>
            <button 
              onClick={() => onSelectProduct && onSelectProduct('')}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Quitar filtro
            </button>
          </div>
        )}
      </div>

      {/* 2. SECTOR: FLOTA & CHOFERES */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold tracking-wide text-slate-200">Sector: Flota & Conducción</h3>
            </div>
            {onOpenNewDriver && (
              <button
                onClick={onOpenNewDriver}
                className="flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                title="Agregar Chofer o Fletero"
              >
                <Plus className="w-3 h-3" />
                <span>+ Chofer</span>
              </button>
            )}
          </div>

          {/* Comparative Progress Bar */}
          <div className="my-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 text-blue-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Propio ({propioPct.toFixed(0)}%)
              </span>
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Fletero ({fleteroPct.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
              <div 
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${propioPct}%` }}
              />
              <div 
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${fleteroPct}%` }}
              />
            </div>
          </div>

          {/* Cards comparativas */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Propio */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mb-2">
                <span>Flota Propia</span>
              </div>
              <div className="text-sm font-bold font-mono tabular-nums text-white">
                {transportData['Propio']?.viajes || 0} viajes
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Facturado: <span className="font-mono tabular-nums text-slate-200 font-medium">{formatCurrency(transportData['Propio']?.neto || 0)}</span>
              </div>
              <div className="text-xs text-emerald-400 mt-1">
                Margen: <span className="font-mono tabular-nums font-semibold">{formatCurrency(transportData['Propio']?.margen || 0)}</span>
              </div>
            </div>

            {/* Fletero */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-2">
                <span>Fleteros Terceros</span>
              </div>
              <div className="text-sm font-bold font-mono tabular-nums text-white">
                {transportData['Fletero']?.viajes || 0} viajes
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Facturado: <span className="font-mono tabular-nums text-slate-200 font-medium">{formatCurrency(transportData['Fletero']?.neto || 0)}</span>
              </div>
              <div className="text-xs text-emerald-400 mt-1">
                Margen: <span className="font-mono tabular-nums font-semibold">{formatCurrency(transportData['Fletero']?.margen || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Eficiencia Flota:</span>
          <span className="text-emerald-400 font-mono tabular-nums font-semibold">
            {transportData['Propio']?.neto ? `${((transportData['Propio'].margen / transportData['Propio'].neto) * 100).toFixed(0)}% retorno` : '100% retorno'}
          </span>
        </div>
      </div>

      {/* 3. SECTOR: CLIENTES */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold tracking-wide text-slate-200">Sector: Clientes</h3>
            </div>
            {onOpenNewClient && (
              <button
                onClick={onOpenNewClient}
                className="flex items-center gap-1 text-[11px] font-medium text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                title="Registrar Nuevo Cliente"
              >
                <Plus className="w-3 h-3" />
                <span>+ Cliente</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {clientList.map(client => {
              const barPercent = Math.round((client.neto / maxClientNeto) * 100);
              const isSelected = selectedClient === client.name;

              return (
                <div 
                  key={client.name}
                  onClick={() => onSelectClient && onSelectClient(isSelected ? '' : client.name)}
                  className={`group cursor-pointer p-2 rounded-lg transition-all ${isSelected ? 'bg-slate-800/90 ring-1 ring-purple-500' : 'hover:bg-slate-800/50'}`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-200 group-hover:text-purple-400 transition-colors truncate max-w-[150px]">
                      {client.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-300 font-semibold">
                      {formatCurrency(client.neto)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(barPercent, 4)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{client.count} despachos</span>
                    <span className="text-emerald-400">Margen: {formatCurrency(client.margen)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedClient && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-purple-400">
            <span>Filtrado por: {selectedClient}</span>
            <button 
              onClick={() => onSelectClient && onSelectClient('')}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Quitar filtro
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
