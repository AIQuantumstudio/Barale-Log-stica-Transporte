import React from 'react';
import { TripRecord } from '../types/logistics';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import { X, Truck, FileText, MapPin, Calculator, ShieldCheck } from 'lucide-react';

interface TripDetailModalProps {
  trip: TripRecord | null;
  onClose: () => void;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({ trip, onClose }) => {
  if (!trip) return null;

  const isPropio = trip.tipoTransporte === 'Propio';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isPropio ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Viaje {trip.id}
                </h2>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  isPropio ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {trip.tipoTransporte}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  trip.estadoFacturacion === 'Facturado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {trip.estadoFacturacion}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {trip.fechaCarga || trip.fechaOrdenCarga} · Chofer: {trip.chofer}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Carga & Ruta */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Ruta & Carga</span>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Origen:</span>
                  <span className="text-white font-medium">{trip.origen}</span>
                  <span className="text-slate-400 text-[11px] ml-1">({trip.pciaOrigen})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Destino:</span>
                  <span className="text-white font-medium">{trip.localidadDestino}</span>
                  <span className="text-slate-400 text-[11px] ml-1">({trip.clienteDestino})</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between">
                  <span className="text-slate-400">Producto:</span>
                  <span className="text-slate-200 font-semibold">{trip.producto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tipo de Producto:</span>
                  <span className="text-slate-300">{trip.tipoProducto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Toneladas Cargadas:</span>
                  <span className="text-blue-400 font-mono font-bold">{formatNumber(trip.kgsCargados, 2)} Tn</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Distancia Recorrida:</span>
                  <span className="font-mono text-slate-300">{trip.totalKm > 0 ? `${trip.totalKm} km` : 'Local / 0 km'}</span>
                </div>
              </div>
            </div>

            {/* 2. Documentación & Remitos */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Documentación</span>
              </div>

              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cliente Contratante:</span>
                  <span className="text-white font-medium truncate max-w-[170px]">{trip.clienteContrata}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Empresa Remitente:</span>
                  <span className="text-slate-300 truncate max-w-[170px]">{trip.empresaRemitente}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Remito Remitente:</span>
                  <span className="font-mono text-slate-200">{trip.remitoRemitente || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Remito Juan y Miguel:</span>
                  <span className="font-mono text-slate-200">{trip.remitoJuanMiguel || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Factura Asignada:</span>
                  <span className="font-mono text-blue-400 font-semibold">{trip.factura || 'Pendiente'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nro OC / Proforma:</span>
                  <span className="font-mono text-slate-300">{trip.nroProformaOC || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Desglose Económico y Liquidación */}
          <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>Liquidación & Rentabilidad Operativa</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Tarifa Facturada</span>
                <span className="font-mono tabular-nums text-sm font-bold text-white">
                  {formatCurrency(trip.tarifa)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">por Tn / viaje</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Facturado Neto (NG)</span>
                <span className="font-mono tabular-nums text-sm font-bold text-white">
                  {formatCurrency(trip.netoGravado)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">+ IVA: {formatCurrency(trip.iva)}</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Costo Flete Pagado</span>
                <span className="font-mono tabular-nums text-sm font-bold text-amber-400">
                  {trip.costoFletero > 0 ? formatCurrency(trip.costoFletero) : '$0'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {isPropio ? 'Vehículo Propio' : `Tarifa: ${formatCurrency(trip.tarifaFletero)}`}
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Margen Barale</span>
                <span className="font-mono tabular-nums text-sm font-bold text-emerald-400">
                  {formatCurrency(trip.margenPesos)}
                </span>
                <span className="text-[10px] text-emerald-400/90 block mt-0.5 font-medium">
                  {formatPercent(trip.margenPct)} margen
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900 text-xs">
          <div className="text-slate-500 font-mono">
            Ejercicio: {trip.ejercicio} · Mes: {trip.mes} ({trip.mesAnoOperativo})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
