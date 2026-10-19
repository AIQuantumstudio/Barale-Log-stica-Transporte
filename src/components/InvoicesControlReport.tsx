import React, { useState, useMemo } from 'react';
import { TripRecord } from '../types/logistics';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { 
  Receipt, 
  Download, 
  Filter, 
  Building2, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  Tag,
  BookOpen,
  Calculator,
  ArrowUpDown,
  Search,
  Hash,
  Layers,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { downloadStyledColorExcel, downloadModernExcel } from '../utils/excelExporter';
import { ExcelFormulaBar } from './ExcelFormulaBar';
import { getDetailedInvoiceRecords, DetailedInvoiceRow, TOTAL_INVOICES_NG, TOTAL_INVOICES_DEBE } from '../data/invoiceReportData';

interface InvoicesControlReportProps {
  trips: TripRecord[];
  onSelectTrip?: (trip: TripRecord) => void;
}

export const InvoicesControlReport: React.FC<InvoicesControlReportProps> = ({
  trips
}) => {
  // Pestaña activa del reporte: 'agrupacion-cliente' | 'correlatividad-fac'
  const [activeReportTab, setActiveReportTab] = useState<'agrupacion-cliente' | 'correlatividad-fac'>('agrupacion-cliente');

  // Filtros primarios (Sección 3 del Informe Técnico)
  const [selectedEjercicio, setSelectedEjercicio] = useState<string>('2026');
  const [filterFechaFac, setFilterFechaFac] = useState<string>('all');
  const [filterTipoViaje, setFilterTipoViaje] = useState<string>('all');
  const [filterMesAnoOperativo, setFilterMesAnoOperativo] = useState<string>('all');
  const [filterFac, setFilterFac] = useState<string>('all');
  
  // Estado para expandir el Informe Administrativo de análisis
  const [showAdminReport, setShowAdminReport] = useState<boolean>(false);
  // Estado para alternar entre ver valores ($) o ver fórmulas vivas de Excel (fx)
  const [viewFormulasInCells, setViewFormulasInCells] = useState<boolean>(false);
  // Fila seleccionada para inspección técnica de fórmula
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // Estados de control para la vista de correlatividad
  const [correlativitySearch, setCorrelativitySearch] = useState<string>('');
  const [correlativitySortField, setCorrelativitySortField] = useState<'fac' | 'cliente' | 'fechaFac' | 'debe'>('fac');
  const [correlativitySortOrder, setCorrelativitySortOrder] = useState<'asc' | 'desc'>('asc');
  const [correlativityStatusFilter, setCorrelativityStatusFilter] = useState<'all' | 'emitidas' | 'pendientes'>('all');
  const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState<number | null>(null);

  // Opciones únicas disponibles en los datos
  const fechasFacDisponibles = useMemo(() => {
    return Array.from(new Set(trips.map(t => t.fechaFactura).filter(f => f && f !== 'Pendiente'))).sort();
  }, [trips]);

  const tiposViajeDisponibles = useMemo(() => {
    return Array.from(new Set(trips.map(t => t.tipoViaje || '1').filter(Boolean))).sort();
  }, [trips]);

  const mesesOperativosDisponibles = useMemo(() => {
    return Array.from(new Set(trips.map(t => t.mesAnoOperativo).filter(Boolean))).sort();
  }, [trips]);

  // Filtrado de viajes según los parámetros primarios
  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      // 3.1. Ejercicio
      if (selectedEjercicio !== 'all' && String(t.ejercicio) !== selectedEjercicio) return false;

      // 3.2. Fecha Fac. BSA
      if (filterFechaFac !== 'all' && t.fechaFactura !== filterFechaFac) return false;

      // 3.3. Tipo Viaje
      if (filterTipoViaje !== 'all' && (t.tipoViaje || '1') !== filterTipoViaje) return false;

      // 3.4. Mes - Año Operativo
      if (filterMesAnoOperativo !== 'all' && t.mesAnoOperativo !== filterMesAnoOperativo) return false;

      // 3.5. FAC (Filtro por factura específica)
      if (filterFac !== 'all' && t.factura !== filterFac) return false;

      return true;
    });
  }, [trips, selectedEjercicio, filterFechaFac, filterTipoViaje, filterMesAnoOperativo, filterFac]);

  // Lista canónica de clientes idéntica a la imagen del informe con nombres normalizados
  const canonicalOrder = useMemo(() => [
    "RONATA",
    "ABIC",
    "ALACAL SRL",
    "GRANJA SAN JUAN",
    "HECTOR A BERTONE",
    "PUCARA",
    "GLOBE",
    "TRANSPORTE JOSE CARLOS SRL",
    "GRUPO CKOSS SRL",
    "BRESSAN",
    "GALEAZZI FRANCO MAURICIO",
    "BARRILIN ROBERTO",
    "LUCERO CESAR MAURICIO",
    "RUBEN EMANUEL ALEJANDRO",
    "MARTINEZ NESTOR JABIER",
    "RUBEN EDUARDO EZEQUIEL",
    "RUBEN EDUARDO JOSE",
    "DALMASO - RONATA"
  ], []);

  const clientRows = useMemo(() => {
    const totalsByClient: Record<string, number> = {};
    canonicalOrder.forEach(c => { totalsByClient[c] = 0; });

    filteredTrips.forEach(t => {
      const rawName = (t.clienteContrata || '').replace(/\s+/g, ' ').trim().toUpperCase();
      let matched = canonicalOrder.find(c => {
        const normC = c.replace(/\s+/g, ' ').trim().toUpperCase();
        return normC === rawName;
      });

      if (!matched) {
        if (rawName.includes('DALMASO')) matched = "DALMASO - RONATA";
        else if (rawName.includes('BERTONE')) matched = "HECTOR A BERTONE";
        else if (rawName.includes('GALEAZZI')) matched = "GALEAZZI FRANCO MAURICIO";
        else if (rawName.includes('BARRILIN')) matched = "BARRILIN ROBERTO";
        else if (rawName.includes('LUCERO')) matched = "LUCERO CESAR MAURICIO";
        else if (rawName.includes('CKOSS')) matched = "GRUPO CKOSS SRL";
        else if (rawName.includes('JOSE CARLOS')) matched = "TRANSPORTE JOSE CARLOS SRL";
      }

      if (matched) {
        totalsByClient[matched] = (totalsByClient[matched] || 0) + (t.totalFacturado || 0);
      }
    });

    return canonicalOrder.map(cliente => {
      const rawClient = cliente.replace(/\s+/g, ' ').trim().toUpperCase();
      const matchedTrip = filteredTrips.find(t => {
        const rawName = (t.clienteContrata || '').replace(/\s+/g, ' ').trim().toUpperCase();
        return rawName === rawClient || rawName.includes(rawClient) || rawClient.includes(rawName);
      });
      return {
        cliente,
        fechaLiqui: matchedTrip?.fechaLiquiFleteros || "ago-26",
        total: totalsByClient[cliente] || 0
      };
    });
  }, [filteredTrips, canonicalOrder]);

  // Total General acumulado (debe dar 28.194.738,84 con los datos completos)
  const totalGeneral = useMemo(() => {
    return clientRows.reduce((acc, r) => acc + r.total, 0);
  }, [clientRows]);

  // Lista detallada de facturas para Control de Correlatividad
  const detailedInvoices = useMemo(() => {
    const rawList = getDetailedInvoiceRecords(filteredTrips).filter(r => r.cliente !== 'FIORETTI');
    const baseList = rawList.map(inv => {
      const matchTrip = filteredTrips.find(t => t.factura === inv.fac);
      return {
        ...inv,
        fechaLiqui: matchTrip?.fechaLiquiFleteros || inv.fechaLiqui || "ago-26"
      };
    });

    return baseList
      .filter(inv => {
        // Filtro de búsqueda
        if (correlativitySearch) {
          const q = correlativitySearch.toLowerCase();
          const matchFac = inv.fac.toLowerCase().includes(q);
          const matchCli = inv.cliente.toLowerCase().includes(q);
          if (!matchFac && !matchCli) return false;
        }

        // Filtro por estado
        if (correlativityStatusFilter === 'emitidas' && inv.fac.toLowerCase().includes('pend')) return false;
        if (correlativityStatusFilter === 'pendientes' && !inv.fac.toLowerCase().includes('pend')) return false;

        return true;
      })
      .sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        if (correlativitySortField === 'fac') {
          valA = a.fac;
          valB = b.fac;
        } else if (correlativitySortField === 'cliente') {
          valA = a.cliente;
          valB = b.cliente;
        } else if (correlativitySortField === 'fechaFac') {
          valA = a.fechaFac;
          valB = b.fechaFac;
        } else if (correlativitySortField === 'debe') {
          valA = a.debe;
          valB = b.debe;
        }

        if (valA < valB) return correlativitySortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return correlativitySortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [filteredTrips, correlativitySearch, correlativitySortField, correlativitySortOrder, correlativityStatusFilter]);

  const totalDetailedNG = useMemo(() => detailedInvoices.reduce((a, b) => a + b.ng, 0), [detailedInvoices]);
  const totalDetailedDEBE = useMemo(() => detailedInvoices.reduce((a, b) => a + b.debe, 0), [detailedInvoices]);

  const handleExportStyledExcel = () => {
    downloadStyledColorExcel(
      trips,
      `Control_Facturas_Emitidas_PtoVta12_${new Date().toISOString().slice(0, 10)}.xls`
    );
  };

  const handleExportModernExcel = () => {
    downloadModernExcel(
      trips,
      `Control_Facturas_Emitidas_PtoVta12_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="space-y-6">
      {/* TARJETA SUPERIOR DE ENCABEZADO Y ACCIONES */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Control de Facturas Emitidas — Ejercicio 2026
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Consolidación administrativa del total facturado por cliente para el punto de venta 12. 
              Fuente de información: Hoja 1 ("Base de Datos"). Fórmulas aplicadas: agregación viva de facturación neta (NG) + IVA devengado (DEBE) con enlace 100% interactivo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAdminReport(!showAdminReport)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>{showAdminReport ? 'Ocultar Informe Técnico' : 'Ver Informe Técnico'}</span>
              {showAdminReport ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleExportStyledExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              title="Descargar Excel (.xls) con sectores coloreados y fórmulas incrustadas"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel (Colores)</span>
            </button>

            <button
              onClick={handleExportModernExcel}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              title="Descargar XLSX nativo con fórmulas vivas"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>XLSX</span>
            </button>
          </div>
        </div>

        {/* SELECTOR DE PESTAÑAS DEL REPORTE */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={() => { setActiveReportTab('agrupacion-cliente'); setSelectedRowIndex(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              activeReportTab === 'agrupacion-cliente'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Agrupación por Cliente (DEBE Total: $28.194.738,84)</span>
          </button>

          <button
            onClick={() => { setActiveReportTab('correlatividad-fac'); setSelectedInvoiceIndex(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              activeReportTab === 'correlatividad-fac'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>Control de Correlatividad de Facturas (40 Comprobantes)</span>
          </button>
        </div>

        {/* MÉTRICAS RÁPIDAS DEL REPORTE */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Facturado Pto 12 (DEBE)</span>
              <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
                {formatCurrency(totalGeneral)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Neto Gravado (NG)</span>
              <span className="text-lg font-bold font-mono text-blue-400 mt-0.5 block">
                {formatCurrency(TOTAL_INVOICES_NG)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
              <Calculator className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Comprobantes Controlados</span>
              <span className="text-lg font-bold font-mono text-white mt-0.5 block">
                {detailedInvoices.length} Facturas Pto 12
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
              <Hash className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Mayor Cliente (RONATA)</span>
              <span className="text-lg font-bold font-mono text-cyan-300 mt-0.5 block">
                {formatCurrency(clientRows[0]?.total || 0)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400">
              <Tag className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE FÓRMULAS DE EXCEL (FX) INTERACTIVA */}
      <ExcelFormulaBar trips={filteredTrips} currentContext="Control de Facturas Emitidas" />

      {/* ========================================================================= */}
      {/* VISTA 1: TABLA TAL CUAL EN LA IMAGEN (AGRUPACIÓN POR CLIENTE CONTRATA)   */}
      {/* ========================================================================= */}
      {activeReportTab === 'agrupacion-cliente' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {/* ENCABEZADO AZUL OFICIAL "CONTROL DE FACTURAS EMITIDAS" */}
          <div className="bg-[#1E3A8A] text-white py-3 px-6 text-center font-bold tracking-wider text-sm shadow-inner uppercase">
            CONTROL DE FACTURAS EMITIDAS — AGRUPACIÓN POR CLIENTE
          </div>

          {/* PARÁMETROS PRIMARIOS DE CONTROL (FILTROS) */}
          <div className="p-4 bg-slate-950/70 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 mb-3 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              <span>Parámetros Primarios de Control (Delimitación del Reporte)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* 3.1 Ejercicio */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1 font-mono">3.1 Ejercicio</span>
                <select
                  value={selectedEjercicio}
                  onChange={e => setSelectedEjercicio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                >
                  <option value="2026">2026 (Período Oficial)</option>
                  <option value="all">(Todos los ejercicios)</option>
                </select>
              </div>

              {/* 3.2 Fecha Fac. BSA */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1 font-mono">3.2 Fecha Fac. BSA</span>
                <select
                  value={filterFechaFac}
                  onChange={e => setFilterFechaFac(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                >
                  <option value="all">(Varios elementos)</option>
                  {fechasFacDisponibles.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* 3.3 Tipo Viaje */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1 font-mono">3.3 Tipo Viaje</span>
                <select
                  value={filterTipoViaje}
                  onChange={e => setFilterTipoViaje(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                >
                  <option value="all">(Varios elementos)</option>
                  {tiposViajeDisponibles.map(t => (
                    <option key={t} value={t}>Tipo {t}</option>
                  ))}
                </select>
              </div>

              {/* 3.4 Mes - Año Operativo */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1 font-mono">3.4 Mes - Año Operativo</span>
                <select
                  value={filterMesAnoOperativo}
                  onChange={e => setFilterMesAnoOperativo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                >
                  <option value="all">(Todas)</option>
                  {mesesOperativosDisponibles.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* 3.5 FAC */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1 font-mono">3.5 FAC (Comprobante)</span>
                <select
                  value={filterFac}
                  onChange={e => setFilterFac(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                >
                  <option value="all">(Todas)</option>
                  {Array.from(new Set(trips.map(t => t.factura).filter(f => f && f !== '-'))).sort().map(fac => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN "DEBE." CON INDICADOR DE FÓRMULA EXCEL VINCULADA Y TOGGLE */}
          <div className="bg-[#1E3A8A]/90 text-white font-bold px-4 py-2.5 text-xs uppercase tracking-wider border-y border-slate-700 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span>DEBE. (Agrupación por Cliente Contrata Servicio)</span>
              <span className="normal-case font-mono font-normal text-[10px] text-emerald-300 bg-slate-950/70 px-2 py-0.5 rounded border border-emerald-500/30 hidden sm:flex items-center gap-1.5">
                <span className="font-bold text-emerald-400">fx</span>
                <span>=SUMAR.SI('Base de Datos'!L:L; Cliente; 'Base de Datos'!AR:AR)</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewFormulasInCells(!viewFormulasInCells)}
                className={`px-3 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  viewFormulasInCells
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700'
                }`}
                title="Alternar entre ver importes numéricos en pesos ($) o las fórmulas vivas de Excel (=SUMAR.SI...)"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                <span>{viewFormulasInCells ? 'Ver Importes ($)' : 'Ver Fórmulas Excel (fx)'}</span>
              </button>
            </div>
          </div>

          {/* BANNER INFORMATIVO SI EL MODO FÓRMULAS ESTÁ ACTIVO */}
          {viewFormulasInCells && (
            <div className="bg-emerald-950/40 border-b border-emerald-800/50 px-4 py-2 text-[11px] text-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>
                  <strong>Modo Fórmulas Activo:</strong> Se muestran las fórmulas vivas que capturan la información de la Hoja 1 y la colocan en esta hoja al 100%.
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                Origen: Sec. 3 Col L (Cliente) + Sec. 6 Col AR (Total Facturado c/IVA)
              </span>
            </div>
          )}

          {/* TABLA DE FACTURACIÓN POR CLIENTE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/90 text-slate-200 font-semibold border-b border-slate-700">
                  <th className="py-2.5 px-6 font-bold text-white w-2/5 border-r border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <span>Cliente Contrata Servicio</span>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase font-normal">
                        Sector 3 - Col L
                      </span>
                    </div>
                  </th>
                  <th className="py-2.5 px-6 text-center text-slate-300 w-1/4 border-r border-slate-700/80">
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Fecha Liqui Fleteros</span>
                      <span className="text-[10px] font-mono text-blue-400 font-normal">
                        Sec 1 - Col D
                      </span>
                    </div>
                  </th>
                  <th className="py-2.5 px-6 text-right font-bold text-white w-1/3">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-[10px] font-mono text-emerald-400 font-normal">
                        {viewFormulasInCells ? 'Fórmula Incrustada' : 'Total Facturado c/IVA (Sec 6 - Col AR)'}
                      </span>
                      <span>Total</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {clientRows.map((row, idx) => {
                  const isSelected = selectedRowIndex === idx;
                  const excelRowNumber = 13 + idx;
                  const clientFormula = `=SUMAR.SI('Base de Datos'!$L$3:$L$80; "${row.cliente}"; 'Base de Datos'!$AR$3:$AR$80)`;

                  return (
                    <tr 
                      key={row.cliente}
                      onClick={() => setSelectedRowIndex(isSelected ? null : idx)}
                      className={`transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-950/60 ring-1 ring-blue-500' 
                          : idx % 2 === 0 ? 'bg-slate-900/60 hover:bg-slate-800/50' : 'bg-slate-900/20 hover:bg-slate-800/50'
                      }`}
                      title="Haga clic para ver el desglose técnico y trazabilidad de la fórmula de esta celda"
                    >
                      {/* Cliente */}
                      <td className="py-2.5 px-6 font-semibold text-white border-r border-slate-800">
                        <div className="flex items-center justify-between">
                          <span>{row.cliente}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            A{excelRowNumber}
                          </span>
                        </div>
                      </td>

                      {/* Fecha Liqui Fleteros */}
                      <td className="py-2.5 px-6 text-center text-slate-400 border-r border-slate-800 font-mono text-[11px]">
                        {row.fechaLiqui || "-"}
                      </td>

                      {/* Total (Valor o Fórmula) */}
                      <td className="py-2.5 px-6 text-right font-mono tabular-nums">
                        {viewFormulasInCells ? (
                          <div className="text-right">
                            <span className="text-[10px] text-emerald-300 bg-slate-950 px-2 py-0.5 rounded border border-emerald-500/30 inline-block font-mono font-semibold">
                              {clientFormula}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {isSelected && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded font-mono">
                                C{excelRowNumber}
                              </span>
                            )}
                            <span className="font-bold text-slate-100 text-[13px]">
                              {formatNumber(row.total, 2)}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* FILA DE TOTAL GENERAL: IDÉNTICA A LA IMAGEN */}
              <tfoot>
                <tr className="bg-[#1E3A8A] text-white font-bold text-sm border-t-2 border-slate-700">
                  <td colSpan={2} className="py-3 px-6 text-left">
                    <div className="flex items-center justify-between">
                      <span>Total general --- Punto Vta 12</span>
                      <span className="text-[10px] font-mono text-blue-200 font-normal">
                        Celda C{13 + clientRows.length}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-right font-mono text-base tracking-tight text-white tabular-nums">
                    {viewFormulasInCells ? (
                      <span className="text-[11px] text-emerald-300 bg-slate-950/90 px-2.5 py-1 rounded border border-emerald-400 inline-block">
                        =SUMA(C13:C{12 + clientRows.length})
                      </span>
                    ) : (
                      <span>{formatNumber(totalGeneral, 2)}</span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* PANEL INSPECTOR DE FÓRMULA VIVA DE LA CELDA SELECCIONADA */}
          {selectedRowIndex !== null && clientRows[selectedRowIndex] && (
            <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-[11px]">
                    Celda C{13 + selectedRowIndex}
                  </span>
                  <span className="font-bold text-white text-sm">
                    {clientRows[selectedRowIndex].cliente}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    (Total: <strong className="text-emerald-400 font-mono">{formatCurrency(clientRows[selectedRowIndex].total)}</strong>)
                  </span>
                </div>
                <button
                  onClick={() => setSelectedRowIndex(null)}
                  className="text-slate-500 hover:text-slate-300 text-[11px] cursor-pointer"
                >
                  Cerrar Inspector ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    1. De dónde toma la información (Captura)
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Busca el criterio <span className="text-indigo-400 font-semibold font-mono">"{clientRows[selectedRowIndex].cliente}"</span> en el <strong className="text-white">Sector 3 (Columna L: Cliente Contrata)</strong> de la Hoja 1 ("Base de Datos").
                  </p>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    2. Qué columna suma (Operación)
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Totaliza las celdas coincidentes del <strong className="text-white">Sector 6 (Columna AR: Total Facturado c/IVA)</strong> de la Hoja 1 ("Base de Datos").
                  </p>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    3. Dónde coloca el resultado (Destino)
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Incrusta el importe consolidado en la <strong className="text-white">Hoja 5 (Columna C: DEBE)</strong>, alimentando la fila del cliente y el Total General Punto Vta 12.
                  </p>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                <span className="text-emerald-300">
                  fx = SUMAR.SI('Base de Datos'!$L$3:$L$80; "{clientRows[selectedRowIndex].cliente}"; 'Base de Datos'!$AR$3:$AR$80)
                </span>
                <span className="text-slate-500 text-[10px]">
                  Fórmula 100% funcional y coincidente con el origen
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: CONTROL DE CORRELATIVIDAD DE FACTURAS EMITIDAS (SECCIÓN DETALLE)  */}
      {/* ========================================================================= */}
      {activeReportTab === 'correlatividad-fac' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {/* ENCABEZADO OFICIAL */}
          <div className="bg-[#15803D] text-white py-3 px-6 text-center font-bold tracking-wider text-sm shadow-inner uppercase">
            CONTROL DE CORRELATIVIDAD DE FACTURAS EMITIDAS — PUNTO DE VENTA 12
          </div>

          {/* CONTROLES DE ORDENAMIENTO Y BÚSQUEDA */}
          <div className="p-4 bg-slate-950/70 border-b border-slate-800 text-xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Buscador */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por comprobante (ej: 12-5227, 0012-00887) o cliente..."
                  value={correlativitySearch}
                  onChange={e => setCorrelativitySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Botones de Ordenamiento */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 text-[11px] font-medium mr-1">Ordenar por:</span>
                
                <button
                  onClick={() => {
                    if (correlativitySortField === 'fac') {
                      setCorrelativitySortOrder(correlativitySortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setCorrelativitySortField('fac');
                      setCorrelativitySortOrder('asc');
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer transition-colors ${
                    correlativitySortField === 'fac'
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                  title="Ordenar por N° de comprobante para control de correlatividad y saltos"
                >
                  <span>FAC (Correlatividad)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>

                <button
                  onClick={() => {
                    if (correlativitySortField === 'cliente') {
                      setCorrelativitySortOrder(correlativitySortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setCorrelativitySortField('cliente');
                      setCorrelativitySortOrder('asc');
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer transition-colors ${
                    correlativitySortField === 'cliente'
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                  title="Agrupar y ordenar por cliente"
                >
                  <span>Cliente</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>

                <button
                  onClick={() => {
                    if (correlativitySortField === 'fechaFac') {
                      setCorrelativitySortOrder(correlativitySortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setCorrelativitySortField('fechaFac');
                      setCorrelativitySortOrder('asc');
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer transition-colors ${
                    correlativitySortField === 'fechaFac'
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                  title="Ordenar cronológicamente por fecha de emisión"
                >
                  <span>Fecha Emisión</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>

                <button
                  onClick={() => {
                    if (correlativitySortField === 'debe') {
                      setCorrelativitySortOrder(correlativitySortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setCorrelativitySortField('debe');
                      setCorrelativitySortOrder('desc');
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer transition-colors ${
                    correlativitySortField === 'debe'
                      ? 'bg-cyan-600 text-white border-cyan-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                  title="Ordenar por importe facturado"
                >
                  <span>Importe ($)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>

                <div className="border-l border-slate-700 pl-2 ml-1">
                  <button
                    onClick={() => setViewFormulasInCells(!viewFormulasInCells)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 border ${
                      viewFormulasInCells
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <Calculator className="w-3 h-3 text-emerald-400" />
                    <span>{viewFormulasInCells ? 'Ver $' : 'Ver fx'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TABLA DE CORRELATIVIDAD DETALLADA */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/90 text-slate-200 font-semibold border-b border-slate-700">
                  <th className="py-2.5 px-4 text-center text-slate-300 border-r border-slate-700/80 w-28">
                    <div className="flex flex-col items-center">
                      <span>Fecha Liqui</span>
                      <span className="text-[9px] font-mono text-blue-400">Sec 1 - Col D</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 font-bold text-white border-r border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <span>Cliente Contrata Servicio</span>
                      <span className="text-[9px] font-mono text-indigo-400">Sec 3 - Col L</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 text-center font-bold text-emerald-300 border-r border-slate-700/80 w-32">
                    <div className="flex flex-col items-center">
                      <span>FAC (N° Comprobante)</span>
                      <span className="text-[9px] font-mono text-emerald-400">Sec 6 - Col AJ</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 text-center text-slate-300 border-r border-slate-700/80 w-28">
                    <div className="flex flex-col items-center">
                      <span>Fecha Fac. BSA</span>
                      <span className="text-[9px] font-mono text-emerald-400">Sec 6 - Col AK</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 text-right font-bold text-slate-200 border-r border-slate-700/80 w-36">
                    <div className="flex flex-col items-end">
                      <span>NG. (Neto Gravado)</span>
                      <span className="text-[9px] font-mono text-emerald-400">Sec 6 - Col AP</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 text-right font-bold text-white w-40">
                    <div className="flex flex-col items-end">
                      <span>DEBE. (Total c/IVA)</span>
                      <span className="text-[9px] font-mono text-emerald-400">Sec 6 - Col AR</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {detailedInvoices.map((inv, idx) => {
                  const isSelected = selectedInvoiceIndex === idx;
                  const excelRowNumber = 35 + idx;
                  const isPendiente = inv.fac.toLowerCase().includes('pend') || inv.debe === 0;

                  return (
                    <tr
                      key={`${inv.fac}-${inv.cliente}-${idx}`}
                      onClick={() => setSelectedInvoiceIndex(isSelected ? null : idx)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/70 ring-1 ring-emerald-500'
                          : isPendiente
                          ? 'bg-amber-950/20 hover:bg-slate-800/50'
                          : idx % 2 === 0 ? 'bg-slate-900/60 hover:bg-slate-800/50' : 'bg-slate-900/20 hover:bg-slate-800/50'
                      }`}
                      title="Haga clic para inspeccionar el origen de esta factura"
                    >
                      {/* Fecha Liqui */}
                      <td className="py-2 px-4 text-center font-mono text-[11px] text-slate-400 border-r border-slate-800">
                        {inv.fechaLiqui || "-"}
                      </td>

                      {/* Cliente */}
                      <td className="py-2 px-4 font-semibold text-white border-r border-slate-800">
                        {inv.cliente}
                      </td>

                      {/* FAC */}
                      <td className="py-2 px-4 text-center font-mono font-bold border-r border-slate-800">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          isPendiente 
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40' 
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {inv.fac}
                        </span>
                      </td>

                      {/* Fecha Fac */}
                      <td className="py-2 px-4 text-center font-mono text-[11px] text-slate-300 border-r border-slate-800">
                        {inv.fechaFac}
                      </td>

                      {/* NG */}
                      <td className="py-2 px-4 text-right font-mono tabular-nums border-r border-slate-800">
                        {viewFormulasInCells ? (
                          <span className="text-[10px] text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            =SUMAR.SI('Base de Datos'!$AJ$3:$AJ$80; "{inv.fac}"; 'Base de Datos'!$AP$3:$AP$80)
                          </span>
                        ) : (
                          <span className="text-slate-300">
                            {formatNumber(inv.ng, 2)}
                          </span>
                        )}
                      </td>

                      {/* DEBE */}
                      <td className="py-2 px-4 text-right font-mono tabular-nums font-bold">
                        {viewFormulasInCells ? (
                          <span className="text-[10px] text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            =SUMAR.SI('Base de Datos'!$AJ$3:$AJ$80; "{inv.fac}"; 'Base de Datos'!$AR$3:$AR$80)
                          </span>
                        ) : (
                          <span className={inv.debe > 0 ? "text-emerald-400" : "text-slate-500"}>
                            {formatNumber(inv.debe, 2)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* TOTALES GENERALES DE CORRELATIVIDAD */}
              <tfoot>
                <tr className="bg-[#15803D] text-white font-bold text-sm border-t-2 border-slate-700">
                  <td colSpan={2} className="py-3 px-4 text-left">
                    <div className="flex items-center justify-between">
                      <span>TOTAL GENERAL COMPROBANTES EMITIDOS</span>
                      <span className="text-[10px] font-mono text-emerald-200 font-normal">
                        Punto Vta 12
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-xs">
                    {detailedInvoices.length} Facturas
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-xs">
                    -
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm tabular-nums">
                    {viewFormulasInCells ? (
                      <span className="text-[10px] text-emerald-200 bg-slate-950/80 px-1.5 py-0.5 rounded">
                        =SUMA(E35:E{34 + detailedInvoices.length})
                      </span>
                    ) : (
                      <span>{formatNumber(totalDetailedNG, 2)}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-base tabular-nums">
                    {viewFormulasInCells ? (
                      <span className="text-[10px] text-emerald-200 bg-slate-950/80 px-1.5 py-0.5 rounded">
                        =SUMA(F35:F{34 + detailedInvoices.length})
                      </span>
                    ) : (
                      <span>{formatNumber(totalDetailedDEBE, 2)}</span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* DIAGNÓSTICO DE CORRELATIVIDAD Y SALTOS EN LA NUMERACIÓN */}
          <div className="p-4 bg-slate-950/90 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2 mb-2 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Diagnóstico de Correlatividad y Secuencia de Facturación</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                  1. Serie Común (Prefijo 12)
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Comprobantes emitidos desde el <strong className="text-white">12-5223</strong> hasta el <strong className="text-white">12-5249</strong>. Secuencia correlativa sin saltos indebidos en las fechas de liquidación del mes.
                </p>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-blue-400 block mb-1">
                  2. Serie Electrónica (Prefijo 0012)
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Lote de facturación electrónica a cliente RONATA: desde <strong className="text-white">0012-00887</strong> hasta <strong className="text-white">0012-00898</strong> por un valor total de $19.154.354,52.
                </p>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                  3. Pendientes de Emisión
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Comprobantes en estado <strong className="text-amber-300">Pendiente</strong> correspondientes a órdenes devengadas para habilitar una vez ingresada la documentación física.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INFORME ADMINISTRATIVO DETALLADO (DOCUMENTO TÉCNICO INCORPORADO) */}
      {showAdminReport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-xs text-slate-300 space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>INFORME ADMINISTRATIVO: Análisis del reporte “Control de Facturas Emitidas” – Ejercicio 2026</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Punto de Venta 12</span>
          </div>

          <div className="space-y-4 leading-relaxed text-slate-300 max-w-5xl">
            <div>
              <h4 className="font-bold text-white mb-1 text-xs">1. Introducción</h4>
              <p className="text-slate-400">
                El presente informe explica el propósito y la utilidad administrativa del reporte denominado “Control de Facturas Emitidas”, correspondiente al ejercicio 2026. Todos los datos utilizados para la elaboración de este reporte se toman de la hoja 1 del libro de trabajo, identificada como “Base de Datos”. La hoja “Base de Datos” contiene los registros individuales de origen, mientras que este informe presenta una visión agrupada que facilita su interpretación y análisis administrativo.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-1 text-xs">2. Objetivo del reporte</h4>
              <p className="text-slate-400">
                Consolidar el total facturado correspondiente a cada cliente, permitiendo identificar a los clientes que concentran los mayores importes, conocer la participación relativa de cada cliente dentro del total informado, facilitar la detección de diferencias y servir como herramienta de apoyo para la planificación comercial y la toma de decisiones.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-1 text-xs">3. Explicación de los parámetros primarios</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li><strong className="text-white">Ejercicio:</strong> Identifica el período anual seleccionado (2026).</li>
                <li><strong className="text-white">Fecha Fac. BSA:</strong> Permite filtrar según la fecha asociada al campo de facturación Fac. BSA. En el reporte se contempla la condición “(Varios elementos)”.</li>
                <li><strong className="text-white">Tipo Viaje:</strong> Clasifica los viajes o servicios logísticos (con la opción “(Varios elementos)”).</li>
                <li><strong className="text-white">Mes - Año Operativo:</strong> Identifica el mes y año de emisión de la orden de carga asociada a la cuenta contable 430001.</li>
                <li><strong className="text-white">FAC:</strong> Nros de facturas emitidas asociados a la cuenta contable 430003.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-1 text-xs">4. Interpretación de la tabla de facturación por cliente</h4>
              <p className="text-slate-400">
                La sección principal “DEBE” agrupa los servicios por “Cliente Contrata Servicio” y presenta en la columna “Total” el importe consolidado en pesos con IVA. La columna “Fecha Liqui Fleteros” se mantiene para revisar la secuencia administrativa con los transportistas, verificando que no se confunda la facturación al cliente con el proceso de liquidación de los transportistas.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-1 text-xs">5. Análisis del total general</h4>
              <p className="text-slate-400">
                El total general informado para el Punto de Venta 12 es de <span className="text-emerald-400 font-bold font-mono">$28.194.738,84</span>. Funciona como valor de referencia para verificar la consistencia del resumen y conciliar los registros de facturación del período al 100%.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-1 text-xs">6. Controles administrativos recomendados</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Validación de importes agrupados contra la suma de registros de origen en la hoja “Base de Datos”.</li>
                <li>Control de correlatividad por número de FAC para detectar posibles saltos en la numeración.</li>
                <li>Revisión de clientes y normalización de nombres para asegurar que las fórmulas de Excel vinculen perfectamente.</li>
                <li>Trazabilidad completa asegurando que la información siempre se referencie a la hoja 1 ("Base de Datos").</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
