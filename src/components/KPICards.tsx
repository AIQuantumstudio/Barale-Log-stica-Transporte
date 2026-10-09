import React from 'react';
import { DashboardMetrics } from '../types/logistics';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import { 
  DollarSign, 
  TrendingUp, 
  Truck, 
  Weight, 
  Navigation, 
  CheckCircle2, 
  Clock
} from 'lucide-react';

interface KPICardsProps {
  metrics: DashboardMetrics;
  onFilterStatus?: (status: 'all' | 'Facturado' | 'Pendiente') => void;
  onFilterTransport?: (transport: 'all' | 'Propio' | 'Fletero') => void;
  activeStatusFilter?: string;
  activeTransportFilter?: string;
}

export const KPICards: React.FC<KPICardsProps> = ({ 
  metrics,
  onFilterStatus,
  onFilterTransport,
  activeStatusFilter = 'all',
  activeTransportFilter = 'all'
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Facturación Neta */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col justify-between shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Facturación Neta (NG)</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-white">
            {formatCurrency(metrics.facturacionNeto)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span>Con IVA (DEBE):</span>
            <span className="font-mono tabular-nums text-slate-300 font-medium">
              {formatCurrency(metrics.facturacionTotalConIVA)}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Tarifa Prom./Tn:</span>
          <span className="font-mono tabular-nums text-blue-400 font-semibold">
            {formatCurrency(metrics.tarifaPromedioPorTn)}
          </span>
        </div>
      </div>

      {/* Margen Operativo */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col justify-between shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Margen Bruto Barale</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-emerald-400">
            {formatCurrency(metrics.margenBrutoTotal)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span>Margen sobre Ventas:</span>
            <span className="font-mono tabular-nums text-emerald-300 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
              {formatPercent(metrics.margenBrutoPct)}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Costo Fleteros Pagado:</span>
          <span className="font-mono tabular-nums text-amber-400 font-medium">
            {formatCurrency(metrics.costoFleterosTotal)}
          </span>
        </div>
      </div>

      {/* Volumen Transportado */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Carga & Logística</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Weight className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-white flex items-baseline gap-1.5">
            {formatNumber(metrics.totalTnCargadas, 1)}
            <span className="text-sm font-normal text-slate-400">Tn</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <Navigation className="w-3.5 h-3.5 text-slate-500" />
            <span>Km Totales:</span>
            <span className="font-mono tabular-nums text-slate-300 font-semibold">
              {formatNumber(metrics.totalKmRecorridos, 0)} km
            </span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Promedio por viaje:</span>
          <span className="font-mono tabular-nums text-indigo-300 font-medium">
            {metrics.totalViajes > 0 ? (metrics.totalTnCargadas / metrics.totalViajes).toFixed(1) : 0} Tn/vje
          </span>
        </div>
      </div>

      {/* Operaciones & Viajes */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Viajes Operados</span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-white">
            {metrics.totalViajes}
            <span className="text-xs text-slate-400 font-normal ml-2">despachos</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <button 
              onClick={() => onFilterTransport && onFilterTransport(activeTransportFilter === 'Propio' ? 'all' : 'Propio')}
              className={`flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded cursor-pointer ${activeTransportFilter === 'Propio' ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Propios:</span>
              <span className="font-mono tabular-nums font-semibold text-white">{metrics.viajesPropios}</span>
            </button>
            <button 
              onClick={() => onFilterTransport && onFilterTransport(activeTransportFilter === 'Fletero' ? 'all' : 'Fletero')}
              className={`flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded cursor-pointer ${activeTransportFilter === 'Fletero' ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Fleteros:</span>
              <span className="font-mono tabular-nums font-semibold text-white">{metrics.viajesFleteros}</span>
            </button>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button 
            onClick={() => onFilterStatus && onFilterStatus(activeStatusFilter === 'Facturado' ? 'all' : 'Facturado')}
            className={`flex items-center gap-1 cursor-pointer ${activeStatusFilter === 'Facturado' ? 'text-emerald-300 font-bold' : 'hover:text-slate-200'}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Facturados:</span>
            <span className="font-mono tabular-nums font-semibold text-white">{metrics.viajesFacturados}</span>
          </button>
          <button 
            onClick={() => onFilterStatus && onFilterStatus(activeStatusFilter === 'Pendiente' ? 'all' : 'Pendiente')}
            className={`flex items-center gap-1 cursor-pointer ${activeStatusFilter === 'Pendiente' ? 'text-amber-300 font-bold' : 'hover:text-slate-200'}`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pendientes:</span>
            <span className="font-mono tabular-nums font-semibold text-amber-400">{metrics.viajesPendientes}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
