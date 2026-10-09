import React, { useState } from 'react';
import { TripRecord } from '../types/logistics';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { X, Truck, PlusCircle, Check } from 'lucide-react';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrip: (trip: TripRecord) => void;
  existingDrivers: string[];
  existingClients: string[];
}

export const NewTripModal: React.FC<NewTripModalProps> = ({
  isOpen,
  onClose,
  onAddTrip,
  existingDrivers,
  existingClients
}) => {
  if (!isOpen) return null;

  const [fechaCarga, setFechaCarga] = useState(new Date().toLocaleDateString('es-AR'));
  const [tipoTransporte, setTipoTransporte] = useState<'Propio' | 'Fletero'>('Propio');
  const [transporte, setTransporte] = useState('JUAN y MIGUEL');
  const [chofer, setChofer] = useState(existingDrivers[0] || 'Ruben Martin');
  const [codChofer, setCodChofer] = useState('10');
  const [clienteContrata, setClienteContrata] = useState(existingClients[0] || 'RONATA');
  const [empresaRemitente, setEmpresaRemitente] = useState('ABIC');
  const [pciaOrigen, setPciaOrigen] = useState('San Luis');
  const [origen, setOrigen] = useState('Balde');
  const [clienteDestino, setClienteDestino] = useState('RONATA');
  const [localidadDestino, setLocalidadDestino] = useState('Rio Tercero');
  const [tipoProducto, setTipoProducto] = useState('Sal');
  const [producto, setProducto] = useState('Sal');
  const [remitoRemitente, setRemitoRemitente] = useState('');
  const [remitoJuanMiguel, setRemitoJuanMiguel] = useState('');
  const [kgsCargados, setKgsCargados] = useState<number>(33.5);
  const [tarifa, setTarifa] = useState<number>(4254.87);
  const [tarifaFletero, setTarifaFletero] = useState<number>(2904.03);
  const [totalKm, setTotalKm] = useState<number>(0);
  const [factura, setFactura] = useState('');
  const [nroProformaOC] = useState('');
  const [estadoFacturacion, setEstadoFacturacion] = useState<'Facturado' | 'Pendiente'>('Facturado');

  // Cálculos automáticos
  const netoGravado = estadoFacturacion === 'Pendiente' ? 0 : kgsCargados * tarifa;
  const iva = netoGravado * 0.21;
  const totalFacturado = netoGravado + iva;
  const costoFletero = (tipoTransporte === 'Fletero' && estadoFacturacion !== 'Pendiente') ? kgsCargados * tarifaFletero : 0;
  const margenPesos = netoGravado - costoFletero;
  const margenPct = netoGravado > 0 ? margenPesos / netoGravado : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: TripRecord = {
      id: `TRP-${Date.now().toString().slice(-4)}`,
      ejercicio: 2026,
      mes: 8,
      fechaLiquiFleteros: 'ago-26',
      mesAnoOperativo: 'ago-26',
      fechaOrdenCarga: fechaCarga,
      tipoViaje: '1',
      codChofer,
      tipoTransporte,
      transporte: tipoTransporte === 'Propio' ? 'JUAN y MIGUEL' : transporte,
      chofer,
      codCliente: '1001',
      clienteContrata,
      empresaRemitente,
      pciaOrigen,
      origen,
      tipoProducto,
      producto,
      remitoRemitente: remitoRemitente || 'Directo',
      remitoJuanMiguel: remitoJuanMiguel || 'Directo',
      kgsCargados,
      fechaCarga,
      clienteDestino,
      localidadDestino,
      kmPuntoCarga: Math.round(totalKm / 2),
      kmDestino: Math.round(totalKm / 2),
      totalKm,
      tarifaTnKm: 0,
      fechaDescarga: fechaCarga,
      nroProformaOC,
      fechaFactura: estadoFacturacion === 'Facturado' ? fechaCarga : 'Pendiente',
      factura: factura || (estadoFacturacion === 'Facturado' ? '0012-00899' : 'Pendiente'),
      kgsFacturados: kgsCargados,
      tarifa,
      netoGravado,
      iva,
      totalFacturado,
      tnsLiquiFletero: tipoTransporte === 'Fletero' ? kgsCargados : 0,
      tarifaFletero: tipoTransporte === 'Fletero' ? tarifaFletero : 0,
      costoFletero,
      margenPesos,
      margenPct,
      estadoFacturacion
    };

    onAddTrip(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Registrar Nuevo Viaje / Carga
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Alta de viaje en la planilla operativa de Barale
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Modalidad & Chofer */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                1. Modalidad & Transporte
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTipoTransporte('Propio');
                    setTransporte('JUAN y MIGUEL');
                  }}
                  className={`px-3 py-1 rounded-md font-medium cursor-pointer ${tipoTransporte === 'Propio' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Flota Propia
                </button>
                <button
                  type="button"
                  onClick={() => setTipoTransporte('Fletero')}
                  className={`px-3 py-1 rounded-md font-medium cursor-pointer ${tipoTransporte === 'Fletero' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Fletero Tercero
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1">Chofer</label>
                <input
                  type="text"
                  required
                  value={chofer}
                  onChange={(e) => setChofer(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Transporte / Razón Social</label>
                <input
                  type="text"
                  required
                  value={transporte}
                  onChange={(e) => setTransporte(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Cód. Chofer</label>
                <input
                  type="text"
                  value={codChofer}
                  onChange={(e) => setCodChofer(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Cliente, Remitente y Ruta */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] block">
              2. Cliente & Trayecto
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1">Cliente Contrata</label>
                <input
                  type="text"
                  required
                  value={clienteContrata}
                  onChange={(e) => setClienteContrata(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Empresa Remitente</label>
                <input
                  type="text"
                  value={empresaRemitente}
                  onChange={(e) => setEmpresaRemitente(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Origen (Localidad)</label>
                <input
                  type="text"
                  required
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Destino (Localidad)</label>
                <input
                  type="text"
                  required
                  value={localidadDestino}
                  onChange={(e) => setLocalidadDestino(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Carga, Remito y Toneladas */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] block">
              3. Carga & Documentación
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1">Producto</label>
                <input
                  type="text"
                  required
                  value={producto}
                  onChange={(e) => setProducto(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Categoría</label>
                <select
                  value={tipoProducto}
                  onChange={(e) => setTipoProducto(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="Sal">Sal</option>
                  <option value="Cereales">Cereales</option>
                  <option value="Tanques">Tanques (Químico)</option>
                  <option value="Minerales">Minerales</option>
                  <option value="Alquiler Batea">Batea</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Tn Cargadas</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={kgsCargados}
                  onChange={(e) => setKgsCargados(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Km Recorrido</label>
                <input
                  type="number"
                  value={totalKm}
                  onChange={(e) => setTotalKm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Remito Remitente</label>
                <input
                  type="text"
                  value={remitoRemitente}
                  onChange={(e) => setRemitoRemitente(e.target.value)}
                  placeholder="Ej: 1355"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Remito Juan y Miguel</label>
                <input
                  type="text"
                  value={remitoJuanMiguel}
                  onChange={(e) => setRemitoJuanMiguel(e.target.value)}
                  placeholder="Ej: 107120"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Fecha Carga</label>
                <input
                  type="text"
                  value={fechaCarga}
                  onChange={(e) => setFechaCarga(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Estado</label>
                <select
                  value={estadoFacturacion}
                  onChange={(e) => setEstadoFacturacion(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="Facturado">Facturado</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liquidación & Tarifas */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] block">
              4. Facturación & Liquidación
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1">Tarifa Cliente ($/Tn)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tarifa}
                  onChange={(e) => setTarifa(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold"
                />
              </div>
              {tipoTransporte === 'Fletero' && (
                <div>
                  <label className="block text-amber-400 mb-1">Tarifa Fletero ($/Tn)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tarifaFletero}
                    onChange={(e) => setTarifaFletero(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-amber-600/50 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono font-bold"
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-400 mb-1">Nro Factura</label>
                <input
                  type="text"
                  value={factura}
                  onChange={(e) => setFactura(e.target.value)}
                  placeholder="Ej: 0012-00895"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            {/* Vista previa económica */}
            <div className="mt-2 pt-2 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
              <div>
                <span className="text-slate-400 block">Neto Gravado:</span>
                <span className="font-mono font-semibold text-white">{formatCurrency(netoGravado)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total c/IVA:</span>
                <span className="font-mono font-semibold text-slate-300">{formatCurrency(totalFacturado)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Costo Fletero:</span>
                <span className="font-mono font-semibold text-amber-400">{costoFletero > 0 ? `-${formatCurrency(costoFletero)}` : '$0'}</span>
              </div>
              <div>
                <span className="text-emerald-400 block font-semibold">Margen Barale:</span>
                <span className="font-mono font-bold text-emerald-400">{formatCurrency(margenPesos)} ({formatPercent(margenPct)})</span>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
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
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Guardar Viaje</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
