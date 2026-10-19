import React, { useState } from 'react';
import { FunctionSquare, Calculator, CheckCircle2, ChevronRight, Info, Layers } from 'lucide-react';
import { TripRecord } from '../types/logistics';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface FormulaItem {
  id: string;
  name: string;
  sector: string;
  color: string;
  cellAddress: string;
  formulaDisplay: string;
  excelFormula: string;
  sourceDescription: string;
  targetDescription: string;
  calculate: (trips: TripRecord[]) => string;
}

const FORMULAS_LIST: FormulaItem[] = [
  {
    id: 'total-facturado',
    name: 'Total Facturado c/IVA',
    sector: 'Sector 6 (Facturación y Ventas)',
    color: '#15803D',
    cellAddress: 'Columna AR',
    formulaDisplay: '= [Neto Gravado] + [IVA 21%]',
    excelFormula: '=AP{fila}+AQ{fila}',
    sourceDescription: 'Toma el Neto Gravado (Columna AP) y le suma el IVA 21% (Columna AQ).',
    targetDescription: 'Se coloca en Columna AR (Total Facturado c/IVA) de cada viaje y alimenta la Hoja 5.',
    calculate: (trips) => formatCurrency(trips.reduce((acc, t) => acc + (t.totalFacturado || 0), 0))
  },
  {
    id: 'neto-gravado',
    name: 'Neto Gravado (NG)',
    sector: 'Sector 6 (Facturación y Ventas)',
    color: '#15803D',
    cellAddress: 'Columna AP',
    formulaDisplay: '= [Tn Facturadas] * [Tarifa $/Tn]',
    excelFormula: '=AN{fila}*AO{fila}',
    sourceDescription: 'Multiplica las Toneladas Facturadas (Columna AN) por la Tarifa unitaria pactada (Columna AO).',
    targetDescription: 'Se coloca en Columna AP y es la base imponible para el IVA y el cálculo del Margen.',
    calculate: (trips) => formatCurrency(trips.reduce((acc, t) => acc + (t.netoGravado || 0), 0))
  },
  {
    id: 'iva-21',
    name: 'IVA Débito Fiscal (21%)',
    sector: 'Sector 6 (Facturación y Ventas)',
    color: '#15803D',
    cellAddress: 'Columna AQ',
    formulaDisplay: '= [Neto Gravado] * 0.21',
    excelFormula: '=AP{fila}*0.21',
    sourceDescription: 'Aplica la alícuota del 21% sobre el Neto Gravado (Columna AP).',
    targetDescription: 'Se coloca en Columna AQ para liquidación fiscal ante AFIP.',
    calculate: (trips) => formatCurrency(trips.reduce((acc, t) => acc + (t.iva || 0), 0))
  },
  {
    id: 'costo-fletero',
    name: 'Costo Flete (Haber Fletero)',
    sector: 'Sector 7 (Liquidación Fleteros)',
    color: '#B45309',
    cellAddress: 'Columna AX',
    formulaDisplay: '= [Tn Liq Fletero] * [Tarifa Fletero]',
    excelFormula: '=AT{fila}*AU{fila}',
    sourceDescription: 'Multiplica las Toneladas liquidadas al fletero (Columna AT) por su tarifa pactada (Columna AU).',
    targetDescription: 'Se coloca en Columna AX y alimenta la Hoja 3 (Rendimiento Choferes).',
    calculate: (trips) => formatCurrency(trips.reduce((acc, t) => acc + (t.costoFletero || 0), 0))
  },
  {
    id: 'margen-neto',
    name: 'Margen Neto Barale ($)',
    sector: 'Sector 8 (Rentabilidad Barale)',
    color: '#0284C7',
    cellAddress: 'Columna AZ',
    formulaDisplay: '= [Neto Gravado] - [Costo Fletero]',
    excelFormula: '=AP{fila}-AX{fila}',
    sourceDescription: 'Resta del ingreso neto del servicio (Columna AP) el costo directo del transporte (Columna AX).',
    targetDescription: 'Se coloca en Columna AZ para determinar la ganancia neta devengada por viaje.',
    calculate: (trips) => formatCurrency(trips.reduce((acc, t) => acc + (t.margenPesos || 0), 0))
  },
  {
    id: 'margen-pct',
    name: 'Margen Rentabilidad (%)',
    sector: 'Sector 8 (Rentabilidad Barale)',
    color: '#0284C7',
    cellAddress: 'Columna BA',
    formulaDisplay: '= SI([Neto Gravado] > 0; [Margen Neto] / [Neto Gravado]; 0)',
    excelFormula: '=IF(AP{fila}>0,AZ{fila}/AP{fila},0)',
    sourceDescription: 'Divide el Margen Neto en pesos (Columna AZ) sobre el Neto Gravado facturado (Columna AP).',
    targetDescription: 'Se coloca en Columna BA en formato porcentaje para análisis de rentabilidad.',
    calculate: (trips) => {
      const neto = trips.reduce((acc, t) => acc + (t.netoGravado || 0), 0);
      const margen = trips.reduce((acc, t) => acc + (t.margenPesos || 0), 0);
      return neto > 0 ? `${((margen / neto) * 100).toFixed(1)}%` : '0.0%';
    }
  },
  {
    id: 'sumar-si-cliente',
    name: 'Facturación por Cliente (Pto Vta 12)',
    sector: 'Hoja 5 (Control Facturas Emitidas)',
    color: '#4338CA',
    cellAddress: 'Hoja 5 - Columna C',
    formulaDisplay: '= SUMAR.SI(\'Base de Datos\'!ClienteContrata; [Cliente]; \'Base de Datos\'!TotalFacturado)',
    excelFormula: '=SUMIF(\'Base de Datos\'!$L$3:$L$80, A13, \'Base de Datos\'!$AR$3:$AR$80)',
    sourceDescription: 'Busca el nombre del cliente en la Columna L de la Base de Datos y totaliza su Columna AR.',
    targetDescription: 'Se coloca en la Hoja 5 en cada fila de cliente consolidando el total con IVA.',
    calculate: (trips) => formatCurrency(trips.reduce((acc, t) => acc + (t.totalFacturado || 0), 0))
  },
  {
    id: 'total-km',
    name: 'Total Kilómetros Recorridos',
    sector: 'Sector 4 (Ruta y Producto)',
    color: '#6D28D9',
    cellAddress: 'Columna Y',
    formulaDisplay: '= [Km Punto Carga] + [Km Destino]',
    excelFormula: '=W{fila}+X{fila}',
    sourceDescription: 'Suma los kilómetros recorridos hacia la carga (Columna W) más los kilómetros al destino (Columna X).',
    targetDescription: 'Se coloca en Columna Y para auditoría logística y consumo de tanques.',
    calculate: (trips) => `${formatNumber(trips.reduce((acc, t) => acc + (t.totalKm || 0), 0), 0)} Km`
  },
  {
    id: 'dif-kgs',
    name: 'Diferencia de Kilos (Destino - Aforado)',
    sector: 'Sector 5 (Remitos y Toneladas)',
    color: '#0F766E',
    cellAddress: 'Columna AH',
    formulaDisplay: '= [Kgs Destino] - [Kgs Aforado]',
    excelFormula: '=AG{fila}-AF{fila}',
    sourceDescription: 'Resta de los Kilos recibidos en Destino (Columna AG) los Kilos aforados en Balanza (Columna AF).',
    targetDescription: 'Se coloca en Columna AH para control de mermas o diferencias de carga.',
    calculate: (trips) => `${formatNumber(trips.reduce((acc, t) => acc + (t.difKgs || 0), 0), 2)} Kgs`
  },
  {
    id: 'tarifa-fletero-civa',
    name: 'Tarifa Fletero C/IVA',
    sector: 'Sector 7 (Liquidación Fleteros)',
    color: '#B45309',
    cellAddress: 'Columna AV',
    formulaDisplay: '= [Tarifa Fletero $/Tn] * 1.21',
    excelFormula: '=AU{fila}*1.21',
    sourceDescription: 'Multiplica la tarifa unitaria pactada con el fletero (Columna AU) por el factor 1.21 de IVA.',
    targetDescription: 'Se coloca en Columna AV para control contable de la obligación de pago con impuestos.',
    calculate: (trips) => {
      const avg = trips.length > 0 ? trips.reduce((acc, t) => acc + (t.tarifaFleteroConIva || t.tarifaFletero * 1.21), 0) / trips.length : 0;
      return `${formatCurrency(avg)} (promedio)`;
    }
  },
  {
    id: 'saldo-flete',
    name: 'Saldo Fletero a Cobrar/Pagar',
    sector: 'Sector 7 (Liquidación Fleteros)',
    color: '#B45309',
    cellAddress: 'Columna AY',
    formulaDisplay: '= [Costo Flete Haber] - [Debe Flete]',
    excelFormula: '=AX{fila}-AW{fila}',
    sourceDescription: 'Resta del Costo devengado a favor del transportista (Columna AX) los anticipos o débitos (Columna AW).',
    targetDescription: 'Se coloca en Columna AY para emisión de órdenes de pago netas.',
    calculate: (trips) => formatCurrency(trips.reduce((acc, t) => acc + (t.saldoFlete || 0), 0))
  },
  {
    id: 'total-general-pto12',
    name: 'Total General Punto Vta 12',
    sector: 'Hoja 5 (Control Facturas Emitidas)',
    color: '#1E3A8A',
    cellAddress: 'Hoja 5 - Total General',
    formulaDisplay: '= SUMA(C13:C30)',
    excelFormula: '=SUM(C13:C30)',
    sourceDescription: 'Suma de todos los importes calculados en la columna Total por cada cliente.',
    targetDescription: 'Se coloca en la fila final de la tabla DEBE de la Hoja 5 para cuadre contable con el mayor.',
    calculate: (trips) => formatCurrency(trips.reduce((acc, t) => acc + (t.totalFacturado || 0), 0))
  }
];

interface ExcelFormulaBarProps {
  trips: TripRecord[];
  currentContext?: string;
}

export const ExcelFormulaBar: React.FC<ExcelFormulaBarProps> = ({ trips, currentContext }) => {
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>('total-facturado');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const activeFormula = FORMULAS_LIST.find(f => f.id === selectedFormulaId) || FORMULAS_LIST[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
      {/* BARRA SUPERIOR FX ESTILO EXCEL */}
      <div className="bg-slate-950 px-3.5 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Lado izquierdo: Identificador de Celda y Barra FX */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Cuadro de Nombres de Celda */}
          <div className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded text-[11px] font-mono text-emerald-400 font-bold tracking-tight whitespace-nowrap shadow-inner flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{activeFormula.cellAddress}</span>
          </div>

          {/* Símbolo FX clásico de Excel */}
          <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-slate-400 font-serif italic font-bold text-xs select-none border border-slate-700/60">
            fx
          </div>

          {/* Barra de entrada de fórmula */}
          <div className="flex-1 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded font-mono text-[11px] text-white flex items-center justify-between overflow-x-auto">
            <span className="text-emerald-300 font-semibold">{activeFormula.formulaDisplay}</span>
            <span className="text-[10px] text-slate-500 font-mono ml-2 hidden sm:inline">
              Excel: {activeFormula.excelFormula}
            </span>
          </div>
        </div>

        {/* Lado derecho: Total Calculado y Botón de Información */}
        <div className="flex items-center gap-2">
          <div className="text-[11px] flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded border border-slate-700/60">
            <span className="text-slate-400">Total calculado ({trips.length} reg.):</span>
            <span className="font-mono font-bold text-emerald-400">{activeFormula.calculate(trips)}</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 px-2 py-1 bg-blue-950/40 border border-blue-800/40 rounded cursor-pointer transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'Ocultar Detalle' : 'Ver Trazabilidad'}</span>
          </button>
        </div>
      </div>

      {/* SELECTOR RÁPIDO DE FÓRMULAS VINCULADAS */}
      <div className="px-3.5 py-2 bg-slate-900/80 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1 text-[10px] uppercase tracking-wider">
          <Calculator className="w-3 h-3 text-emerald-400" />
          Fórmulas Excel:
        </span>
        <div className="flex items-center gap-1.5">
          {FORMULAS_LIST.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedFormulaId(item.id)}
              className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-all cursor-pointer font-medium text-[11px] flex items-center gap-1.5 border ${
                selectedFormulaId === item.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                  : 'bg-slate-800 text-slate-300 border-slate-700/80 hover:bg-slate-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PANEL EXPANDIBLE DE TRAZABILIDAD Y DETALLE DE LA FÓRMULA */}
      {isExpanded && (
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Sector y Destino */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                Sector & Ubicación
              </span>
              <p className="font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeFormula.color }}></span>
                <span>{activeFormula.sector}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Celda de destino: <span className="font-mono text-emerald-400 font-bold">{activeFormula.cellAddress}</span>
              </p>
            </div>

            {/* De dónde toma la información (Origen) */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                1. Captura de Datos (Origen)
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {activeFormula.sourceDescription}
              </p>
            </div>

            {/* Dónde coloca el resultado (Destino y Uso) */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                2. Colocación & Vinculación (Destino)
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {activeFormula.targetDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Incrustación viva en Excel: Al descargar (.xlsx o .xls), las fórmulas operan dinámicamente.
            </span>
            <span className="font-mono text-slate-500">
              Sintaxis Excel oficial: <strong className="text-slate-300">{activeFormula.excelFormula}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
