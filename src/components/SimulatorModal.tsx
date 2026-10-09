import React, { useState } from 'react';
import { TripRecord } from '../types/logistics';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { Calculator, X, PlusCircle, Check } from 'lucide-react';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrip: (newTrip: TripRecord) => void;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({ isOpen, onClose, onAddTrip }) => {
  if (!isOpen) return null;

  const [tipoTransporte, setTipoTransporte] = useState<'Propio' | 'Fletero'>('Propio');
  const [chofer, setChofer] = useState('Ruben Martin');
  const [cliente, setCliente] = useState('RONATA');
  const [origen, setOrigen] = useState('Balde (San Luis)');
  const [destino, setDestino] = useState('Rio Tercero (Córdoba)');
  const [producto, setProducto] = useState('Sal');
  const [tipoProducto, setTipoProducto] = useState('Sal');
  const [toneladas, setToneladas] = useState<number>(33.5);
  const [tarifaTn, setTarifaTn] = useState<number>(4250);
  const [tarifaFleteroTn, setTarifaFleteroTn] = useState<number>(2900);
  const [distanciaKm, setDistanciaKm] = useState<number>(389);
  const [isAdded, setIsAdded] = useState(false);

  // Computations
  const netoGravado = toneladas * tarifaTn;
  const iva = netoGravado * 0.21;
  const totalConIva = netoGravado + iva;

  const costoFletero = tipoTransporte === 'Fletero' ? toneladas * tarifaFleteroTn : 0;
  const margenPesos = netoGravado - costoFletero;
  const margenPct = netoGravado > 0 ? margenPesos / netoGravado : 0;
  const ingresoPorKm = distanciaKm > 0 ? netoGravado / distanciaKm : 0;

  const handleCreateTrip = () => {
    const newRecord: TripRecord = {
      id: `SIM-${Date.now().toString().slice(-4)}`,
      ejercicio: 2026,
      mes: 8,
      fechaLiquiFleteros: 'ago-26',
      mesAnoOperativo: 'ago-26',
      fechaOrdenCarga: new Date().toLocaleDateString('es-AR'),
      tipoViaje: '1',
      codChofer: tipoTransporte === 'Propio' ? '10' : '401',
      tipoTransporte,
      transporte: tipoTransporte === 'Propio' ? 'JUAN y MIGUEL' : 'Fletero Asignado',
      chofer,
      codCliente: '1001',
      clienteContrata: cliente,
      empresaRemitente: cliente,
      pciaOrigen: 'San Luis',
      origen,
      tipoProducto,
      producto,
      remitoRemitente: 'SIM-REM',
      remitoJuanMiguel: 'SIM-JM',
      kgsCargados: toneladas,
      fechaCarga: new Date().toLocaleDateString('es-AR'),
      clienteDestino: cliente,
      localidadDestino: destino,
      kmPuntoCarga: distanciaKm / 2,
      kmDestino: distanciaKm / 2,
      totalKm: distanciaKm,
      tarifaTnKm: 0,
      fechaDescarga: new Date().toLocaleDateString('es-AR'),
      nroProformaOC: 'SIM-OC',
      fechaFactura: 'Pendiente',
      factura: 'Pendiente',
      kgsFacturados: toneladas,
      tarifa: tarifaTn,
      netoGravado,
      iva,
      totalFacturado: totalConIva,
      tnsLiquiFletero: tipoTransporte === 'Fletero' ? toneladas : 0,
      tarifaFletero: tipoTransporte === 'Fletero' ? tarifaFleteroTn : 0,
      costoFletero,
      margenPesos,
      margenPct,
      estadoFacturacion: 'Facturado'
    };

    onAddTrip(newRecord);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Simulador de Tarifas & Rentabilidad
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Calcula al instante la rentabilidad del viaje para Barale
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* 1. Modalidad de Transporte */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Modalidad de Transporte
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoTransporte('Propio')}
                className={`py-2 px-3 rounded-lg font-medium transition-all cursor-pointer ${
                  tipoTransporte === 'Propio' 
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Camión Propio (Juan y Miguel)
              </button>
              <button
                type="button"
                onClick={() => setTipoTransporte('Fletero')}
                className={`py-2 px-3 rounded-lg font-medium transition-all cursor-pointer ${
                  tipoTransporte === 'Fletero' 
                    ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Fletero Tercerizado
              </button>
            </div>
          </div>

          {/* 2. Carga & Ruta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Cliente</label>
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Chofer</label>
              <input
                type="text"
                value={chofer}
                onChange={(e) => setChofer(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Origen</label>
              <input
                type="text"
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Destino</label>
              <input
                type="text"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Producto</label>
              <input
                type="text"
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Categoría</label>
              <select
                value={tipoProducto}
                onChange={(e) => setTipoProducto(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Sal">Sal</option>
                <option value="Cereales">Cereales</option>
                <option value="Tanques">Tanques (Químico)</option>
                <option value="Minerales">Minerales</option>
                <option value="Alquiler Batea">Batea</option>
              </select>
            </div>
          </div>

          {/* 3. Variables Económicas */}
          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Carga (Toneladas)</label>
                <input
                  type="number"
                  step="0.1"
                  value={toneladas}
                  onChange={(e) => setToneladas(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tarifa Cliente ($/Tn)</label>
                <input
                  type="number"
                  step="10"
                  value={tarifaTn}
                  onChange={(e) => setTarifaTn(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {tipoTransporte === 'Fletero' && (
                <div>
                  <label className="block text-amber-400 font-medium mb-1">Tarifa Fletero ($/Tn)</label>
                  <input
                    type="number"
                    step="10"
                    value={tarifaFleteroTn}
                    onChange={(e) => setTarifaFleteroTn(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-amber-600/50 rounded-lg px-3 py-2 text-amber-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Distancia Total (Km)</label>
                <input
                  type="number"
                  step="1"
                  value={distanciaKm}
                  onChange={(e) => setDistanciaKm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 4. Resultado en Tiempo Real */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Resultado Proyectado de Rentabilidad
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Facturación NG</span>
                <span className="font-mono font-bold text-white block mt-0.5">{formatCurrency(netoGravado)}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">IVA 21%</span>
                <span className="font-mono font-medium text-slate-300 block mt-0.5">{formatCurrency(iva)}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Costo Fletero</span>
                <span className="font-mono font-medium text-amber-400 block mt-0.5">
                  {costoFletero > 0 ? `-${formatCurrency(costoFletero)}` : '$0'}
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-emerald-400 font-semibold block">Margen Barale</span>
                <span className="font-mono font-bold text-emerald-400 block mt-0.5">{formatCurrency(margenPesos)}</span>
                <span className="text-[10px] text-emerald-400/80 font-medium">({formatPercent(margenPct)})</span>
              </div>
            </div>

            {distanciaKm > 0 && (
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>Rendimiento por kilómetro:</span>
                <span className="font-mono text-slate-300 font-semibold">{formatCurrency(ingresoPorKm)} / km</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateTrip}
            disabled={isAdded}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer ${
              isAdded ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-500 shadow-sm'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Agregado con éxito!</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Guardar Viaje en Dashboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
