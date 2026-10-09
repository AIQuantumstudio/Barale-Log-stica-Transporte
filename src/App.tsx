/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { INITIAL_TRIPS, calculateMetrics } from './data/tripsData';
import { TripRecord } from './types/logistics';
import { KPICards } from './components/KPICards';
import { Charts } from './components/Charts';
import { TripsTable } from './components/TripsTable';
import { DriverPerformance } from './components/DriverPerformance';
import { TripDetailModal } from './components/TripDetailModal';
import { SimulatorModal } from './components/SimulatorModal';
import { UploadModal } from './components/UploadModal';
import { NewTripModal } from './components/NewTripModal';
import { NewDriverModal } from './components/NewDriverModal';
import { NewClientModal } from './components/NewClientModal';
import { downloadModernExcel, downloadStyledColorExcel } from './utils/excelExporter';
import { 
  Truck, 
  Plus, 
  Upload, 
  RotateCcw, 
  SlidersHorizontal,
  Table as TableIcon,
  Users,
  FileSpreadsheet,
  Download,
  Building2,
  UserPlus
} from 'lucide-react';

export default function App() {
  const [trips, setTrips] = useState<TripRecord[]>(INITIAL_TRIPS);
  const [selectedTrip, setSelectedTrip] = useState<TripRecord | null>(null);
  
  // Modals state
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewTripOpen, setIsNewTripOpen] = useState(false);
  const [isNewDriverOpen, setIsNewDriverOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);

  // Active View Tab: 'viajes' | 'choferes'
  const [activeTab, setActiveTab] = useState<'viajes' | 'choferes'>('viajes');

  // Filters State
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [transportFilter, setTransportFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('');

  // Extract unique drivers & clients list for selectors
  const existingDrivers = useMemo(() => {
    return Array.from(new Set(trips.map(t => t.chofer).filter(Boolean)));
  }, [trips]);

  const existingClients = useMemo(() => {
    return Array.from(new Set(trips.map(t => t.clienteContrata).filter(Boolean)));
  }, [trips]);

  // Filtered trips for calculations & tables
  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      // Period filter
      if (selectedPeriod === 'ago-26' && t.fechaLiquiFleteros !== 'ago-26') return false;
      if (selectedPeriod === 'sep-26' && t.fechaLiquiFleteros !== 'sep-26') return false;

      // Transport filter
      if (transportFilter !== 'all' && t.tipoTransporte !== transportFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && t.estadoFacturacion !== statusFilter) return false;

      // Product filter
      if (productFilter !== 'all' && t.tipoProducto !== productFilter) return false;

      // Client filter
      if (clientFilter && t.clienteContrata !== clientFilter) return false;

      return true;
    });
  }, [trips, selectedPeriod, transportFilter, statusFilter, productFilter, clientFilter]);

  // Overall metrics based on filtered trips
  const metrics = useMemo(() => calculateMetrics(filteredTrips), [filteredTrips]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedPeriod('all');
    setTransportFilter('all');
    setStatusFilter('all');
    setProductFilter('all');
    setClientFilter('');
  };

  // Add operational trip
  const handleAddTrip = (newTrip: TripRecord) => {
    setTrips(prev => [newTrip, ...prev]);
  };

  // Add driver
  const handleAddDriver = (driver: { name: string; transporte: string; tipo: 'Propio' | 'Fletero'; codChofer: string }) => {
    // Register as template trip or notify user
    const simulatedTrip: TripRecord = {
      id: `CHO-${Date.now().toString().slice(-4)}`,
      ejercicio: 2026,
      mes: 8,
      fechaLiquiFleteros: 'ago-26',
      mesAnoOperativo: 'ago-26',
      fechaOrdenCarga: new Date().toLocaleDateString('es-AR'),
      tipoViaje: '1',
      codChofer: driver.codChofer,
      tipoTransporte: driver.tipo,
      transporte: driver.transporte,
      chofer: driver.name,
      codCliente: '1001',
      clienteContrata: 'RONATA',
      empresaRemitente: 'ABIC',
      pciaOrigen: 'San Luis',
      origen: 'Balde',
      tipoProducto: 'Sal',
      producto: 'Sal',
      remitoRemitente: 'Pendiente',
      remitoJuanMiguel: 'Pendiente',
      kgsCargados: 33.00,
      fechaCarga: new Date().toLocaleDateString('es-AR'),
      clienteDestino: 'RONATA',
      localidadDestino: 'Rio Tercero',
      kmPuntoCarga: 0,
      kmDestino: 0,
      totalKm: 0,
      tarifaTnKm: 0,
      fechaDescarga: new Date().toLocaleDateString('es-AR'),
      nroProformaOC: '',
      fechaFactura: 'Pendiente',
      factura: 'Pendiente',
      kgsFacturados: 33.00,
      tarifa: 4254.87,
      netoGravado: 0,
      iva: 0,
      totalFacturado: 0,
      tnsLiquiFletero: driver.tipo === 'Fletero' ? 33.00 : 0,
      tarifaFletero: driver.tipo === 'Fletero' ? 2904.03 : 0,
      costoFletero: 0,
      margenPesos: 0,
      margenPct: 0,
      estadoFacturacion: 'Pendiente'
    };
    setTrips(prev => [simulatedTrip, ...prev]);
  };

  // Add client
  const handleAddClient = (client: { name: string; codCliente: string; empresaRemitente: string }) => {
    const simulatedTrip: TripRecord = {
      id: `CTE-${Date.now().toString().slice(-4)}`,
      ejercicio: 2026,
      mes: 8,
      fechaLiquiFleteros: 'ago-26',
      mesAnoOperativo: 'ago-26',
      fechaOrdenCarga: new Date().toLocaleDateString('es-AR'),
      tipoViaje: '1',
      codChofer: '10',
      tipoTransporte: 'Propio',
      transporte: 'JUAN y MIGUEL',
      chofer: 'Ruben Martin',
      codCliente: client.codCliente,
      clienteContrata: client.name,
      empresaRemitente: client.empresaRemitente,
      pciaOrigen: 'Cordoba',
      origen: 'Rio Cuarto',
      tipoProducto: 'Cereales',
      producto: 'Maiz',
      remitoRemitente: 'Pendiente',
      remitoJuanMiguel: 'Pendiente',
      kgsCargados: 32.00,
      fechaCarga: new Date().toLocaleDateString('es-AR'),
      clienteDestino: client.name,
      localidadDestino: 'San Luis',
      kmPuntoCarga: 0,
      kmDestino: 0,
      totalKm: 0,
      tarifaTnKm: 0,
      fechaDescarga: new Date().toLocaleDateString('es-AR'),
      nroProformaOC: '',
      fechaFactura: 'Pendiente',
      factura: 'Pendiente',
      kgsFacturados: 32.00,
      tarifa: 4100.00,
      netoGravado: 0,
      iva: 0,
      totalFacturado: 0,
      tnsLiquiFletero: 0,
      tarifaFletero: 0,
      costoFletero: 0,
      margenPesos: 0,
      margenPct: 0,
      estadoFacturacion: 'Pendiente'
    };
    setTrips(prev => [simulatedTrip, ...prev]);
  };

  // Import trips
  const handleImportTrips = (imported: TripRecord[]) => {
    setTrips(imported);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. TOP BAR */}
      <header className="border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">
              Barale · Logística & Transporte
            </h1>
            <span className="text-[11px] text-slate-400 font-normal">
              Operaciones Bunge / Transporte Juan y Miguel
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <button 
            onClick={() => setActiveTab('viajes')}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'viajes' ? 'text-blue-400 font-semibold' : 'hover:text-white text-slate-400'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Planilla de Viajes</span>
          </button>
          <button 
            onClick={() => setActiveTab('choferes')}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'choferes' ? 'text-blue-400 font-semibold' : 'hover:text-white text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Liquidación Conducción</span>
          </button>
        </nav>

        {/* Primary Actions with EXCEL DOWNLOAD & ADD */}
        <div className="flex items-center gap-2">
          {/* DESCARGA EXCEL COLORES POR SECTOR 100% FUNCIONAL */}
          <button
            onClick={() => downloadStyledColorExcel(filteredTrips, `Liquidacion_Barale_Sectores_Colores_${new Date().toISOString().slice(0, 10)}.xls`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-sm"
            title="Descargar Excel con Columnas y Sectores Coloreados al 100%"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Descargar Excel (Sectores)</span>
          </button>

          {/* DESCARGA XLSX */}
          <button
            onClick={() => downloadModernExcel(filteredTrips, `Liquidacion_Barale_${new Date().toISOString().slice(0, 10)}.xlsx`)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Descargar Libro XLSX con múltiples hojas"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>XLSX</span>
          </button>

          {/* Importar */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Importar Excel o CSV"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Importar</span>
          </button>

          {/* Botón Principal: + Nuevo Viaje */}
          <button
            onClick={() => setIsNewTripOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nuevo Viaje</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Barra Rápida de Agregado por Sector & Filtros */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs shadow-xs">
          {/* Sectores de Agregado Rápido */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] mr-1">
              Agregar en Sector:
            </span>

            {/* Sector Viaje */}
            <button
              onClick={() => setIsNewTripOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3 text-blue-400" />
              <span>+ Viaje / Carga</span>
            </button>

            {/* Sector Chofer */}
            <button
              onClick={() => setIsNewDriverOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-600/15 hover:bg-amber-600/25 text-amber-300 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <UserPlus className="w-3 h-3 text-amber-400" />
              <span>+ Chofer / Fletero</span>
            </button>

            {/* Sector Cliente */}
            <button
              onClick={() => setIsNewClientOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 border border-purple-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <Building2 className="w-3 h-3 text-purple-400" />
              <span>+ Cliente</span>
            </button>

            {/* Sector Cotización */}
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <Truck className="w-3 h-3 text-emerald-400" />
              <span>+ Cotizar / Simular</span>
            </button>
          </div>

          {/* Filtros de Control */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-slate-500 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            </span>

            {/* Período */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/80">
              <button
                onClick={() => setSelectedPeriod('all')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  selectedPeriod === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedPeriod('ago-26')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  selectedPeriod === 'ago-26' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ago-26
              </button>
              <button
                onClick={() => setSelectedPeriod('sep-26')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  selectedPeriod === 'sep-26' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sep-26
              </button>
            </div>

            {/* Modalidad */}
            <select
              value={transportFilter}
              onChange={(e) => setTransportFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Flota: Todos</option>
              <option value="Propio">Camiones Propios</option>
              <option value="Fletero">Fleteros</option>
            </select>

            {/* Estado Factura */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Facturación: Todas</option>
              <option value="Facturado">Facturados</option>
              <option value="Pendiente">Pendientes</option>
            </select>

            {(selectedPeriod !== 'all' || transportFilter !== 'all' || statusFilter !== 'all' || productFilter !== 'all' || clientFilter) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ml-1"
                title="Restablecer filtros"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 2. KPI METRICS CARDS */}
        <KPICards 
          metrics={metrics}
          onFilterStatus={(s) => setStatusFilter(s)}
          onFilterTransport={(t) => setTransportFilter(t)}
          activeStatusFilter={statusFilter}
          activeTransportFilter={transportFilter}
        />

        {/* 3. INTERACTIVE VISUAL CHARTS WITH ADD PER SECTOR BUTTONS */}
        <Charts 
          trips={filteredTrips}
          onSelectProduct={(p) => setProductFilter(p || 'all')}
          onSelectClient={(c) => setClientFilter(c)}
          selectedProduct={productFilter === 'all' ? '' : productFilter}
          selectedClient={clientFilter}
          onOpenNewTrip={() => setIsNewTripOpen(true)}
          onOpenNewDriver={() => setIsNewDriverOpen(true)}
          onOpenNewClient={() => setIsNewClientOpen(true)}
        />

        {/* 4. TABS NAVIGATION */}
        <div className="border-b border-slate-800 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('viajes')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'viajes'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Planilla Detallada de Viajes ({filteredTrips.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('choferes')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'choferes'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Liquidación & Choferes ({existingDrivers.length})</span>
            </button>
          </div>

          {/* Quick Direct Download Button */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => downloadStyledColorExcel(filteredTrips)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Descargar Excel con Colores por Sector</span>
            </button>
          </div>
        </div>

        {/* 5. TAB CONTENT */}
        {activeTab === 'viajes' ? (
          <TripsTable 
            trips={filteredTrips}
            onSelectTrip={(t) => setSelectedTrip(t)}
            selectedTransportFilter={transportFilter}
            onChangeTransportFilter={setTransportFilter}
            selectedStatusFilter={statusFilter}
            onChangeStatusFilter={setStatusFilter}
            selectedProductFilter={productFilter}
            onChangeProductFilter={setProductFilter}
            onOpenNewTrip={() => setIsNewTripOpen(true)}
          />
        ) : (
          <DriverPerformance 
            trips={filteredTrips}
            onSelectDriverTrips={() => {
              setActiveTab('viajes');
            }}
            onOpenNewDriver={() => setIsNewDriverOpen(true)}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        Barale · Control de Cargas & Liquidación de Fleteros 2026. Dashboard interactivo para Transporte Juan y Miguel.
      </footer>

      {/* MODALS */}
      <TripDetailModal 
        trip={selectedTrip} 
        onClose={() => setSelectedTrip(null)} 
      />

      <NewTripModal
        isOpen={isNewTripOpen}
        onClose={() => setIsNewTripOpen(false)}
        onAddTrip={handleAddTrip}
        existingDrivers={existingDrivers}
        existingClients={existingClients}
      />

      <NewDriverModal
        isOpen={isNewDriverOpen}
        onClose={() => setIsNewDriverOpen(false)}
        onAddDriver={handleAddDriver}
      />

      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onAddClient={handleAddClient}
      />

      <SimulatorModal 
        isOpen={isSimulatorOpen} 
        onClose={() => setIsSimulatorOpen(false)} 
        onAddTrip={handleAddTrip} 
      />

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onImportData={handleImportTrips} 
      />
    </div>
  );
}
