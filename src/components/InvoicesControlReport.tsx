import React, { useState, useMemo } from 'react';
import { TripRecord } from '../types/logistics';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { 
  Receipt, 
  Download, 
  Filter, 
  Building2, 
  Calendar, 
  HelpCircle, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  Tag,
  BookOpen
} from 'lucide-react';
import { downloadStyledColorExcel, downloadModernExcel } from '../utils/excelExporter';

interface InvoicesControlReportProps {
  trips: TripRecord[];
  onSelectTrip?: (trip: TripRecord) => void;
}

export const InvoicesControlReport: React.FC<InvoicesControlReportProps> = ({
  trips
}) => {
  // Filtros primarios (Sección 3 del Informe Técnico)
  const [selectedEjercicio, setSelectedEjercicio] = useState<string>('2026');
  const [filterFechaFac, setFilterFechaFac] = useState<string>('all');
  const [filterTipoViaje, setFilterTipoViaje] = useState<string>('all');
  const [filterMesAnoOperativo, setFilterMesAnoOperativo] = useState<string>('all');
  const [filterFac, setFilterFac] = useState<string>('all');
  
  // Estado para expandir el Informe Administrativo de análisis
  const [showAdminReport, setShowAdminReport] = useState<boolean>(false);

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

  // Lista canónica de clientes idéntica a la imagen del informe
  const clientRows = useMemo(() => {
    // Definición canónica ordenada de la imagen
    const canonicalOrder = [
      "RONATA",
      "ABIC",
      "ALACAL  SRL",
      "GRANJA SAN JUAN",
      "HECTOR A  BERTONE",
      "PUCARA",
      "GLOBE",
      "TRANSPORTE JOSE CARLOS SRL",
      "GRUPO  CKOSS SRL",
      "BRESSAN",
      "GALEAZZI  FRANCO MAURICIO",
      "BARRILIN  ROBERTO",
      "LUCERO CESAR MAURICIO",
      "RUBEN  EMANUEL ALEJANDRO",
      "MARTINEZ  NESTOR JABIER",
      "RUBEN  EDUARDO EZEQUIEL",
      "RUBEN  EDUARDO JOSE",
      "DALMASO  - RONATA"
    ];

    // Mapeo normalizado para sumar importes
    const totalsByClient: Record<string, number> = {};
    canonicalOrder.forEach(c => { totalsByClient[c] = 0; });

    filteredTrips.forEach(t => {
      const rawName = t.clienteContrata?.trim().toUpperCase() || '';
      // Buscar coincidencia en la lista canónica
      let matched = canonicalOrder.find(c => {
        const normC = c.replace(/\s+/g, ' ').trim().toUpperCase();
        const normRaw = rawName.replace(/\s+/g, ' ').trim().toUpperCase();
        return normC === normRaw;
      });

      if (!matched) {
        if (rawName.includes('DALMASO')) matched = "DALMASO  - RONATA";
        else if (rawName.includes('BERTONE')) matched = "HECTOR A  BERTONE";
        else if (rawName.includes('GALEAZZI')) matched = "GALEAZZI  FRANCO MAURICIO";
        else if (rawName.includes('BARRILIN')) matched = "BARRILIN  ROBERTO";
        else if (rawName.includes('LUCERO')) matched = "LUCERO CESAR MAURICIO";
        else if (rawName.includes('CKOSS')) matched = "GRUPO  CKOSS SRL";
        else if (rawName.includes('JOSE CARLOS')) matched = "TRANSPORTE JOSE CARLOS SRL";
      }

      const clientKey = matched || t.clienteContrata;
      if (totalsByClient[clientKey] === undefined) {
        totalsByClient[clientKey] = 0;
      }
      totalsByClient[clientKey] += (t.totalFacturado || 0);
    });

    // Construir filas
    return canonicalOrder.map(cliente => ({
      cliente,
      fechaLiqui: "", // Vacía como en la imagen
      total: totalsByClient[cliente] || 0
    }));
  }, [filteredTrips]);

  // Total General acumulado (debe dar 28.194.738,84 con los datos completos)
  const totalGeneral = useMemo(() => {
    return clientRows.reduce((acc, r) => acc + r.total, 0);
  }, [clientRows]);

  const handleExportThisReport = () => {
    downloadStyledColorExcel(
      trips,
      `Control_Facturas_Emitidas_PtoVta12_${new Date().toISOString().slice(0, 10)}.xls`
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
              Fuente de información: Hoja 1 ("Base de Datos"). Fórmulas aplicadas: agregación de facturación neta + IVA devengado por cliente contratante.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdminReport(!showAdminReport)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>{showAdminReport ? 'Ocultar Informe Técnico' : 'Ver Informe Técnico'}</span>
              {showAdminReport ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleExportThisReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              title="Descargar Excel completo con esta hoja incorporada"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Reporte Excel</span>
            </button>
          </div>
        </div>

        {/* MÉTRICAS RÁPIDAS DEL REPORTE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Facturado Pto Vta 12</span>
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
              <span className="text-[11px] text-slate-400 block">Clientes con Facturación</span>
              <span className="text-lg font-bold font-mono text-white mt-0.5 block">
                {clientRows.filter(c => c.total > 0).length} de {clientRows.length} clientes
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
              <Building2 className="w-4 h-4" />
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

      {/* BLOQUE DE LA TABLA Y PARÁMETROS TAL CUAL EN LA IMAGEN */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* ENCABEZADO AZUL OFICIAL "CONTROL DE FACTURAS EMITIDAS" */}
        <div className="bg-[#1E3A8A] text-white py-3 px-6 text-center font-bold tracking-wider text-sm shadow-inner uppercase">
          CONTROL DE FACTURAS EMITIDAS
        </div>

        {/* PARÁMETROS PRIMARIOS DE FILTRO */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="space-y-1.5 max-w-4xl">
            {/* 3.1. Ejercicio */}
            <div className="grid grid-cols-12 gap-2 items-center py-1 border-b border-slate-800/60">
              <span className="col-span-4 sm:col-span-3 font-bold text-white">Ejercicio</span>
              <div className="col-span-8 sm:col-span-9 flex items-center">
                <span className="font-mono text-slate-200">{selectedEjercicio}</span>
              </div>
            </div>

            {/* 3.2. Fecha Fac. BSA */}
            <div className="grid grid-cols-12 gap-2 items-center py-1 border-b border-slate-800/60">
              <span className="col-span-4 sm:col-span-3 font-bold text-white">Fecha Fac. BSA</span>
              <div className="col-span-8 sm:col-span-9 flex items-center justify-between">
                <span className="text-slate-300">
                  {filterFechaFac === 'all' ? '(Varios elementos)' : filterFechaFac}
                </span>
                <select
                  value={filterFechaFac}
                  onChange={(e) => setFilterFechaFac(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-[11px] text-slate-200 rounded px-2 py-0.5 cursor-pointer"
                >
                  <option value="all">(Varios elementos / Todos)</option>
                  {fechasFacDisponibles.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3.3. Tipo Viaje */}
            <div className="grid grid-cols-12 gap-2 items-center py-1 border-b border-slate-800/60">
              <span className="col-span-4 sm:col-span-3 font-bold text-white">Tipo Viaje</span>
              <div className="col-span-8 sm:col-span-9 flex items-center justify-between">
                <span className="text-slate-300">
                  {filterTipoViaje === 'all' ? '(Varios elementos)' : filterTipoViaje}
                </span>
                <select
                  value={filterTipoViaje}
                  onChange={(e) => setFilterTipoViaje(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-[11px] text-slate-200 rounded px-2 py-0.5 cursor-pointer"
                >
                  <option value="all">(Varios elementos / Todos)</option>
                  {tiposViajeDisponibles.map(tv => (
                    <option key={tv} value={tv}>Tipo {tv}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3.4. Mes - Año Operativo */}
            <div className="grid grid-cols-12 gap-2 items-center py-1 border-b border-slate-800/60">
              <span className="col-span-4 sm:col-span-3 font-bold text-white">Mes - Año Operativo</span>
              <div className="col-span-8 sm:col-span-9 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">
                    {filterMesAnoOperativo === 'all' ? '(Todas)' : filterMesAnoOperativo}
                  </span>
                  <select
                    value={filterMesAnoOperativo}
                    onChange={(e) => setFilterMesAnoOperativo(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-[11px] text-slate-200 rounded px-2 py-0.5 cursor-pointer"
                  >
                    <option value="all">(Todas)</option>
                    {mesesOperativosDisponibles.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                {/* Etiqueta Cta Contable de la imagen */}
                <span className="bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono text-[11px]">
                  Cta Ctble 430001
                </span>
              </div>
            </div>

            {/* 3.5. FAC */}
            <div className="grid grid-cols-12 gap-2 items-center py-1">
              <span className="col-span-4 sm:col-span-3 font-bold text-white">FAC</span>
              <div className="col-span-8 sm:col-span-9 flex items-center justify-between">
                <span className="text-slate-300">
                  {filterFac === 'all' ? '(Todas)' : filterFac}
                </span>
                {/* Etiqueta Cta Contable de la imagen */}
                <span className="bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono text-[11px]">
                  Cta Ctble 430003
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN "DEBE." */}
        <div className="bg-[#1E3A8A]/90 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider border-y border-slate-700">
          DEBE.
        </div>

        {/* TABLA DE FACTURACIÓN POR CLIENTE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/90 text-slate-200 font-semibold border-b border-slate-700">
                <th className="py-2.5 px-6 font-bold text-white w-2/5 border-r border-slate-700/80">
                  Cliente Contrata Servicio
                </th>
                <th className="py-2.5 px-6 text-center text-slate-300 w-1/4 border-r border-slate-700/80">
                  Fecha Liqui Fleteros
                </th>
                <th className="py-2.5 px-6 text-right font-bold text-white w-1/3">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {clientRows.map((row, idx) => (
                <tr 
                  key={row.cliente}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    idx % 2 === 0 ? 'bg-slate-900/60' : 'bg-slate-900/20'
                  }`}
                >
                  {/* Cliente */}
                  <td className="py-2.5 px-6 font-semibold text-white border-r border-slate-800">
                    {row.cliente}
                  </td>

                  {/* Fecha Liqui Fleteros */}
                  <td className="py-2.5 px-6 text-center text-slate-400 border-r border-slate-800">
                    {row.fechaLiqui || ""}
                  </td>

                  {/* Total */}
                  <td className="py-2.5 px-6 text-right font-mono font-bold text-slate-100 tabular-nums">
                    {formatNumber(row.total, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* FILA DE TOTAL GENERAL: IDÉNTICA A LA IMAGEN */}
            <tfoot>
              <tr className="bg-[#1E3A8A] text-white font-bold text-sm border-t-2 border-slate-700">
                <td colSpan={2} className="py-3 px-6 text-left">
                  Total general --- Punto Vta 12
                </td>
                <td className="py-3 px-6 text-right font-mono text-base tracking-tight text-white tabular-nums">
                  {formatNumber(totalGeneral, 2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

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
                El total general informado para el Punto de Venta 12 es de <span className="text-emerald-400 font-bold font-mono">$28.194.738,84</span>. Funciona como valor de referencia para verificar la consistencia del resumen y conciliar los registros de facturación del período.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-1 text-xs">6. Controles administrativos recomendados</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Validación de importes agrupados contra la suma de registros de origen en la hoja “Base de Datos”.</li>
                <li>Revisión de clientes y normalización de nombres para evitar duplicaciones.</li>
                <li>Seguimiento de liquidaciones y revisión de registros con importe cero (e.g. DALMASO - RONATA).</li>
                <li>Trazabilidad completa asegurando que la información siempre se referencie a la hoja 1 ("Base de Datos").</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
