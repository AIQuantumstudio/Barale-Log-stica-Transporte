import React, { useState, useMemo } from 'react';
import { TripRecord } from '../types/logistics';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import { 
  Search, 
  ArrowUpDown, 
  FileSpreadsheet, 
  Download,
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Plus,
  Layers,
  Columns,
  Calculator
} from 'lucide-react';
import { downloadModernExcel, downloadStyledColorExcel, SECTORS } from '../utils/excelExporter';
import { ExcelFormulaBar } from './ExcelFormulaBar';

interface TripsTableProps {
  trips: TripRecord[];
  onSelectTrip: (trip: TripRecord) => void;
  selectedTransportFilter: string;
  onChangeTransportFilter: (val: string) => void;
  selectedStatusFilter: string;
  onChangeStatusFilter: (val: string) => void;
  selectedProductFilter: string;
  onChangeProductFilter: (val: string) => void;
  onOpenNewTrip?: () => void;
}

type SortField = 'fechaCarga' | 'chofer' | 'clienteContrata' | 'localidadDestino' | 'kgsCargados' | 'netoGravado' | 'costoFletero' | 'margenPesos';

export const TripsTable: React.FC<TripsTableProps> = ({
  trips,
  onSelectTrip,
  selectedTransportFilter,
  onChangeTransportFilter,
  selectedStatusFilter,
  onChangeStatusFilter,
  selectedProductFilter,
  onChangeProductFilter,
  onOpenNewTrip
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('fechaCarga');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'standard' | 'all10sectors'>('standard');
  const [showFormulasInTable, setShowFormulasInTable] = useState<boolean>(false);
  const itemsPerPage = 10;

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const matchesSearch = 
        trip.chofer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.transporte.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.clienteContrata.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.localidadDestino.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.remitoRemitente.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTransport = 
        selectedTransportFilter === 'all' || 
        trip.tipoTransporte === selectedTransportFilter;

      const matchesStatus = 
        selectedStatusFilter === 'all' || 
        trip.estadoFacturacion === selectedStatusFilter;

      const matchesProduct = 
        selectedProductFilter === 'all' || 
        trip.tipoProducto === selectedProductFilter;

      return matchesSearch && matchesTransport && matchesStatus && matchesProduct;
    });
  }, [trips, searchTerm, selectedTransportFilter, selectedStatusFilter, selectedProductFilter]);

  // Sorted trips
  const sortedTrips = useMemo(() => {
    return [...filteredTrips].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTrips, sortField, sortDirection]);

  // Paginated trips
  const totalPages = Math.ceil(sortedTrips.length / itemsPerPage) || 1;
  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTrips.slice(start, start + itemsPerPage);
  }, [sortedTrips, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Sector Header with Actions */}
      <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por chofer, cliente, destino, remito o factura..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Right: Sector Add, View Toggle & Excel Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add Trip in this sector */}
          {onOpenNewTrip && (
            <button
              onClick={onOpenNewTrip}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nuevo Viaje</span>
            </button>
          )}

          {/* Toggle between standard and 10 sectors view */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('standard')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${viewMode === 'standard' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
              title="Vista condensada principal"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vista Operativa</span>
            </button>
            <button
              onClick={() => setViewMode('all10sectors')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${viewMode === 'all10sectors' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
              title="Ver los 10 sectores completos como en el Excel"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ver 10 Sectores</span>
            </button>
          </div>

          {/* Transport Filter */}
          <select
            value={selectedTransportFilter}
            onChange={(e) => {
              onChangeTransportFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Flota: Todos</option>
            <option value="Propio">Solo Propio</option>
            <option value="Fletero">Solo Fletero</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => {
              onChangeStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Estado: Todos</option>
            <option value="Facturado">Facturados</option>
            <option value="Pendiente">Pendientes</option>
          </select>

          {/* DESCARGA EXCEL .XLSX CENTRAL MULTI-HOJA */}
          <button
            onClick={() => downloadModernExcel(sortedTrips, `Liquidacion_Central_Barale_${new Date().toISOString().slice(0, 10)}.xlsx`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            title="Descargar Libro Completo Central XLSX con todas las hojas (Viajes 10 Sectores, Control Doc Pendiente, Choferes, Clientes)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            <span>Excel Central (Multi-Hoja)</span>
          </button>

          {/* DESCARGA EXCEL COLOREADO HTML */}
          <button
            onClick={() => downloadStyledColorExcel(sortedTrips, `Liquidacion_Barale_10_Sectores_${new Date().toISOString().slice(0, 10)}.xls`)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Descargar versión HTML con colores de sector (.xls)"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Colores (.xls)</span>
          </button>

          {/* MODO FÓRMULAS VIVAS EN TABLA */}
          <button
            onClick={() => setShowFormulasInTable(!showFormulasInTable)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
              showFormulasInTable
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Alternar entre ver importes numéricos ($) o las fórmulas vivas de Excel incrustadas en las celdas"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showFormulasInTable ? 'Ver Valores ($)' : 'Modo Fórmulas (fx)'}</span>
          </button>
        </div>
      </div>

      {/* BARRA DE FÓRMULAS DE EXCEL (FX) INTERACTIVA */}
      <div className="p-3 bg-slate-950/70 border-b border-slate-800">
        <ExcelFormulaBar trips={filteredTrips} currentContext="Base de Datos" />
      </div>

      {/* Leyenda de los 10 Sectores (Idéntica a la imagen) */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto text-[11px] flex items-center gap-2 font-medium">
        <span className="text-slate-500 uppercase text-[10px] tracking-wider shrink-0">Sectores:</span>
        {SECTORS.map((sec) => (
          <span 
            key={sec.name} 
            className="px-2 py-0.5 rounded text-white whitespace-nowrap shrink-0 text-[10px] shadow-xs"
            style={{ backgroundColor: sec.color }}
          >
            {sec.name}
          </span>
        ))}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        {viewMode === 'standard' ? (
          // Vista Estándar (Optimizada para pantalla)
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">
                  <button onClick={() => handleSort('fechaCarga')} className="flex items-center gap-1 hover:text-white cursor-pointer">
                    <span>Fecha</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button onClick={() => handleSort('chofer')} className="flex items-center gap-1 hover:text-white cursor-pointer">
                    <span>Chofer / Transporte</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button onClick={() => handleSort('clienteContrata')} className="flex items-center gap-1 hover:text-white cursor-pointer">
                    <span>Cliente</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button onClick={() => handleSort('localidadDestino')} className="flex items-center gap-1 hover:text-white cursor-pointer">
                    <span>Origen → Destino</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4 text-right">
                  <button onClick={() => handleSort('kgsCargados')} className="flex items-center gap-1 hover:text-white cursor-pointer ml-auto">
                    <span>Tn</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">
                  <button onClick={() => handleSort('netoGravado')} className="flex items-center gap-1 hover:text-white cursor-pointer ml-auto">
                    <span>Facturado (NG)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">
                  <button onClick={() => handleSort('costoFletero')} className="flex items-center gap-1 hover:text-white cursor-pointer ml-auto">
                    <span>Costo Fletero</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">
                  <button onClick={() => handleSort('margenPesos')} className="flex items-center gap-1 hover:text-white cursor-pointer ml-auto">
                    <span>Margen</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {paginatedTrips.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No se encontraron viajes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedTrips.map((trip) => {
                  const isPropio = trip.tipoTransporte === 'Propio';
                  const isPendiente = trip.estadoFacturacion === 'Pendiente';

                  return (
                    <tr 
                      key={trip.id} 
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectTrip(trip)}
                    >
                      <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap text-slate-400">
                        {trip.fechaCarga || trip.fechaOrdenCarga}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-white flex items-center gap-2">
                          <span>{trip.chofer}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                            isPropio ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'
                          }`}>
                            {trip.tipoTransporte}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {trip.transporte}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-[140px] truncate">
                        <span className="font-medium text-slate-200">{trip.clienteContrata}</span>
                        {trip.remitoRemitente && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            Rto: {trip.remitoRemitente}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-[160px] truncate">
                        <span className="text-slate-300">{trip.origen}</span>
                        <span className="text-slate-500 mx-1">→</span>
                        <span className="text-white font-medium">{trip.localidadDestino}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-300 font-medium">{trip.producto}</span>
                        <div className="text-[11px] text-slate-500">{trip.tipoProducto}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-200">
                        {formatNumber(trip.kgsCargados, 2)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {isPendiente ? (
                          <span className="text-amber-400/80 font-medium italic">Pendiente</span>
                        ) : (
                          <span className="text-white font-medium">{formatCurrency(trip.netoGravado)}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {trip.costoFletero > 0 ? (
                          <span className="text-amber-400 font-medium">-{formatCurrency(trip.costoFletero)}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {trip.margenPesos > 0 ? (
                          <span className="text-emerald-400 font-semibold">{formatCurrency(trip.margenPesos)}</span>
                        ) : trip.margenPesos < 0 ? (
                          <span className="text-rose-400 font-semibold">{formatCurrency(trip.margenPesos)}</span>
                        ) : (
                          <span className="text-slate-600">$0</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          isPendiente 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {trip.estadoFacturacion}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTrip(trip);
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Ver Ficha Completa del Viaje"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          // Vista Completa 10 Sectores (Idéntica a la Imagen del Excel)
          <table className="w-full text-left border-collapse text-[11px] whitespace-nowrap">
            <thead>
              {/* Fila 1: Banners de los 10 sectores */}
              <tr>
                {SECTORS.map(sec => (
                  <th 
                    key={sec.name} 
                    colSpan={sec.columns.length} 
                    className="py-2 px-3 text-center font-bold text-white uppercase tracking-wider text-[11px] border border-slate-900"
                    style={{ backgroundColor: sec.color }}
                  >
                    {sec.name}
                  </th>
                ))}
              </tr>
              {/* Fila 2: Columnas de cada sector */}
              <tr className="bg-slate-800 text-slate-300 font-semibold uppercase text-[10px]">
                {SECTORS.map(sec => (
                  sec.columns.map(col => (
                    <th key={col} className="py-2.5 px-3 border border-slate-700/60">
                      {col}
                    </th>
                  ))
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {paginatedTrips.map(t => (
                <tr 
                  key={t.id} 
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  onClick={() => onSelectTrip(t)}
                >
                  {/* 1. Datos Generales */}
                  <td className="py-2 px-3 font-mono text-slate-400">{t.id}</td>
                  <td className="py-2 px-3 text-center">{t.ejercicio}</td>
                  <td className="py-2 px-3 text-center">{t.mes}</td>
                  <td className="py-2 px-3 text-center">{t.fechaLiquiFleteros}</td>
                  <td className="py-2 px-3 text-center">{t.mesAnoOperativo}</td>
                  <td className="py-2 px-3 text-center border-r-2 border-blue-900">{t.fechaOrdenCarga}</td>

                  {/* 2. Transporte y Chofer */}
                  <td className="py-2 px-3 font-semibold text-center">{t.tipoTransporte}</td>
                  <td className="py-2 px-3">{t.transporte}</td>
                  <td className="py-2 px-3 font-medium text-white">{t.chofer}</td>
                  <td className="py-2 px-3 text-center">{t.codChofer}</td>
                  <td className="py-2 px-3 text-center border-r-2 border-blue-700">{t.tipoViaje || "1"}</td>

                  {/* 3. Cliente y Remitente */}
                  <td className="py-2 px-3 font-medium text-white">{t.clienteContrata}</td>
                  <td className="py-2 px-3 text-center">{t.codCliente}</td>
                  <td className="py-2 px-3">{t.empresaRemitente}</td>
                  <td className="py-2 px-3 text-center border-r-2 border-indigo-800">{t.codiProCM || "209"}</td>

                  {/* 4. Ruta y Producto */}
                  <td className="py-2 px-3">{t.pciaOrigen}</td>
                  <td className="py-2 px-3">{t.origen}</td>
                  <td className="py-2 px-3 text-center">{t.vinculoViaje || "-"}</td>
                  <td className="py-2 px-3">{t.clienteDestino}</td>
                  <td className="py-2 px-3 font-semibold text-white">{t.localidadDestino}</td>
                  <td className="py-2 px-3">{t.tipoProducto}</td>
                  <td className="py-2 px-3">{t.producto}</td>
                  <td className="py-2 px-3 text-right font-mono">{t.kmPuntoCarga || 0}</td>
                  <td className="py-2 px-3 text-right font-mono">{t.kmDestino || 0}</td>
                  <td className="py-2 px-3 text-right font-mono border-r-2 border-purple-800">
                    {showFormulasInTable ? (
                      <span className="text-[10px] text-purple-300 font-mono bg-purple-950/70 px-1.5 py-0.5 rounded border border-purple-800/60">
                        {`=W${3 + paginatedTrips.indexOf(t)}+X${3 + paginatedTrips.indexOf(t)}`}
                      </span>
                    ) : (
                      t.totalKm || 0
                    )}
                  </td>

                  {/* 5. Remitos y Toneladas */}
                  <td className="py-2 px-3 font-mono">{t.remitoRemitente || "-"}</td>
                  <td className="py-2 px-3 font-mono">{t.remitoJuanMiguel || "-"}</td>
                  <td className="py-2 px-3 text-center">{t.fechaCarga}</td>
                  <td className="py-2 px-3 text-center">{t.fechaDescarga}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-teal-300">{formatNumber(t.kgsCargados, 2)}</td>
                  <td className="py-2 px-3 text-center">{t.factorCorreccion || "-"}</td>
                  <td className="py-2 px-3 text-right font-mono">{t.kgsAforado || 0}</td>
                  <td className="py-2 px-3 text-right font-mono">{t.kgsDestino || 0}</td>
                  <td className="py-2 px-3 text-right font-mono">
                    {showFormulasInTable ? (
                      <span className="text-[10px] text-teal-300 font-mono bg-teal-950/70 px-1.5 py-0.5 rounded border border-teal-800/60">
                        {`=AG${3 + paginatedTrips.indexOf(t)}-AF${3 + paginatedTrips.indexOf(t)}`}
                      </span>
                    ) : (
                      t.difKgs || 0
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono border-r-2 border-teal-800">{t.tarifaTnKm || 0}</td>

                  {/* 6. Facturación y Ventas */}
                  <td className="py-2 px-3 font-mono font-bold text-white">{t.factura}</td>
                  <td className="py-2 px-3 text-center">{t.fechaFactura}</td>
                  <td className="py-2 px-3 text-center">{t.fechaProformaOC || "-"}</td>
                  <td className="py-2 px-3 font-mono">{t.nroProformaOC || "-"}</td>
                  <td className="py-2 px-3 text-right font-mono">{t.kgsFacturados}</td>
                  <td className="py-2 px-3 text-right font-mono">{formatCurrency(t.tarifa)}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                    {showFormulasInTable ? (
                      <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/60">
                        {`=AN${3 + paginatedTrips.indexOf(t)}*AO${3 + paginatedTrips.indexOf(t)}`}
                      </span>
                    ) : (
                      formatCurrency(t.netoGravado)
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    {showFormulasInTable ? (
                      <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/60">
                        {`=AP${3 + paginatedTrips.indexOf(t)}*0.21`}
                      </span>
                    ) : (
                      formatCurrency(t.iva)
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-white border-r-2 border-green-800">
                    {showFormulasInTable ? (
                      <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/60">
                        {`=AP${3 + paginatedTrips.indexOf(t)}+AQ${3 + paginatedTrips.indexOf(t)}`}
                      </span>
                    ) : (
                      formatCurrency(t.totalFacturado)
                    )}
                  </td>

                  {/* 7. Liquidación Fleteros */}
                  <td className="py-2 px-3 text-right font-mono">{t.coeComision || (t.tipoTransporte === 'Fletero' ? '0,27' : '1,00')}</td>
                  <td className="py-2 px-3 text-right font-mono">{t.tnsLiquiFletero}</td>
                  <td className="py-2 px-3 text-right font-mono">{formatCurrency(t.tarifaFletero)}</td>
                  <td className="py-2 px-3 text-right font-mono">
                    {showFormulasInTable ? (
                      <span className="text-[10px] text-amber-300 font-mono bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800/60">
                        {`=AU${3 + paginatedTrips.indexOf(t)}*1.21`}
                      </span>
                    ) : (
                      formatCurrency(t.tarifaFleteroConIva || t.tarifaFletero * 1.21)
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">{formatCurrency(t.debeFlete || 0)}</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-amber-400">
                    {showFormulasInTable ? (
                      <span className="text-[10px] text-amber-300 font-mono bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800/60">
                        {`=AT${3 + paginatedTrips.indexOf(t)}*AU${3 + paginatedTrips.indexOf(t)}`}
                      </span>
                    ) : (
                      `-${formatCurrency(t.costoFletero)}`
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono border-r-2 border-amber-800">
                    {showFormulasInTable ? (
                      <span className="text-[10px] text-amber-300 font-mono bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800/60">
                        {`=AX${3 + paginatedTrips.indexOf(t)}-AW${3 + paginatedTrips.indexOf(t)}`}
                      </span>
                    ) : (
                      formatCurrency(t.saldoFlete || 0)
                    )}
                  </td>

                  {/* 8. Rentabilidad Barale */}
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                    {showFormulasInTable ? (
                      <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-800/60">
                        {`=AP${3 + paginatedTrips.indexOf(t)}-AX${3 + paginatedTrips.indexOf(t)}`}
                      </span>
                    ) : (
                      formatCurrency(t.margenPesos)
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">
                    {showFormulasInTable ? (
                      <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-800/60">
                        {`=SI(AP>0;AZ/AP;0)`}
                      </span>
                    ) : (
                      formatPercent(t.margenPct)
                    )}
                  </td>
                  <td className="py-2 px-3 text-center border-r-2 border-cyan-800 font-semibold">{t.estadoFacturacion}</td>

                  {/* 9. Info Tanques */}
                  <td className="py-2 px-3 text-right font-mono">{formatCurrency(t.peaje || 0)}</td>
                  <td className="py-2 px-3 text-right font-mono">{formatCurrency(t.precioKmTanque || 0)}</td>
                  <td className="py-2 px-3 text-right font-mono">{formatCurrency(t.valorViajeAforado27Tn || 0)}</td>
                  <td className="py-2 px-3 text-right font-mono">{t.kmLiquidadosAtanor || 0}</td>
                  <td className="py-2 px-3 text-right font-mono">{formatCurrency(t.precioKmCobradoAtanor || 0)}</td>
                  <td className="py-2 px-3 text-right font-mono">{t.kmLiquidadosBaraleFletero || 0}</td>
                  <td className="py-2 px-3 text-right font-mono">{t.difKmTanque || 0}</td>
                  <td className="py-2 px-3 text-right font-mono border-r-2 border-yellow-800">{formatCurrency(t.precioKmPagadoFletero || 0)}</td>

                  {/* 10. Compra Produc. Transportar */}
                  <td className="py-2 px-3 text-center">{t.proveFacA || "-"}</td>
                  <td className="py-2 px-3 text-right font-mono">{formatCurrency(t.precioUnitCompra || 0)}</td>
                  <td className="py-2 px-3 text-right font-mono">{formatCurrency(t.precioCompraMinerales || 0)}</td>
                  <td className="py-2 px-3 text-right font-mono">{formatCurrency(t.totalComprarConIva || 0)}</td>
                  <td className="py-2 px-3 text-right font-mono">{formatCurrency(t.importeFacProveedor || 0)}</td>
                  <td className="py-2 px-3 text-right font-mono">{formatCurrency(t.difValorCompraDevengada || 0)}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-orange-400 border-r-2 border-orange-800">{formatCurrency(t.ingresoNetoServicio || t.margenPesos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          Mostrando <span className="text-white font-medium">{paginatedTrips.length}</span> de{' '}
          <span className="text-white font-medium">{sortedTrips.length}</span> viajes filtrados
          {viewMode === 'all10sectors' && (
            <span className="ml-2 text-blue-400 font-medium">· Vista de 10 Sectores Activa</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono tabular-nums">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
