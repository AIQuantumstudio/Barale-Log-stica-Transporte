import * as XLSX from 'xlsx';
import { TripRecord } from '../types/logistics';
import { formatCurrency, formatNumber } from './formatters';

export interface SectorDefinition {
  name: string;
  color: string; // Hex color for header
  textColor: string;
  columns: string[];
}

export const SECTORS: SectorDefinition[] = [
  {
    name: "1. DATOS GENERALES",
    color: "#1E3A8A", // Deep Navy
    textColor: "#FFFFFF",
    columns: ["ID", "Ejercicio", "Mes", "Mes Operativo", "Fecha Orden"]
  },
  {
    name: "2. TRANSPORTE Y CHOFER",
    color: "#1D4ED8", // Blue
    textColor: "#FFFFFF",
    columns: ["Modalidad", "Transporte", "Chofer", "Cód Chofer"]
  },
  {
    name: "3. CLIENTE Y REMITENTE",
    color: "#4338CA", // Indigo
    textColor: "#FFFFFF",
    columns: ["Cliente Contrata", "Cód Cliente", "Empresa Remitente"]
  },
  {
    name: "4. RUTA Y PRODUCTO",
    color: "#6D28D9", // Purple
    textColor: "#FFFFFF",
    columns: ["Pcia Origen", "Origen", "Destino", "Localidad Destino", "Tipo Producto", "Producto", "Total Km"]
  },
  {
    name: "5. REMITOS Y TONELADAS",
    color: "#0F766E", // Teal
    textColor: "#FFFFFF",
    columns: ["Remito Remitente", "Remito Juan y Miguel", "Fecha Carga", "Fecha Descarga", "Tn Cargadas"]
  },
  {
    name: "6. FACTURACIÓN Y VENTAS",
    color: "#15803D", // Green
    textColor: "#FFFFFF",
    columns: ["Factura BSA", "Fecha Factura", "Nro OC", "Tn Facturadas", "Tarifa $/Tn", "Neto Gravado (NG)", "IVA 21%", "Total Facturado c/IVA"]
  },
  {
    name: "7. LIQUIDACIÓN FLETEROS",
    color: "#B45309", // Amber
    textColor: "#FFFFFF",
    columns: ["Tn Liq Fletero", "Tarifa Fletero $/Tn", "Costo Flete (Haber)"]
  },
  {
    name: "8. RENTABILIDAD BARALE",
    color: "#0369A1", // Cyan / Ocean
    textColor: "#FFFFFF",
    columns: ["Margen Neto ($)", "Margen %", "Estado Factura"]
  }
];

/**
 * Genera un archivo Excel nativo (.xlsx) con múltiples pestañas y datos limpios.
 */
export const downloadModernExcel = (trips: TripRecord[], filename = 'Liquidacion_Barale_Bunge.xlsx') => {
  const wb = XLSX.utils.book_new();

  // 1. Pestaña Principal: Liquidación de Viajes
  const mainData: any[] = [];

  // Fila 1: Encabezados de Sector
  const sectorRow: string[] = [];
  SECTORS.forEach(sec => {
    sec.columns.forEach((_, idx) => {
      sectorRow.push(idx === 0 ? sec.name : "");
    });
  });
  mainData.push(sectorRow);

  // Fila 2: Encabezados de Columna
  const headerRow: string[] = [];
  SECTORS.forEach(sec => {
    sec.columns.forEach(col => {
      headerRow.push(col);
    });
  });
  mainData.push(headerRow);

  // Filas de Datos
  trips.forEach(t => {
    const row = [
      // 1. Datos Generales
      t.id,
      t.ejercicio,
      t.mes,
      t.mesAnoOperativo,
      t.fechaOrdenCarga,

      // 2. Transporte y Chofer
      t.tipoTransporte,
      t.transporte,
      t.chofer,
      t.codChofer,

      // 3. Cliente y Remitente
      t.clienteContrata,
      t.codCliente,
      t.empresaRemitente,

      // 4. Ruta y Producto
      t.pciaOrigen,
      t.origen,
      t.clienteDestino,
      t.localidadDestino,
      t.tipoProducto,
      t.producto,
      t.totalKm,

      // 5. Remitos y Toneladas
      t.remitoRemitente,
      t.remitoJuanMiguel,
      t.fechaCarga,
      t.fechaDescarga,
      t.kgsCargados,

      // 6. Facturación y Ventas
      t.factura,
      t.fechaFactura,
      t.nroProformaOC,
      t.kgsFacturados,
      t.tarifa,
      t.netoGravado,
      t.iva,
      t.totalFacturado,

      // 7. Liquidación Fleteros
      t.tnsLiquiFletero,
      t.tarifaFletero,
      t.costoFletero,

      // 8. Rentabilidad
      t.margenPesos,
      t.margenPct,
      t.estadoFacturacion
    ];
    mainData.push(row);
  });

  // Fila de Totales
  const totalNeto = trips.reduce((acc, t) => acc + (t.netoGravado || 0), 0);
  const totalIva = trips.reduce((acc, t) => acc + (t.iva || 0), 0);
  const totalFact = trips.reduce((acc, t) => acc + (t.totalFacturado || 0), 0);
  const totalCostoFletero = trips.reduce((acc, t) => acc + (t.costoFletero || 0), 0);
  const totalMargen = trips.reduce((acc, t) => acc + (t.margenPesos || 0), 0);
  const totalTn = trips.reduce((acc, t) => acc + (t.kgsCargados || 0), 0);

  const totalsRow = new Array(headerRow.length).fill("");
  totalsRow[0] = "TOTALES CONSOLIDADOS";
  totalsRow[23] = totalTn; // Columna Tn Cargadas
  totalsRow[28] = totalNeto; // Neto Gravado
  totalsRow[29] = totalIva; // IVA
  totalsRow[30] = totalFact; // Total Facturado
  totalsRow[33] = totalCostoFletero; // Costo Fletero
  totalsRow[34] = totalMargen; // Margen Neto
  mainData.push(totalsRow);

  const wsMain = XLSX.utils.aoa_to_sheet(mainData);

  // Ajuste de ancho de columnas
  wsMain['!cols'] = headerRow.map(() => ({ wch: 16 }));

  XLSX.utils.book_append_sheet(wb, wsMain, "Viajes y Liquidación");

  // 2. Pestaña: Resumen por Chofer / Fletero
  const driverMap = trips.reduce((acc, t) => {
    const d = t.chofer || 'Sin Asignar';
    if (!acc[d]) {
      acc[d] = {
        Chofer: d,
        Transporte: t.transporte,
        Modalidad: t.tipoTransporte,
        Viajes: 0,
        "Total Toneladas": 0,
        "Facturado (NG)": 0,
        "Costo Fletero": 0,
        "Margen Neto": 0
      };
    }
    acc[d].Viajes += 1;
    acc[d]["Total Toneladas"] += (t.kgsCargados || 0);
    acc[d]["Facturado (NG)"] += (t.netoGravado || 0);
    acc[d]["Costo Fletero"] += (t.costoFletero || 0);
    acc[d]["Margen Neto"] += (t.margenPesos || 0);
    return acc;
  }, {} as Record<string, any>);

  const wsDrivers = XLSX.utils.json_to_sheet(Object.values(driverMap));
  wsDrivers['!cols'] = [{ wch: 22 }, { wch: 20 }, { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsDrivers, "Rendimiento Choferes");

  // 3. Pestaña: Resumen por Cliente
  const clientMap = trips.reduce((acc, t) => {
    const c = t.clienteContrata || 'Sin Asignar';
    if (!acc[c]) {
      acc[c] = {
        Cliente: c,
        Viajes: 0,
        "Total Tn": 0,
        "Facturación Neta": 0,
        "Margen Generado": 0
      };
    }
    acc[c].Viajes += 1;
    acc[c]["Total Tn"] += (t.kgsCargados || 0);
    acc[c]["Facturación Neta"] += (t.netoGravado || 0);
    acc[c]["Margen Generado"] += (t.margenPesos || 0);
    return acc;
  }, {} as Record<string, any>);

  const wsClients = XLSX.utils.json_to_sheet(Object.values(clientMap));
  wsClients['!cols'] = [{ wch: 26 }, { wch: 10 }, { wch: 16 }, { wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsClients, "Resumen Clientes");

  // Escribir y descargar
  XLSX.writeFile(wb, filename);
};

/**
 * Genera un archivo HTML Spreadsheet (.xls) con ESTILOS CSS REALES y COLORES en cada sector.
 * Excel lo abre de forma 100% nativa mostrando cada sector de color con bordes y tipografía clara.
 */
export const downloadStyledColorExcel = (trips: TripRecord[], filename = 'Liquidacion_Barale_Colores.xls') => {
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Liquidacion Barale</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: Calibri, Arial, sans-serif; }
        table { border-collapse: collapse; }
        th, td { border: 1px solid #D1D5DB; padding: 6px 10px; font-size: 11px; }
        .sector-header { font-size: 12px; font-weight: bold; text-align: center; color: #FFFFFF; }
        .col-header { font-weight: bold; font-size: 11px; text-align: center; color: #FFFFFF; }
        .num { text-align: right; mso-number-format: "#,##0.00"; }
        .money { text-align: right; mso-number-format: "$#,##0.00"; }
        .pct { text-align: right; mso-number-format: "0.0%"; }
        .center { text-align: center; }
        .total-row { font-weight: bold; background-color: #F3F4F6; border-top: 2px solid #111827; }
      </style>
    </head>
    <body>
      <table>
        <!-- FILA 1: BANNERS DE SECTORES POR COLOR -->
        <tr>
  `;

  SECTORS.forEach(sec => {
    html += `
      <th colspan="${sec.columns.length}" class="sector-header" style="background-color: ${sec.color}; color: ${sec.textColor}; border: 1px solid #111827;">
        ${sec.name}
      </th>
    `;
  });

  html += `
        </tr>
        <!-- FILA 2: ENCABEZADOS DE COLUMNA POR SECTOR -->
        <tr>
  `;

  SECTORS.forEach(sec => {
    sec.columns.forEach(col => {
      // Color ligeramente más claro para la sub-cabecera
      html += `
        <th class="col-header" style="background-color: ${sec.color}; color: ${sec.textColor}; border: 1px solid #374151;">
          ${col}
        </th>
      `;
    });
  });

  html += `
        </tr>
        <!-- FILAS DE DATOS CON BORDES Y SECTORES -->
  `;

  trips.forEach((t, rowIdx) => {
    const bgRow = rowIdx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';

    html += `<tr style="background-color: ${bgRow};">`;

    // 1. Datos Generales
    html += `<td class="center" style="border-left: 2px solid #1E3A8A;">${t.id}</td>`;
    html += `<td class="center">${t.ejercicio}</td>`;
    html += `<td class="center">${t.mes}</td>`;
    html += `<td class="center">${t.mesAnoOperativo}</td>`;
    html += `<td class="center" style="border-right: 2px solid #1E3A8A;">${t.fechaOrdenCarga}</td>`;

    // 2. Transporte y Chofer
    html += `<td class="center" style="font-weight: 500; color: ${t.tipoTransporte === 'Propio' ? '#1D4ED8' : '#B45309'};">${t.tipoTransporte}</td>`;
    html += `<td>${t.transporte}</td>`;
    html += `<td style="font-weight: bold;">${t.chofer}</td>`;
    html += `<td class="center" style="border-right: 2px solid #1D4ED8;">${t.codChofer}</td>`;

    // 3. Cliente y Remitente
    html += `<td style="font-weight: 500;">${t.clienteContrata}</td>`;
    html += `<td class="center">${t.codCliente}</td>`;
    html += `<td style="border-right: 2px solid #4338CA;">${t.empresaRemitente}</td>`;

    // 4. Ruta y Producto
    html += `<td>${t.pciaOrigen}</td>`;
    html += `<td>${t.origen}</td>`;
    html += `<td>${t.clienteDestino}</td>`;
    html += `<td style="font-weight: bold;">${t.localidadDestino}</td>`;
    html += `<td>${t.tipoProducto}</td>`;
    html += `<td>${t.producto}</td>`;
    html += `<td class="num" style="border-right: 2px solid #6D28D9;">${t.totalKm || 0}</td>`;

    // 5. Remitos y Toneladas
    html += `<td class="center">${t.remitoRemitente || '-'}</td>`;
    html += `<td class="center">${t.remitoJuanMiguel || '-'}</td>`;
    html += `<td class="center">${t.fechaCarga}</td>`;
    html += `<td class="center">${t.fechaDescarga}</td>`;
    html += `<td class="num" style="font-weight: bold; background-color: #F0FDFA; border-right: 2px solid #0F766E;">${t.kgsCargados}</td>`;

    // 6. Facturación y Ventas
    html += `<td class="center" style="font-weight: bold;">${t.factura}</td>`;
    html += `<td class="center">${t.fechaFactura}</td>`;
    html += `<td class="center">${t.nroProformaOC || '-'}</td>`;
    html += `<td class="num">${t.kgsFacturados}</td>`;
    html += `<td class="money">${t.tarifa}</td>`;
    html += `<td class="money" style="font-weight: bold; background-color: #F0FDF4;">${t.netoGravado}</td>`;
    html += `<td class="money">${t.iva}</td>`;
    html += `<td class="money" style="font-weight: bold; border-right: 2px solid #15803D;">${t.totalFacturado}</td>`;

    // 7. Liquidación Fleteros
    html += `<td class="num">${t.tnsLiquiFletero}</td>`;
    html += `<td class="money">${t.tarifaFletero}</td>`;
    html += `<td class="money" style="color: #B45309; font-weight: bold; background-color: #FEF3C7; border-right: 2px solid #B45309;">${t.costoFletero > 0 ? t.costoFletero : 0}</td>`;

    // 8. Rentabilidad Barale
    html += `<td class="money" style="font-weight: bold; color: ${t.margenPesos >= 0 ? '#047857' : '#B91C1C'}; background-color: #ECFDF5;">${t.margenPesos}</td>`;
    html += `<td class="pct" style="font-weight: bold;">${t.margenPct}</td>`;
    html += `<td class="center" style="font-weight: bold; color: ${t.estadoFacturacion === 'Facturado' ? '#047857' : '#D97706'}; border-right: 2px solid #0369A1;">${t.estadoFacturacion}</td>`;

    html += `</tr>`;
  });

  // Totales
  const totalNeto = trips.reduce((acc, t) => acc + (t.netoGravado || 0), 0);
  const totalIva = trips.reduce((acc, t) => acc + (t.iva || 0), 0);
  const totalFact = trips.reduce((acc, t) => acc + (t.totalFacturado || 0), 0);
  const totalCostoFletero = trips.reduce((acc, t) => acc + (t.costoFletero || 0), 0);
  const totalMargen = trips.reduce((acc, t) => acc + (t.margenPesos || 0), 0);
  const totalTn = trips.reduce((acc, t) => acc + (t.kgsCargados || 0), 0);

  html += `
        <tr class="total-row">
          <td colspan="23" style="text-align: right; padding: 10px; font-size: 12px;">TOTALES GENERALES:</td>
          <td class="num" style="background-color: #CCFBF1; font-size: 12px;">${totalTn.toFixed(2)} Tn</td>
          <td colspan="5"></td>
          <td class="money" style="background-color: #DCFCE7; font-size: 12px;">${totalNeto}</td>
          <td class="money" style="font-size: 12px;">${totalIva}</td>
          <td class="money" style="font-size: 12px;">${totalFact}</td>
          <td colspan="2"></td>
          <td class="money" style="background-color: #FEF3C7; font-size: 12px; color: #B45309;">${totalCostoFletero}</td>
          <td class="money" style="background-color: #A7F3D0; font-size: 13px; color: #047857;">${totalMargen}</td>
          <td class="pct" style="font-size: 12px;">${totalNeto > 0 ? (totalMargen / totalNeto) : 0}</td>
          <td class="center">-</td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
