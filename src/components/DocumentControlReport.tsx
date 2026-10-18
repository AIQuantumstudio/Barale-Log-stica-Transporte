import React, { useState, useMemo } from 'react';
import { TripRecord } from '../types/logistics';
import { formatNumber, formatCurrency } from '../utils/formatters';
import { 
  FileCheck, 
  AlertCircle, 
  FileText, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  Eye, 
  Edit3,
  Calendar,
  Layers
} from 'lucide-react';
import { downloadModernExcel, downloadStyledColorExcel } from '../utils/excelExporter';

interface DocumentControlReportProps {
  trips: TripRecord[];
  onSelectTrip: (trip: TripRecord) => void;
  onUpdateTrip?: (updated: TripRecord) => void;
}

export const DocumentControlReport: React.FC<DocumentControlReportProps> = ({
  trips,
  onSelectTrip,
  onUpdateTrip
}) => {
  // 4 Filtros Superiores (Paso 1 de la Instrucción Técnica)
  const [filterRemitoDoc, setFilterRemitoDoc] = useState<string>('Pendiente'); // 'Pendiente' por defecto como en la imagen
  const [filterTipoViaje, setFilterTipoViaje] = useState<string>('all');
  const [filterTteModalidad, setFilterTteModalidad] = useState<string>('all');
  const [filterFechaLiqui, setFilterFechaLiqui] = useState<string>('all');

  // Métrica de cálculo (Paso 5): 'cuenta' (recuento de cargas como en la imagen) o 'toneladas' (suma de Tn)
  const [metricMode, setMetricMode] = useState<'cuenta' | 'toneladas' | 'importe'>('cuenta');

  // Modal para completar documentación
  const [editingTrip, setEditingTrip] = useState<TripRecord | null>(null);
  const [inputRemitoCliente, setInputRemitoCliente] = useState('');
  const [inputRemitoJM, setInputRemitoJM] = useState('');
  const [inputFactura, setInputFactura] = useState('');

  // Opciones únicas para los filtros
  const tiposViajeDisponibles = useMemo(() => {
    return Array.from(new Set(trips.map(t => t.tipoViaje || '1').filter(Boolean))).sort();
  }, [trips]);

  const fechasLiquiDisponibles = useMemo(() => {
    return Array.from(new Set(trips.map(t => t.fechaLiquiFleteros).filter(Boolean))).sort();
  }, [trips]);

  // Aplicación de los 4 filtros superiores de la tabla dinámica
  const filteredRecords = useMemo(() => {
    return trips.filter(trip => {
      // 1. Filtro Nro Rto Cliente - Remitente
      if (filterRemitoDoc === 'Pendiente') {
        const isDocPendiente = 
          !trip.remitoRemitente || 
          trip.remitoRemitente.toLowerCase().includes('pend') ||
          !trip.remitoJuanMiguel ||
          trip.remitoJuanMiguel.toLowerCase().includes('pend') ||
          trip.factura.toLowerCase().includes('pend');
        if (!isDocPendiente) return false;
      } else if (filterRemitoDoc === 'Completos') {
        const isDocCompleta = 
          trip.remitoRemitente && 
          !trip.remitoRemitente.toLowerCase().includes('pend') &&
          trip.remitoJuanMiguel &&
          !trip.remitoJuanMiguel.toLowerCase().includes('pend');
        if (!isDocCompleta) return false;
      }

      // 2. Filtro Tipo Viaje
      if (filterTipoViaje !== 'all' && (trip.tipoViaje || '1') !== filterTipoViaje) {
        return false;
      }

      // 3. Filtro Tte Propio / Tercero
      if (filterTteModalidad !== 'all' && trip.tipoTransporte !== filterTteModalidad) {
        return false;
      }

      // 4. Filtro Fecha Liqui Fleteros
      if (filterFechaLiqui !== 'all' && trip.fechaLiquiFleteros !== filterFechaLiqui) {
        return false;
      }

      return true;
    });
  }, [trips, filterRemitoDoc, filterTipoViaje, filterTteModalidad, filterFechaLiqui]);

  // Agrupación estructurada por Cliente Contrata Servicio -> Fecha Orden de Carga -> Chofer -> Origen -> Destino
  // idéntica a la tabla dinámica de la imagen
  const groupedData = useMemo(() => {
    const clientsMap: Record<string, {
      cliente: string;
      viajes: TripRecord[];
      subtotalValor: number;
    }> = {};

    filteredRecords.forEach(trip => {
      const clienteKey = trip.clienteContrata || 'Sin Cliente';
      if (!clientsMap[clienteKey]) {
        clientsMap[clienteKey] = {
          cliente: clienteKey,
          viajes: [],
          subtotalValor: 0
        };
      }
      clientsMap[clienteKey].viajes.push(trip);

      // Calcular según la métrica seleccionada
      if (metricMode === 'cuenta') {
        clientsMap[clienteKey].subtotalValor += (trip.kgsCargados ? 1 : 0);
      } else if (metricMode === 'toneladas') {
        clientsMap[clienteKey].subtotalValor += (trip.kgsCargados || 0);
      } else {
        clientsMap[clienteKey].subtotalValor += (trip.netoGravado || 0);
      }
    });

    return Object.values(clientsMap).sort((a, b) => b.viajes.length - a.viajes.length);
  }, [filteredRecords, metricMode]);

  // Total general acumulado
  const totalGeneral = useMemo(() => {
    if (metricMode === 'cuenta') {
      return filteredRecords.filter(t => t.kgsCargados).length;
    }
    if (metricMode === 'toneladas') {
      return filteredRecords.reduce((acc, t) => acc + (t.kgsCargados || 0), 0);
    }
    return filteredRecords.reduce((acc, t) => acc + (t.netoGravado || 0), 0);
  }, [filteredRecords, metricMode]);

  // Estadísticas clave de control documental
  const stats = useMemo(() => {
    const total = trips.length;
    const conRemitoPendiente = trips.filter(t => 
      !t.remitoRemitente || t.remitoRemitente.toLowerCase().includes('pend')
    ).length;
    const conFacturaPendiente = trips.filter(t => 
      t.factura.toLowerCase().includes('pend')
    ).length;
    const tnPendientes = trips
      .filter(t => t.factura.toLowerCase().includes('pend'))
      .reduce((acc, t) => acc + (t.kgsCargados || 0), 0);

    return { total, conRemitoPendiente, conFacturaPendiente, tnPendientes };
  }, [trips]);

  // Manejo de edición / completado de documentación
  const handleOpenEditDoc = (trip: TripRecord) => {
    setEditingTrip(trip);
    setInputRemitoCliente(trip.remitoRemitente?.replace('Pendiente', '') || '');
    setInputRemitoJM(trip.remitoJuanMiguel?.replace('Pendiente', '') || '');
    setInputFactura(trip.factura?.replace('Pendiente', '') || '');
  };

  const handleSaveDoc = () => {
    if (!editingTrip || !onUpdateTrip) return;
    const updated: TripRecord = {
      ...editingTrip,
      remitoRemitente: inputRemitoCliente.trim() || editingTrip.remitoRemitente,
      remitoJuanMiguel: inputRemitoJM.trim() || editingTrip.remitoJuanMiguel,
      factura: inputFactura.trim() || editingTrip.factura,
      estadoFacturacion: inputFactura.trim() ? 'Facturado' : editingTrip.estadoFacturacion
    };
    onUpdateTrip(updated);
    setEditingTrip(null);
  };

  // Exportar el Libro Excel Completo: Planilla Base al 100% + Hojas Sectorizadas por Color
  const handleExportPivotExcel = () => {
    downloadStyledColorExcel(
      trips, 
      `Liquidacion_Barale_Planilla_Base_con_Control_Doc_${new Date().toISOString().slice(0, 10)}.xls`
    );
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta de Instrucción & Contexto Administrativo */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Control y Seguimiento de Documentación Pendiente
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Reporte de control administrativo para identificar las órdenes de carga asignadas que tienen 
              documentación pendiente de entrega (remitos cliente o Juan y Miguel), facilitando su gestión 
              antes de la liquidación de fleteros y habilitación para facturación.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPivotExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Reporte Excel</span>
            </button>
          </div>
        </div>

        {/* Resumen de Alertas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Total Órdenes</span>
            <span className="text-lg font-bold font-mono text-white mt-0.5 block">{stats.total}</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] text-amber-400 block flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Remitos Pendientes</span>
            </span>
            <span className="text-lg font-bold font-mono text-amber-400 mt-0.5 block">{stats.conRemitoPendiente} viajes</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] text-blue-400 block flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>Facturas Pendientes</span>
            </span>
            <span className="text-lg font-bold font-mono text-blue-300 mt-0.5 block">{stats.conFacturaPendiente} órdenes</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Tn Pendientes de Facturar</span>
            <span className="text-lg font-bold font-mono text-teal-300 mt-0.5 block">{formatNumber(stats.tnPendientes, 2)} Tn</span>
          </div>
        </div>
      </div>

      {/* BLOQUE DE LOS 4 FILTROS SUPERIORES (Idénticos al Encabezado de la Imagen) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Filtros Superiores de Control (Paso 1)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Filtro 1: Nro Rto Cliente - Remitente */}
          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-medium text-white">Nro Rto Cliente - Remitente:</span>
              <span className="text-[10px] text-slate-500 font-mono">Col. W</span>
            </div>
            <select
              value={filterRemitoDoc}
              onChange={(e) => setFilterRemitoDoc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
            >
              <option value="Pendiente">Pendiente (Solo documentación pendiente)</option>
              <option value="Completos">Completos (Remito entregado)</option>
              <option value="all">(Todas)</option>
            </select>
          </div>

          {/* Filtro 2: Tipo Viaje */}
          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-medium text-white">Tipo Viaje:</span>
              <span className="text-[10px] text-slate-500 font-mono">Col. F</span>
            </div>
            <select
              value={filterTipoViaje}
              onChange={(e) => setFilterTipoViaje(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
            >
              <option value="all">(Varios elementos / Todos)</option>
              {tiposViajeDisponibles.map(tv => (
                <option key={tv} value={tv}>Tipo Viaje: {tv}</option>
              ))}
            </select>
          </div>

          {/* Filtro 3: Tte Propio / Tercero */}
          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-medium text-white">Tte Propio / Tercero:</span>
              <span className="text-[10px] text-slate-500 font-mono">Col. H</span>
            </div>
            <select
              value={filterTteModalidad}
              onChange={(e) => setFilterTteModalidad(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
            >
              <option value="all">(Todas)</option>
              <option value="Propio">Propio (Juan y Miguel)</option>
              <option value="Fletero">Fletero (Terceros)</option>
            </select>
          </div>

          {/* Filtro 4: Fecha Liqui Fleteros */}
          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-medium text-white">Fecha Liqui Fleteros:</span>
              <span className="text-[10px] text-slate-500 font-mono">Col. C</span>
            </div>
            <select
              value={filterFechaLiqui}
              onChange={(e) => setFilterFechaLiqui(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
            >
              <option value="all">(Todas)</option>
              {fechasLiquiDisponibles.map(fl => (
                <option key={fl} value={fl}>{fl}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selector de Medida de la Tabla Dinámica (Paso 5) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Medida de cálculo en columna Total:</span>
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setMetricMode('cuenta')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer font-medium ${
                metricMode === 'cuenta' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cuenta de Kgs Cargados (Recuento = 1)
            </button>
            <button
              onClick={() => setMetricMode('toneladas')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer font-medium ${
                metricMode === 'toneladas' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Suma de Toneladas (Tn)
            </button>
            <button
              onClick={() => setMetricMode('importe')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer font-medium ${
                metricMode === 'importe' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Importe ($ NG)
            </button>
          </div>
        </div>

        <div className="text-slate-400">
          Mostrando <span className="text-white font-mono font-bold">{filteredRecords.length}</span> órdenes filtradas
        </div>
      </div>

      {/* ESTRUCTURA DE LA TABLA DINÁMICA (Idéntica a la Imagen Adjunta) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Barra FX de Excel */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">fx</span>
            <span className="text-slate-400">Fórmula de Control Excel:</span>
            <code className="text-emerald-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              =SI(O(W3="Pendiente"; AA3="Pendiente"); 1; 0)
            </code>
          </div>
          <span className="text-slate-500 text-[10px]">Total General de Tabla: =SUMA(F11:F{10 + filteredRecords.length})</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {/* Fila de Encabezado Superior con el nombre de la medida */}
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 font-semibold">
                <th colSpan={5} className="py-2.5 px-4 text-blue-300 font-mono text-[11px]">
                  {metricMode === 'cuenta' && "Cuenta de Kgs Cargados"}
                  {metricMode === 'toneladas' && "Suma de Kgs Cargados (Convertido a Toneladas = Kg / 1.000)"}
                  {metricMode === 'importe' && "Suma de Neto Gravado Facturable ($)"}
                </th>
                <th className="py-2.5 px-4 text-right"></th>
                <th className="py-2.5 px-4 text-center"></th>
              </tr>
              {/* Fila de Columnas Principales */}
              <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Cliente Contrata Servicio</th>
                <th className="py-3 px-4">Fecha Orden de Carga</th>
                <th className="py-3 px-4">Chofer</th>
                <th className="py-3 px-4">Origen Carga</th>
                <th className="py-3 px-4">Localidad Destino Mercaderia.</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {groupedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No hay registros con los filtros seleccionados (todos los viajes tienen documentación completa o no coinciden con los criterios).
                  </td>
                </tr>
              ) : (
                groupedData.map((group) => {
                  return (
                    <React.Fragment key={group.cliente}>
                      {group.viajes.map((trip, idx) => {
                        const isDocPendiente = 
                          !trip.remitoRemitente || 
                          trip.remitoRemitente.toLowerCase().includes('pend') ||
                          !trip.remitoJuanMiguel ||
                          trip.remitoJuanMiguel.toLowerCase().includes('pend');

                        const valorFila = 
                          metricMode === 'cuenta' ? 1 : 
                          metricMode === 'toneladas' ? trip.kgsCargados : 
                          trip.netoGravado;

                        return (
                          <tr 
                            key={trip.id} 
                            className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                            onClick={() => onSelectTrip(trip)}
                          >
                            {/* Cliente Contrata Servicio (agrupado con celda combinada o destacado en la primera fila) */}
                            <td className="py-2.5 px-4 font-bold text-white align-top border-r border-slate-800/80 bg-slate-900/40">
                              {idx === 0 ? (
                                <div className="flex items-center gap-1.5">
                                  <span>{group.cliente}</span>
                                  <span className="text-[10px] text-slate-500 font-normal">
                                    ({group.viajes.length})
                                  </span>
                                </div>
                              ) : (
                                <span className="opacity-0">{group.cliente}</span>
                              )}
                            </td>

                            {/* Fecha Orden de Carga */}
                            <td className="py-2.5 px-4 font-mono tabular-nums text-slate-300">
                              {trip.fechaOrdenCarga || trip.fechaCarga}
                            </td>

                            {/* Chofer */}
                            <td className="py-2.5 px-4 font-medium text-slate-200">
                              <div className="flex items-center gap-1.5">
                                <span>{trip.chofer}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-normal ${
                                  trip.tipoTransporte === 'Propio' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'
                                }`}>
                                  {trip.tipoTransporte}
                                </span>
                              </div>
                            </td>

                            {/* Origen Carga */}
                            <td className="py-2.5 px-4 text-slate-300">
                              {trip.origen}
                            </td>

                            {/* Localidad Destino Mercaderia. */}
                            <td className="py-2.5 px-4 text-slate-200 font-medium">
                              {trip.localidadDestino}
                            </td>

                            {/* Columna Total (Valor según métrica seleccionada) */}
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-white bg-slate-900/50">
                              {metricMode === 'cuenta' && 1}
                              {metricMode === 'toneladas' && `${formatNumber(trip.kgsCargados, 2)} Tn`}
                              {metricMode === 'importe' && formatCurrency(trip.netoGravado)}
                            </td>

                            {/* Gestión Documental */}
                            <td className="py-2.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleOpenEditDoc(trip)}
                                  className={`p-1.5 rounded transition-colors text-[11px] flex items-center gap-1 cursor-pointer ${
                                    isDocPendiente 
                                      ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30' 
                                      : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30'
                                  }`}
                                  title="Gestionar documentación del viaje"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>{isDocPendiente ? 'Pendiente' : 'Completo'}</span>
                                </button>
                                <button
                                  onClick={() => onSelectTrip(trip)}
                                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
                                  title="Ver Ficha Completa"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
            {/* Fila Final: Total general (Idéntica a la imagen) */}
            <tfoot>
              <tr className="bg-slate-800 text-white font-bold border-t-2 border-slate-700">
                <td colSpan={5} className="py-3 px-4 text-left font-mono">
                  Total general
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm text-blue-400">
                  {metricMode === 'cuenta' && totalGeneral}
                  {metricMode === 'toneladas' && `${formatNumber(totalGeneral, 2)} Tn`}
                  {metricMode === 'importe' && formatCurrency(totalGeneral)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal para cargar o actualizar documentación del viaje */}
      {editingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl text-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Completar Documentación de Viaje</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {editingTrip.clienteContrata} · Chofer: {editingTrip.chofer}
                </p>
              </div>
              <button 
                onClick={() => setEditingTrip(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nro. Remito Cliente / Remitente</label>
                <input
                  type="text"
                  value={inputRemitoCliente}
                  onChange={(e) => setInputRemitoCliente(e.target.value)}
                  placeholder="Ej: 2027-060333 o 1324"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nro. Remito Juan y Miguel (Interno)</label>
                <input
                  type="text"
                  value={inputRemitoJM}
                  onChange={(e) => setInputRemitoJM(e.target.value)}
                  placeholder="Ej: 106918"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nro. Factura BSA (si ya fue emitida)</label>
                <input
                  type="text"
                  value={inputFactura}
                  onChange={(e) => setInputFactura(e.target.value)}
                  placeholder="Ej: 12-5227 o 0012-00887"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1 text-slate-400">
                <div>Origen: <span className="text-white">{editingTrip.origen}</span> → Destino: <span className="text-white">{editingTrip.localidadDestino}</span></div>
                <div>Carga: <span className="text-white">{editingTrip.producto}</span> ({formatNumber(editingTrip.kgsCargados, 2)} Tn)</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingTrip(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDoc}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Guardar Documentación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
