/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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
import { DocumentControlReport } from './components/DocumentControlReport';
import { InvoicesControlReport } from './components/InvoicesControlReport';
import { downloadModernExcel, downloadStyledColorExcel } from './utils/excelExporter';
import { 
  DriverMaster, 
  ClientMaster, 
  MONTHS_2026, 
  loadStoredDrivers, 
  saveStoredDrivers, 
  loadStoredClients, 
  saveStoredClients 
} from './data/masterRecords';
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
  UserPlus,
  FileCheck,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Calendar,
  Sparkles
} from 'lucide-react';

const STORAGE_KEY = 'barale_trips_data_v2';

export default function App() {
  // Carga automática desde localStorage para persistir los datos entre sesiones
  const [trips, setTrips] = useState<TripRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_TRIPS.length) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error al recuperar datos de localStorage:', err);
    }
    return INITIAL_TRIPS;
  });

  // Padrón persistente de choferes y clientes
  const [drivers, setDrivers] = useState<DriverMaster[]>(() => loadStoredDrivers());
  const [clients, setClients] = useState<ClientMaster[]>(() => loadStoredClients());

  const [selectedTrip, setSelectedTrip] = useState<TripRecord | null>(null);

  // Guardado automático inmediato en localStorage ante cualquier carga o cambio
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (err) {
      console.error('Error al guardar datos en localStorage:', err);
    }
  }, [trips]);

  // Modals state
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewTripOpen, setIsNewTripOpen] = useState(false);
  const [isNewDriverOpen, setIsNewDriverOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);

  // Active View Tab: 'viajes' | 'control-doc' | 'facturas-emitidas' | 'choferes'
  const [activeTab, setActiveTab] = useState<'viajes' | 'control-doc' | 'facturas-emitidas' | 'choferes'>('viajes');

  // Feedback notifications and modal state
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const jsonFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Filters State (defaulting to all or 'ago-26')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ago-26');
  const [transportFilter, setTransportFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('');

  // Extract unique drivers & clients list for selectors and compatibility
  const existingDrivers = useMemo(() => {
    const list = new Set<string>();
    drivers.forEach(d => list.add(d.name));
    trips.forEach(t => { if (t.chofer) list.add(t.chofer); });
    return Array.from(list);
  }, [drivers, trips]);

  const existingClients = useMemo(() => {
    const list = new Set<string>();
    clients.forEach(c => list.add(c.name));
    trips.forEach(t => { if (t.clienteContrata) list.add(t.clienteContrata); });
    return Array.from(list);
  }, [clients, trips]);

  // Contador de viajes por cada uno de los 12 meses del año 2026
  const monthCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MONTHS_2026.forEach(m => { counts[m.id] = 0; });
    trips.forEach(t => {
      const key = (t.fechaLiquiFleteros || '').toLowerCase();
      if (counts[key] !== undefined) {
        counts[key]++;
      } else if (t.mes && t.mes >= 1 && t.mes <= 12) {
        const mDef = MONTHS_2026[t.mes - 1];
        if (mDef) counts[mDef.id]++;
      }
    });
    return counts;
  }, [trips]);

  // Filtered trips for calculations & tables across all 12 months
  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      // Period filter (soporta cualquiera de los 12 meses o todos)
      if (selectedPeriod !== 'all') {
        const periodLower = selectedPeriod.toLowerCase();
        const mDef = MONTHS_2026.find(m => m.id === selectedPeriod);
        const matchesPeriod = 
          (t.fechaLiquiFleteros && t.fechaLiquiFleteros.toLowerCase() === periodLower) ||
          (t.mesAnoOperativo && t.mesAnoOperativo.toLowerCase() === periodLower) ||
          (mDef && t.mes === mDef.monthNumber);
        if (!matchesPeriod) return false;
      }

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
    setFeedbackMessage(`Viaje ${newTrip.id} registrado correctamente en la Base de Datos.`);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Add and persist driver
  const handleAddDriver = (driver: { name: string; transporte: string; tipo: 'Propio' | 'Fletero'; codChofer: string }) => {
    const newDrv: DriverMaster = {
      id: `DRV-${Date.now().toString().slice(-4)}`,
      name: driver.name.trim(),
      transporte: driver.transporte.trim() || (driver.tipo === 'Propio' ? 'JUAN y MIGUEL' : 'Fletero Asignado'),
      tipo: driver.tipo,
      codChofer: driver.codChofer.trim() || (driver.tipo === 'Propio' ? '25' : '650')
    };

    setDrivers(prev => {
      const updated = [newDrv, ...prev.filter(d => d.name.toUpperCase() !== newDrv.name.toUpperCase())];
      saveStoredDrivers(updated);
      return updated;
    });

    setFeedbackMessage(`Chofer "${driver.name}" guardado en el padrón desplegable.`);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Delete driver from master list
  const handleDeleteDriver = (driverIdOrName: string) => {
    setDrivers(prev => {
      const updated = prev.filter(d => d.id !== driverIdOrName && d.name !== driverIdOrName);
      saveStoredDrivers(updated);
      return updated;
    });
    setFeedbackMessage(`Chofer eliminado del padrón.`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Add and persist client
  const handleAddClient = (client: { name: string; codCliente: string; empresaRemitente: string }) => {
    const newCli: ClientMaster = {
      id: `CLI-${Date.now().toString().slice(-4)}`,
      name: client.name.trim().toUpperCase(),
      codCliente: client.codCliente.trim() || '1800',
      empresaRemitente: client.empresaRemitente.trim() || client.name.trim().toUpperCase()
    };

    setClients(prev => {
      const updated = [newCli, ...prev.filter(c => c.name.toUpperCase() !== newCli.name.toUpperCase())];
      saveStoredClients(updated);
      return updated;
    });

    setFeedbackMessage(`Cliente "${client.name}" guardado en el padrón desplegable.`);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Delete client from master list
  const handleDeleteClient = (clientIdOrName: string) => {
    setClients(prev => {
      const updated = prev.filter(c => c.id !== clientIdOrName && c.name !== clientIdOrName);
      saveStoredClients(updated);
      return updated;
    });
    setFeedbackMessage(`Cliente eliminado del padrón.`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Import trips from CSV/Excel
  const handleImportTrips = (imported: TripRecord[]) => {
    setTrips(imported);
    setFeedbackMessage(`Planilla importada con éxito: ${imported.length} viajes registrados.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Update trip (used by Document Control, Table and Editors)
  const handleUpdateTrip = (updated: TripRecord) => {
    setTrips(prev => prev.map(t => t.id === updated.id ? updated : t));
    setFeedbackMessage(`Registro ${updated.id} actualizado con éxito.`);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Pending documentation counter
  const pendingDocsCount = useMemo(() => {
    return trips.filter(t => 
      !t.remitoRemitente || 
      t.remitoRemitente.toLowerCase().includes('pend') ||
      !t.remitoJuanMiguel || 
      t.remitoJuanMiguel.toLowerCase().includes('pend') ||
      t.factura.toLowerCase().includes('pend')
    ).length;
  }, [trips]);

  // Exportar Respaldo (JSON)
  const handleExportJsonBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trips, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `Respaldo_Logistica_Transporte_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setFeedbackMessage(`Respaldo JSON descargado con éxito (${trips.length} registros).`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      setErrorMessage('Error al generar la copia de respaldo JSON.');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  // Importar Respaldo (JSON)
  const handleImportJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
          setTrips(parsed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          setFeedbackMessage(`Respaldo restaurado con éxito: ${parsed.length} registros cargados.`);
          setTimeout(() => setFeedbackMessage(null), 4500);
        } else {
          setErrorMessage('El archivo JSON no contiene una estructura de registros de viajes válida.');
          setTimeout(() => setErrorMessage(null), 4500);
        }
      } catch (err) {
        setErrorMessage('Error al leer o interpretar el archivo JSON.');
        setTimeout(() => setErrorMessage(null), 4500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
              Logística & Transporte Dashboard
            </h1>
            <span className="text-[11px] text-slate-400 font-normal">
              Operaciones Bunge / Transporte Juan y Miguel
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-300">
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
            onClick={() => setActiveTab('control-doc')}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'control-doc' ? 'text-blue-400 font-semibold' : 'hover:text-white text-slate-400'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Control Documental</span>
            {pendingDocsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingDocsCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('facturas-emitidas')}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'facturas-emitidas' ? 'text-blue-400 font-semibold' : 'hover:text-white text-slate-400'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Control Facturas</span>
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

        {/* Primary Actions with EXCEL DOWNLOAD, JSON BACKUP & ADD */}
        <div className="flex items-center gap-2">
          {/* DESCARGA EXCEL COMPLETO CON SECTORES POR COLOR EN TODAS LAS HOJAS */}
          <button
            onClick={() => downloadStyledColorExcel(filteredTrips, `Liquidacion_Barale_Sectores_Colores_${new Date().toISOString().slice(0, 10)}.xlsx`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-sm"
            title="Descargar Planilla Base al 100% y todas las hojas sectorizadas por color con fórmulas 100% funcionales"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Descargar Excel (Sectores por Color)</span>
          </button>

          {/* DESCARGA XLSX */}
          <button
            onClick={() => downloadModernExcel(filteredTrips, `Liquidacion_Barale_${new Date().toISOString().slice(0, 10)}.xlsx`)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Descargar versión XLSX nativa con múltiples hojas"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>XLSX</span>
          </button>

          {/* BOTÓN EXPORTAR RESPALDO (JSON) */}
          <button
            onClick={handleExportJsonBackup}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Exportar Respaldo (JSON) para guardar copia en tu computadora"
          >
            <FileJson className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Exportar Respaldo (JSON)</span>
          </button>

          {/* BOTÓN IMPORTAR RESPALDO */}
          <button
            onClick={() => jsonFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-purple-300 bg-slate-800 hover:bg-slate-700 border border-purple-500/30 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Importar Respaldo desde archivo JSON guardado"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Importar Respaldo</span>
          </button>
          <input
            type="file"
            ref={jsonFileInputRef}
            accept=".json,application/json"
            onChange={handleImportJsonBackup}
            className="hidden"
          />

          {/* Importar Excel / CSV */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Importar Excel o CSV"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Importar CSV</span>
          </button>

          {/* Botón Principal: + Nuevo Viaje */}
          <button
            onClick={() => setIsNewTripOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nuevo Viaje</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Toast Feedback Banners */}
        {feedbackMessage && (
          <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <button 
              onClick={() => setFeedbackMessage(null)}
              className="text-emerald-400 hover:text-white ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-950/90 border border-rose-500/50 text-rose-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

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

            {/* Selector de Período: 12 Meses del Año 2026 + Año Completo */}
            <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg p-1 border border-slate-700/80">
              <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-1" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer pr-1"
                title="Seleccionar mes de la Base de Datos anual"
              >
                <option value="all" className="bg-slate-900 text-white">
                  📅 Todos los Meses (Año 2026 Completo) — ({trips.length} viajes)
                </option>
                {MONTHS_2026.map(m => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.name} 2026 ({m.shortTag}) — ({monthCounts[m.id] || 0} viajes)
                  </option>
                ))}
              </select>
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
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('viajes')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'viajes'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Planilla Detallada de Viajes ({filteredTrips.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('control-doc')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'control-doc'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Control Documental & O.C.</span>
              {pendingDocsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {pendingDocsCount} pend.
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('facturas-emitidas')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'facturas-emitidas'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Control Facturas Emitidas (Pto Vta 12)</span>
            </button>

            <button
              onClick={() => setActiveTab('choferes')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
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
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => downloadStyledColorExcel(filteredTrips, `Liquidacion_Barale_Sectores_Colores_${new Date().toISOString().slice(0, 10)}.xls`)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium cursor-pointer"
              title="Descargar Planilla Base al 100% y todas las hojas sectorizadas por color"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Descargar Excel con Colores por Sector (Todas las Hojas)</span>
            </button>
          </div>
        </div>

        {/* 5. TAB CONTENT */}
        {activeTab === 'viajes' && (
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
        )}

        {activeTab === 'control-doc' && (
          <DocumentControlReport 
            trips={filteredTrips}
            onSelectTrip={(t) => setSelectedTrip(t)}
            onUpdateTrip={handleUpdateTrip}
          />
        )}

        {activeTab === 'facturas-emitidas' && (
          <InvoicesControlReport 
            trips={filteredTrips}
            onSelectTrip={(t) => setSelectedTrip(t)}
          />
        )}

        {activeTab === 'choferes' && (
          <DriverPerformance 
            trips={filteredTrips}
            drivers={drivers}
            onSelectDriverTrips={() => {
              setActiveTab('viajes');
            }}
            onOpenNewDriver={() => setIsNewDriverOpen(true)}
            onDeleteDriver={handleDeleteDriver}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-3">
        <span>Logística & Transporte Dashboard · Control de Cargas & Liquidación de Fleteros 2026.</span>
        
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Autoguardado en localStorage activo
          </span>
          <span className="text-slate-700 hidden sm:inline">•</span>
          
          <button
            onClick={handleExportJsonBackup}
            className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer flex items-center gap-1"
          >
            <FileJson className="w-3 h-3" />
            <span>Exportar Respaldo (JSON)</span>
          </button>
          <span className="text-slate-700 hidden sm:inline">•</span>

          <button
            onClick={() => jsonFileInputRef.current?.click()}
            className="text-purple-400 hover:text-purple-300 hover:underline cursor-pointer flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            <span>Importar Respaldo</span>
          </button>
          <span className="text-slate-700 hidden sm:inline">•</span>

          <button 
            onClick={() => setIsResetConfirmOpen(true)}
            className="hover:text-rose-400 underline cursor-pointer"
          >
            Restablecer datos originales
          </button>
        </div>
      </footer>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">¿Restablecer datos originales?</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Esta acción restablecerá la planilla con los datos iniciales de agosto 2026 y limpiará los cambios guardados en localStorage.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  setTrips(INITIAL_TRIPS);
                  setIsResetConfirmOpen(false);
                  setFeedbackMessage('Datos restablecidos a la planilla original.');
                  setTimeout(() => setFeedbackMessage(null), 3500);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
              >
                Sí, restablecer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <TripDetailModal 
        trip={selectedTrip} 
        onClose={() => setSelectedTrip(null)} 
      />

      <NewTripModal
        isOpen={isNewTripOpen}
        onClose={() => setIsNewTripOpen(false)}
        onAddTrip={handleAddTrip}
        drivers={drivers}
        clients={clients}
        onAddDriver={handleAddDriver}
        onDeleteDriver={handleDeleteDriver}
        onAddClient={handleAddClient}
        onDeleteClient={handleDeleteClient}
        selectedPeriod={selectedPeriod}
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
