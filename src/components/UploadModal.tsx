import React, { useState } from 'react';
import { TripRecord } from '../types/logistics';
import { UploadCloud, X, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportData: (newTrips: TripRecord[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onImportData }) => {
  if (!isOpen) return null;

  const [pastedText, setPastedText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const parseCsvText = (text: string) => {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) {
        throw new Error('El archivo o texto debe contener al menos 2 líneas (encabezados y datos).');
      }

      const parsed: TripRecord[] = [];
      let startIdx = 0;

      // Find header line or first data line
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        if (lines[i].includes('Ejercicio') || lines[i].includes('Fecha Orden de Carga') || lines[i].includes('Chofer')) {
          startIdx = i + 1;
          break;
        }
      }

      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith(';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; -   ')) continue;

        // Split by semicolon (standard Excel Spanish format)
        const parts = line.split(';').map(p => p.trim());
        if (parts.length < 10) continue;

        const parseNum = (val: string) => {
          if (!val) return 0;
          const cleaned = val.replace(/\$/g, '').replace(/\./g, '').replace(',', '.').trim();
          const n = parseFloat(cleaned);
          return isNaN(n) ? 0 : n;
        };

        const fechaCarga = parts[24] || parts[4] || '';
        const chofer = parts[9] || parts[8] || 'Chofer Asignado';
        const kgs = parseNum(parts[23]);
        const neto = parseNum(parts[42]);
        const iva = parseNum(parts[43]);
        const total = parseNum(parts[44]);
        const costoFle = parseNum(parts[55]);
        const margen = parseNum(parts[58]) || (neto - costoFle);
        const tipoTte = parts[7]?.toLowerCase().includes('fle') ? 'Fletero' : 'Propio';

        parsed.push({
          id: `IMP-${(i + 1).toString().padStart(3, '0')}`,
          ejercicio: parseInt(parts[0]) || 2026,
          mes: parseInt(parts[1]) || 8,
          fechaLiquiFleteros: parts[2] || 'ago-26',
          mesAnoOperativo: parts[3] || 'ago-26',
          fechaOrdenCarga: parts[4] || '',
          tipoViaje: parts[5] || '1',
          codChofer: parts[6] || '',
          tipoTransporte: tipoTte as 'Propio' | 'Fletero',
          transporte: parts[8] || 'JUAN y MIGUEL',
          chofer,
          codCliente: parts[10] || '',
          clienteContrata: parts[11] || 'Cliente',
          empresaRemitente: parts[12] || '',
          pciaOrigen: parts[14] || '',
          origen: parts[15] || '',
          tipoProducto: parts[17] || 'Cereales',
          producto: parts[18] || 'Mercadería',
          remitoRemitente: parts[21] || '',
          remitoJuanMiguel: parts[22] || '',
          kgsCargados: kgs || 30,
          fechaCarga,
          clienteDestino: parts[26] || '',
          localidadDestino: parts[27] || '',
          kmPuntoCarga: parseNum(parts[28]),
          kmDestino: parseNum(parts[29]),
          totalKm: parseNum(parts[30]),
          tarifaTnKm: parseNum(parts[31]),
          fechaDescarga: parts[32] || '',
          nroProformaOC: parts[34] || '',
          fechaFactura: parts[35] || '',
          factura: parts[36] || 'Pendiente',
          kgsFacturados: parseNum(parts[37]) || kgs,
          tarifa: parseNum(parts[38]),
          netoGravado: neto,
          iva,
          totalFacturado: total,
          tnsLiquiFletero: parseNum(parts[50]),
          tarifaFletero: parseNum(parts[52]),
          costoFletero: costoFle,
          margenPesos: margen,
          margenPct: neto > 0 ? margen / neto : 0,
          estadoFacturacion: (parts[36]?.toLowerCase().includes('pend') || !parts[36]) ? 'Pendiente' : 'Facturado'
        });
      }

      if (parsed.length === 0) {
        throw new Error('No se detectaron filas válidas de viajes en el formato delimitado por punto y coma (;).');
      }

      onImportData(parsed);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar el archivo CSV.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseCsvText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Importar Planilla Excel / CSV
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pega el contenido o sube el archivo de liquidación
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* File Upload drag and drop */}
          <div>
            <label className="block text-slate-400 font-semibold mb-2">Subir archivo .csv o .txt</label>
            <label className="border-2 border-dashed border-slate-700 hover:border-purple-500/70 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-800/30">
              <UploadCloud className="w-8 h-8 text-purple-400 mb-2" />
              <span className="text-white font-medium text-xs">Haz clic para seleccionar tu archivo CSV</span>
              <span className="text-[11px] text-slate-500 mt-1">Exportado desde Excel (delimitado por ;)</span>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="flex items-center gap-2 my-2 text-slate-500">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-[11px] uppercase">o pega el texto directamente</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Copiar y pegar filas del Excel</label>
            <textarea
              rows={5}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Ejercicio;mes;Fecha Liqui Fleteros;Mes - Año Operativo;Fecha Orden de Carga;..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={() => parseCsvText(pastedText)}
            disabled={!pastedText.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
          >
            Procesar e Importar
          </button>
        </div>
      </div>
    </div>
  );
};
