import React, { useState, useMemo } from 'react';
import { TripRecord } from '../types/logistics';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { 
  Search, 
  ArrowUpDown, 
  FileSpreadsheet, 
  Download,
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Plus
} from 'lucide-react';
import { downloadModernExcel, downloadStyledColorExcel } from '../utils/excelExporter';

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
  const itemsPerPage = 10;

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      // Search
      const matchesSearch = 
        trip.chofer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.transporte.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.clienteContrata.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.localidadDestino.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.remitoRemitente.toLowerCase().includes(searchTerm.toLowerCase());

      // Transport filter
      const matchesTransport = 
        selectedTransportFilter === 'all' || 
        trip.tipoTransporte === selectedTransportFilter;

      // Status filter
      const matchesStatus = 
        selectedStatusFilter === 'all' || 
        trip.estadoFacturacion === selectedStatusFilter;

      // Product filter
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

        {/* Right: Sector Add & Excel Export Buttons */}
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

          {/* Product Filter */}
          <select
            value={selectedProductFilter}
            onChange={(e) => {
              onChangeProductFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Carga: Todas</option>
            <option value="Cereales">Cereales</option>
            <option value="Sal">Sal</option>
            <option value="Tanques">Tanques (Químico)</option>
            <option value="Minerales">Minerales</option>
            <option value="Alquiler Batea">Batea</option>
          </select>

          {/* DESCARGA EXCEL COLOREADO POR SECTOR (100% Funcional) */}
          <button
            onClick={() => downloadStyledColorExcel(sortedTrips, `Liquidacion_Barale_Sectores_Colores_${new Date().toISOString().slice(0, 10)}.xls`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            title="Descargar Excel con Columnas y Sectores Coloreados al 100%"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            <span>Excel por Sectores (Colores)</span>
          </button>

          {/* DESCARGA EXCEL .XLSX MULTI-PESTAÑA */}
          <button
            onClick={() => downloadModernExcel(sortedTrips, `Planilla_Viajes_Barale_${new Date().toISOString().slice(0, 10)}.xlsx`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Descargar Libro Completo XLSX Multi-pestaña"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Libro XLSX</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
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
                    {/* Fecha */}
                    <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap text-slate-400">
                      {trip.fechaCarga || trip.fechaOrdenCarga}
                    </td>

                    {/* Chofer / Transporte */}
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

                    {/* Cliente */}
                    <td className="py-3 px-4 max-w-[140px] truncate">
                      <span className="font-medium text-slate-200">{trip.clienteContrata}</span>
                      {trip.remitoRemitente && (
                        <div className="text-[11px] text-slate-500 font-mono">
                          Rto: {trip.remitoRemitente}
                        </div>
                      )}
                    </td>

                    {/* Origen -> Destino */}
                    <td className="py-3 px-4 max-w-[160px] truncate">
                      <span className="text-slate-300">{trip.origen}</span>
                      <span className="text-slate-500 mx-1">→</span>
                      <span className="text-white font-medium">{trip.localidadDestino}</span>
                    </td>

                    {/* Producto */}
                    <td className="py-3 px-4">
                      <span className="text-slate-300 font-medium">{trip.producto}</span>
                      <div className="text-[11px] text-slate-500">{trip.tipoProducto}</div>
                    </td>

                    {/* Tn Cargadas */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-200">
                      {formatNumber(trip.kgsCargados, 2)}
                    </td>

                    {/* Facturado NG */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {isPendiente ? (
                        <span className="text-amber-400/80 font-medium italic">Pendiente</span>
                      ) : (
                        <span className="text-white font-medium">{formatCurrency(trip.netoGravado)}</span>
                      )}
                    </td>

                    {/* Costo Fletero */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {trip.costoFletero > 0 ? (
                        <span className="text-amber-400 font-medium">-{formatCurrency(trip.costoFletero)}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Margen */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {trip.margenPesos > 0 ? (
                        <span className="text-emerald-400 font-semibold">{formatCurrency(trip.margenPesos)}</span>
                      ) : trip.margenPesos < 0 ? (
                        <span className="text-rose-400 font-semibold">{formatCurrency(trip.margenPesos)}</span>
                      ) : (
                        <span className="text-slate-600">$0</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        isPendiente 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {trip.estadoFacturacion}
                      </span>
                    </td>

                    {/* Acción */}
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTrip(trip);
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Ver Detalles Completos"
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
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          Mostrando <span className="text-white font-medium">{paginatedTrips.length}</span> de{' '}
          <span className="text-white font-medium">{sortedTrips.length}</span> viajes filtrados
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
