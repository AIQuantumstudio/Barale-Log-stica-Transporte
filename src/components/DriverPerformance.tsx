import React, { useState } from 'react';
import { TripRecord } from '../types/logistics';
import { DriverMaster } from '../data/masterRecords';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { User, Award, ArrowUpRight, Plus, Download, Trash2 } from 'lucide-react';
import { downloadModernExcel } from '../utils/excelExporter';

interface DriverPerformanceProps {
  trips: TripRecord[];
  drivers?: DriverMaster[];
  onSelectDriverTrips: (driverName: string) => void;
  onOpenNewDriver?: () => void;
  onDeleteDriver?: (driverIdOrName: string) => void;
}

export const DriverPerformance: React.FC<DriverPerformanceProps> = ({ 
  trips,
  drivers = [],
  onSelectDriverTrips,
  onOpenNewDriver,
  onDeleteDriver
}) => {
  const [filterType, setFilterType] = useState<'all' | 'Propio' | 'Fletero'>('all');

  // Compute stats from active trips
  const tripStatsMap = trips.reduce((acc, t) => {
    const driver = t.chofer || 'Sin Chofer';
    if (!acc[driver]) {
      acc[driver] = {
        name: driver,
        transporte: t.transporte,
        tipo: t.tipoTransporte,
        viajes: 0,
        toneladas: 0,
        facturado: 0,
        costo: 0,
        margen: 0,
      };
    }
    acc[driver].viajes += 1;
    acc[driver].toneladas += t.kgsCargados || 0;
    acc[driver].facturado += t.netoGravado || 0;
    acc[driver].costo += t.costoFletero || 0;
    acc[driver].margen += t.margenPesos || 0;
    return acc;
  }, {} as Record<string, {
    name: string;
    transporte: string;
    tipo: 'Propio' | 'Fletero';
    viajes: number;
    toneladas: number;
    facturado: number;
    costo: number;
    margen: number;
  }>);

  // Merge registered drivers from master list + any drivers from trips
  const mergedMap: Record<string, {
    id?: string;
    name: string;
    transporte: string;
    tipo: 'Propio' | 'Fletero';
    viajes: number;
    toneladas: number;
    facturado: number;
    costo: number;
    margen: number;
  }> = {};

  // First seed from drivers master
  drivers.forEach(d => {
    mergedMap[d.name] = {
      id: d.id,
      name: d.name,
      transporte: d.transporte,
      tipo: d.tipo,
      viajes: 0,
      toneladas: 0,
      facturado: 0,
      costo: 0,
      margen: 0
    };
  });

  // Then add trip stats
  Object.values(tripStatsMap).forEach(ts => {
    if (mergedMap[ts.name]) {
      mergedMap[ts.name].viajes = ts.viajes;
      mergedMap[ts.name].toneladas = ts.toneladas;
      mergedMap[ts.name].facturado = ts.facturado;
      mergedMap[ts.name].costo = ts.costo;
      mergedMap[ts.name].margen = ts.margen;
    } else {
      mergedMap[ts.name] = {
        name: ts.name,
        transporte: ts.transporte,
        tipo: ts.tipo,
        viajes: ts.viajes,
        toneladas: ts.toneladas,
        facturado: ts.facturado,
        costo: ts.costo,
        margen: ts.margen
      };
    }
  });

  const driverList = Object.values(mergedMap)
    .filter(d => filterType === 'all' || d.tipo === filterType)
    .sort((a, b) => {
      if (b.viajes !== a.viajes) return b.viajes - a.viajes;
      return b.margen - a.margen;
    });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold tracking-wide text-slate-100">
              Padrón y Liquidación de Choferes & Fleteros
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Conductores guardados, viajes realizados, facturación y margen
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add driver button */}
          {onOpenNewDriver && (
            <button
              onClick={onOpenNewDriver}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nuevo Chofer</span>
            </button>
          )}

          {/* Export drivers */}
          <button
            onClick={() => downloadModernExcel(trips, 'Liquidacion_Choferes_Barale.xlsx')}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
            title="Descargar Liquidación en Excel"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Excel Choferes</span>
          </button>

          {/* Filter buttons */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-xs border border-slate-700">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${filterType === 'all' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Todos ({driverList.length})
            </button>
            <button
              onClick={() => setFilterType('Propio')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${filterType === 'Propio' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Propios
            </button>
            <button
              onClick={() => setFilterType('Fletero')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${filterType === 'Fletero' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Fleteros
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider pb-2">
              <th className="pb-3 px-3">Conductor</th>
              <th className="pb-3 px-3">Modalidad</th>
              <th className="pb-3 px-3 text-right">Viajes</th>
              <th className="pb-3 px-3 text-right">Tn Cargadas</th>
              <th className="pb-3 px-3 text-right">Venta Total (NG)</th>
              <th className="pb-3 px-3 text-right">Costo Flete Pagado</th>
              <th className="pb-3 px-3 text-right">Margen Neto Barale</th>
              <th className="pb-3 px-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300">
            {driverList.map(driver => {
              const isPropio = driver.tipo === 'Propio';
              return (
                <tr key={driver.name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{driver.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{driver.transporte}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isPropio 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {driver.tipo}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-200">
                    {driver.viajes}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200">
                    {formatNumber(driver.toneladas, 1)} Tn
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200 font-medium">
                    {formatCurrency(driver.facturado)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    {driver.costo > 0 ? (
                      <span className="text-amber-400">-{formatCurrency(driver.costo)}</span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-400">
                    {formatCurrency(driver.margen)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      {driver.viajes > 0 && (
                        <button
                          onClick={() => onSelectDriverTrips(driver.name)}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium underline cursor-pointer"
                          title="Ver viajes de este chofer"
                        >
                          <span>Viajes</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}

                      {onDeleteDriver && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Deseas eliminar al chofer "${driver.name}" del padrón guardado?`)) {
                              onDeleteDriver(driver.id || driver.name);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                          title={`Eliminar ${driver.name} del padrón`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
