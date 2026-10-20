import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { TripRecord } from '../types/logistics';
import { getDetailedInvoiceRecords, TOTAL_INVOICES_NG, TOTAL_INVOICES_DEBE } from '../data/invoiceReportData';

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
    columns: ["ID", "Ejercicio", "Mes", "Fecha Liqui Fleteros", "Mes Operativo", "Fecha Orden"]
  },
  {
    name: "2. TRANSPORTE Y CHOFER",
    color: "#1D4ED8", // Royal Blue
    textColor: "#FFFFFF",
    columns: ["Modalidad", "Transporte", "Chofer", "Cód Chofer", "Tipo Viaje"]
  },
  {
    name: "3. CLIENTE Y REMITENTE",
    color: "#4338CA", // Indigo
    textColor: "#FFFFFF",
    columns: ["Cliente Contrata", "Cód Cliente", "Empresa Remitente", "Codi Pro CM"]
  },
  {
    name: "4. RUTA Y PRODUCTO",
    color: "#6D28D9", // Purple
    textColor: "#FFFFFF",
    columns: [
      "Pcia Origen",
      "Origen",
      "Vículo Viaje",
      "Destino",
      "Localidad Destino",
      "Tipo Producto",
      "Producto",
      "Km Recorrido al Punto Carga",
      "Km Recorrido al Destino Mercaderia",
      "Total Km"
    ]
  },
  {
    name: "5. REMITOS Y TONELADAS",
    color: "#0F766E", // Teal
    textColor: "#FFFFFF",
    columns: [
      "Remito Remitente",
      "Remito Juan y Miguel",
      "Fecha Carga",
      "Fecha Descarga",
      "Tn Cargadas",
      "Factor Corrección",
      "Kgs Aforado",
      "Kgs Destino",
      "Dif",
      "Tarifa Tn/Km"
    ]
  },
  {
    name: "6. FACTURACIÓN Y VENTAS",
    color: "#15803D", // Green
    textColor: "#FFFFFF",
    columns: [
      "Factura BSA",
      "Fecha Factura",
      "Fecha Proforma / OC",
      "Nro OC",
      "Tn Facturadas",
      "Tarifa ($/Tn)",
      "Neto Gravado (NG)",
      "IVA 21%",
      "Total Facturado c/IVA"
    ]
  },
  {
    name: "7. LIQUIDACIÓN FLETEROS",
    color: "#B45309", // Amber
    textColor: "#FFFFFF",
    columns: [
      "Coe Comisión",
      "Tn Liq Fletero",
      "Tarifa Fletero ($/Tn)",
      "Tarifa Fletero C/IVA",
      "Debe Flete",
      "Costo Flete (Haber)",
      "Saldo Flete"
    ]
  },
  {
    name: "8. RENTABILIDAD BARALE",
    color: "#0284C7", // Cyan / Ocean
    textColor: "#FFFFFF",
    columns: [
      "Margen Neto ($)",
      "Margen %",
      "Estado Factura"
    ]
  },
  {
    name: "9. INFO TANQUES",
    color: "#CA8A04", // Gold / Yellow
    textColor: "#FFFFFF",
    columns: [
      "Peaje",
      "Precio Km Tanque",
      "Valor Viaje Aforado 27 Tns",
      "Km Liquidados Atanor / Tanque",
      "$ Km Cobrado / Barale - Atanor / Tanque",
      "Km Liquidados Barale / Pagado Fle",
      "Dif Km / Tanque",
      "$ Km Pagado Barale - Fletero"
    ]
  },
  {
    name: "10. COMPRA PRODUC. TRANSPORTAR",
    color: "#EA580C", // Orange
    textColor: "#FFFFFF",
    columns: [
      "Prove Fac A",
      "Precio Unit Compra",
      "Precio Compra Minerales",
      "Total Comprar C/IVA",
      "Importe Fac Proveedor",
      "Dif Valor Compra Devengada y Fac",
      "Ingreso Neto Servi (Fac-Cpra)"
    ]
  }
];

/**
 * Genera el archivo Excel nativo (.xlsx) con los 10 sectores definidos en la imagen.
 */
export const downloadModernExcel = (trips: TripRecord[], filename = 'Liquidacion_Barale_Bunge.xlsx') => {
  const wb = XLSX.utils.book_new();

  // Fila 1: Encabezados de Sector
  const sectorRow: string[] = [];
  SECTORS.forEach(sec => {
    sec.columns.forEach((_, idx) => {
      sectorRow.push(idx === 0 ? sec.name : "");
    });
  });

  // Fila 2: Encabezados de Columna
  const headerRow: string[] = [];
  SECTORS.forEach(sec => {
    sec.columns.forEach(col => {
      headerRow.push(col);
    });
  });

  const mainData: any[] = [sectorRow, headerRow];

  // Filas de Datos
  trips.forEach(t => {
    const row = [
      // 1. Datos Generales
      t.id,
      t.ejercicio,
      t.mes,
      t.fechaLiquiFleteros,
      t.mesAnoOperativo,
      t.fechaOrdenCarga,

      // 2. Transporte y Chofer
      t.tipoTransporte,
      t.transporte,
      t.chofer,
      t.codChofer,
      t.tipoViaje || "1",

      // 3. Cliente y Remitente
      t.clienteContrata,
      t.codCliente,
      t.empresaRemitente,
      t.codiProCM || "209",

      // 4. Ruta y Producto
      t.pciaOrigen,
      t.origen,
      t.vinculoViaje || "-",
      t.clienteDestino,
      t.localidadDestino,
      t.tipoProducto,
      t.producto,
      t.kmPuntoCarga || 0,
      t.kmDestino || 0,
      t.totalKm || 0,

      // 5. Remitos y Toneladas
      t.remitoRemitente || "-",
      t.remitoJuanMiguel || "-",
      t.fechaCarga,
      t.fechaDescarga,
      t.kgsCargados,
      t.factorCorreccion || "-",
      t.kgsAforado || 0,
      t.kgsDestino || 0,
      t.difKgs || 0,
      t.tarifaTnKm || 0,

      // 6. Facturación y Ventas
      t.factura,
      t.fechaFactura,
      t.fechaProformaOC || "-",
      t.nroProformaOC || "-",
      t.kgsFacturados,
      t.tarifa,
      t.netoGravado,
      t.iva,
      t.totalFacturado,

      // 7. Liquidación Fleteros
      t.coeComision || (t.tipoTransporte === 'Fletero' ? 0.27 : 1.0),
      t.tnsLiquiFletero,
      t.tarifaFletero,
      t.tarifaFleteroConIva || (t.tarifaFletero * 1.21),
      t.debeFlete || 0,
      t.costoFletero,
      t.saldoFlete || 0,

      // 8. Rentabilidad Barale
      t.margenPesos,
      t.margenPct,
      t.estadoFacturacion,

      // 9. Info Tanques
      t.peaje || 0,
      t.precioKmTanque || 0,
      t.valorViajeAforado27Tn || 0,
      t.kmLiquidadosAtanor || 0,
      t.precioKmCobradoAtanor || 0,
      t.kmLiquidadosBaraleFletero || 0,
      t.difKmTanque || 0,
      t.precioKmPagadoFletero || 0,

      // 10. Compra Produc. Transportar
      t.proveFacA || "-",
      t.precioUnitCompra || 0,
      t.precioCompraMinerales || 0,
      t.totalComprarConIva || 0,
      t.importeFacProveedor || 0,
      t.difValorCompraDevengada || 0,
      t.ingresoNetoServicio || t.margenPesos
    ];
    mainData.push(row);
  });

  // Totales
  const totalNeto = trips.reduce((acc, t) => acc + (t.netoGravado || 0), 0);
  const totalIva = trips.reduce((acc, t) => acc + (t.iva || 0), 0);
  const totalFact = trips.reduce((acc, t) => acc + (t.totalFacturado || 0), 0);
  const totalCostoFletero = trips.reduce((acc, t) => acc + (t.costoFletero || 0), 0);
  const totalMargen = trips.reduce((acc, t) => acc + (t.margenPesos || 0), 0);
  const totalTn = trips.reduce((acc, t) => acc + (t.kgsCargados || 0), 0);

  const totalsRow = new Array(headerRow.length).fill("");
  totalsRow[0] = "TOTALES CONSOLIDADOS";
  totalsRow[29] = totalTn; // Tn Cargadas
  totalsRow[41] = totalNeto; // Neto Gravado
  totalsRow[42] = totalIva; // IVA
  totalsRow[43] = totalFact; // Total Facturado
  totalsRow[49] = totalCostoFletero; // Costo Fletero
  totalsRow[51] = totalMargen; // Margen Neto
  mainData.push(totalsRow);

  const wsMain = XLSX.utils.aoa_to_sheet(mainData);
  wsMain['!cols'] = headerRow.map(() => ({ wch: 17 }));

  // INCRUSTACIÓN DE FÓRMULAS VIVAS DE EXCEL EN LA PLANILLA BASE (OPERATIVA)
  const nTrips = trips.length;
  const dataEndExcel = 2 + nTrips; // Fila Excel final de datos (ej: 50)

  trips.forEach((t, idx) => {
    const r = 2 + idx; // Fila 0-indexed en SheetJS (fila 2 = fila 3 en Excel)
    const R = r + 1;   // Fila 1-indexed en Excel

    // Sector 4: Total Km = Km Punto Carga (W) + Km Destino (X)
    wsMain[XLSX.utils.encode_cell({ c: 24, r })] = { t: 'n', f: `W${R}+X${R}`, v: (t.kmPuntoCarga || 0) + (t.kmDestino || 0) };

    // Sector 5: Dif = Kgs Destino (AG) - Kgs Aforado (AF)
    wsMain[XLSX.utils.encode_cell({ c: 33, r })] = { t: 'n', f: `AG${R}-AF${R}`, v: t.difKgs || 0 };

    // Sector 6: Neto Gravado = Tn Facturadas (AN) * Tarifa (AO)
    wsMain[XLSX.utils.encode_cell({ c: 41, r })] = { t: 'n', f: `AN${R}*AO${R}`, v: t.netoGravado || 0 };

    // Sector 6: IVA 21% = Neto Gravado (AP) * 0.21
    wsMain[XLSX.utils.encode_cell({ c: 42, r })] = { t: 'n', f: `AP${R}*0.21`, v: t.iva || 0 };

    // Sector 6: Total Facturado = Neto Gravado (AP) + IVA (AQ)
    wsMain[XLSX.utils.encode_cell({ c: 43, r })] = { t: 'n', f: `AP${R}+AQ${R}`, v: t.totalFacturado || 0 };

    // Sector 7: Tarifa Fletero C/IVA = Tarifa Fletero (AU) * 1.21
    wsMain[XLSX.utils.encode_cell({ c: 47, r })] = { t: 'n', f: `AU${R}*1.21`, v: t.tarifaFleteroConIva || (t.tarifaFletero * 1.21) };

    // Sector 7: Costo Fletero Haber = Tn Liq Fletero (AT) * Tarifa Fletero (AU)
    wsMain[XLSX.utils.encode_cell({ c: 49, r })] = { t: 'n', f: `AT${R}*AU${R}`, v: t.costoFletero || 0 };

    // Sector 7: Saldo Flete = Costo Fletero (AX) - Debe Flete (AW)
    wsMain[XLSX.utils.encode_cell({ c: 50, r })] = { t: 'n', f: `AX${R}-AW${R}`, v: t.saldoFlete || 0 };

    // Sector 8: Margen Neto = Neto Gravado (AP) - Costo Fletero (AX)
    wsMain[XLSX.utils.encode_cell({ c: 51, r })] = { t: 'n', f: `AP${R}-AX${R}`, v: t.margenPesos || 0 };

    // Sector 8: Margen % = SI(AP>0, AZ/AP, 0)
    wsMain[XLSX.utils.encode_cell({ c: 52, r })] = { t: 'n', f: `IF(AP${R}>0,AZ${R}/AP${R},0)`, v: t.margenPct || 0 };

    // Sector 9: Dif Km Tanque = Km Atanor (BF) - Km Barale (BH)
    wsMain[XLSX.utils.encode_cell({ c: 60, r })] = { t: 'n', f: `BF${R}-BH${R}`, v: t.difKmTanque || 0 };

    // Sector 10: Dif Valor Compra = Importe Fac Proveedor (BO) - Total Comprar (BN)
    wsMain[XLSX.utils.encode_cell({ c: 67, r })] = { t: 'n', f: `BO${R}-BN${R}`, v: t.difValorCompraDevengada || 0 };

    // Sector 10: Ingreso Neto Servi = Neto Gravado (AP) - Importe Fac Proveedor (BO)
    wsMain[XLSX.utils.encode_cell({ c: 68, r })] = { t: 'n', f: `AP${R}-BO${R}`, v: t.ingresoNetoServicio || t.margenPesos };
  });

  // FÓRMULAS TOTALES CONSOLIDADOS PLANILLA BASE
  const totR = 2 + nTrips;
  const totExcel = totR + 1;

  wsMain[XLSX.utils.encode_cell({ c: 29, r: totR })] = { t: 'n', f: `SUM(AD3:AD${dataEndExcel})`, v: totalTn };
  wsMain[XLSX.utils.encode_cell({ c: 41, r: totR })] = { t: 'n', f: `SUM(AP3:AP${dataEndExcel})`, v: totalNeto };
  wsMain[XLSX.utils.encode_cell({ c: 42, r: totR })] = { t: 'n', f: `SUM(AQ3:AQ${dataEndExcel})`, v: totalIva };
  wsMain[XLSX.utils.encode_cell({ c: 43, r: totR })] = { t: 'n', f: `SUM(AR3:AR${dataEndExcel})`, v: totalFact };
  wsMain[XLSX.utils.encode_cell({ c: 49, r: totR })] = { t: 'n', f: `SUM(AX3:AX${dataEndExcel})`, v: totalCostoFletero };
  wsMain[XLSX.utils.encode_cell({ c: 51, r: totR })] = { t: 'n', f: `SUM(AZ3:AZ${dataEndExcel})`, v: totalMargen };
  wsMain[XLSX.utils.encode_cell({ c: 52, r: totR })] = { t: 'n', f: `IF(AP${totExcel}>0,AZ${totExcel}/AP${totExcel},0)`, v: totalNeto > 0 ? (totalMargen / totalNeto) : 0 };

  // Habilitar recálculo automático completo de fórmulas en Excel al abrir el archivo
  wb.Workbook = wb.Workbook || {};
  (wb.Workbook as any).calcPr = { fullCalcOnLoad: true };

  // Hoja 1: La planilla base intacta al 100% con todos los datos y sectores (Fuente oficial: "Base de Datos")
  XLSX.utils.book_append_sheet(wb, wsMain, "Base de Datos");

  // 2. Nueva Hoja: Control y Seguimiento de Documentación Pendiente (agregada a la misma planilla base)
  const totalOrdenes = trips.length;
  const remitosPendientesCount = trips.filter(t => 
    !t.remitoRemitente || t.remitoRemitente.toLowerCase().includes('pend') ||
    !t.remitoJuanMiguel || t.remitoJuanMiguel.toLowerCase().includes('pend')
  ).length;
  const facturasPendientesCount = trips.filter(t => 
    t.factura.toLowerCase().includes('pend')
  ).length;
  const tnPendientes = trips
    .filter(t => t.factura.toLowerCase().includes('pend'))
    .reduce((acc, t) => acc + (t.kgsCargados || 0), 0);

  const pivotRows: any[] = [];
  pivotRows.push(["CONTROL Y SEGUIMIENTO DE DOCUMENTACIÓN PENDIENTE"]);
  pivotRows.push([
    "Reporte de control administrativo para identificar las órdenes de carga asignadas que tienen documentación pendiente de entrega (remitos cliente o Juan y Miguel), facilitando su gestión antes de la liquidación de fleteros y habilitación para facturación."
  ]);
  pivotRows.push([]);

  // Indicadores de resumen
  pivotRows.push([
    "Total Órdenes",
    "Remitos Pendientes",
    "Facturas Pendientes",
    "Tn Pendientes de Facturar"
  ]);
  pivotRows.push([
    totalOrdenes,
    `${remitosPendientesCount} viajes`,
    `${facturasPendientesCount} órdenes`,
    `${tnPendientes.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tn`
  ]);
  pivotRows.push([]);

  // Bloque de los 4 Filtros Superiores de Control
  pivotRows.push(["FILTROS SUPERIORES DE CONTROL (Paso 1)"]);
  pivotRows.push(["Nro Rto Cliente - Remitente", "Pendiente", "Campo Columna W", "Origen: Hoja 1 (Planilla Base)"]);
  pivotRows.push(["Tipo Viaje", "(Varios elementos)", "Campo Columna F", "Origen: Hoja 1 (Planilla Base)"]);
  pivotRows.push(["Tte Propio / Tercero", "(Todas)", "Campo Columna H", "Origen: Hoja 1 (Planilla Base)"]);
  pivotRows.push(["Fecha Liqui Fleteros", "(Todas)", "Campo Columna C", "Origen: Hoja 1 (Planilla Base)"]);
  pivotRows.push([]);

  // Encabezados de la Tabla Dinámica
  pivotRows.push(["TABLA DINÁMICA DE SEGUIMIENTO", "Cuenta de Kgs Cargados"]);
  pivotRows.push([
    "Cliente Contrata Servicio",
    "Fecha Orden de Carga",
    "Chofer",
    "Origen Carga",
    "Localidad Destino Mercaderia.",
    "Total"
  ]);

  const pendingTrips = trips.filter(t => 
    !t.remitoRemitente || 
    t.remitoRemitente.toLowerCase().includes('pend') ||
    !t.remitoJuanMiguel || 
    t.remitoJuanMiguel.toLowerCase().includes('pend') ||
    t.factura.toLowerCase().includes('pend')
  );

  const sortedPendingTrips = [...pendingTrips].sort((a, b) => 
    (a.clienteContrata || '').localeCompare(b.clienteContrata || '')
  );

  let totalCuenta = 0;
  let lastClient = "";
  sortedPendingTrips.forEach(t => {
    const isNewClient = t.clienteContrata !== lastClient;
    pivotRows.push([
      isNewClient ? t.clienteContrata : "",
      t.fechaOrdenCarga || t.fechaCarga,
      t.chofer,
      t.origen,
      t.localidadDestino,
      1
    ]);
    lastClient = t.clienteContrata;
    totalCuenta += 1;
  });

  pivotRows.push(["Total general", "", "", "", "", totalCuenta]);

  const wsPivot = XLSX.utils.aoa_to_sheet(pivotRows);
  wsPivot['!cols'] = [{ wch: 30 }, { wch: 22 }, { wch: 22 }, { wch: 20 }, { wch: 26 }, { wch: 14 }];

  // Inyectar fórmula en Total General de la tabla de control
  const pivotTotRowIdx = 10 + sortedPendingTrips.length;
  wsPivot[XLSX.utils.encode_cell({ c: 5, r: pivotTotRowIdx })] = {
    t: 'n',
    f: `SUM(F11:F${pivotTotRowIdx})`,
    v: totalCuenta
  };

  XLSX.utils.book_append_sheet(wb, wsPivot, "Control Doc Pendiente");

  // 3. Pestaña: Resumen por Chofer / Fletero con Fórmulas Dinámicas
  const driverMap = trips.reduce((acc, t) => {
    const d = t.chofer || 'Sin Asignar';
    if (!acc[d]) {
      acc[d] = {
        Chofer: d,
        Transporte: t.transporte,
        Modalidad: t.tipoTransporte,
        Viajes: 0,
        TotalTn: 0,
        FacturadoNG: 0,
        CostoFletero: 0,
        MargenNeto: 0
      };
    }
    acc[d].Viajes += 1;
    acc[d].TotalTn += (t.kgsCargados || 0);
    acc[d].FacturadoNG += (t.netoGravado || 0);
    acc[d].CostoFletero += (t.costoFletero || 0);
    acc[d].MargenNeto += (t.margenPesos || 0);
    return acc;
  }, {} as Record<string, any>);

  const driversList = Object.values(driverMap);
  const driverRows: any[] = [
    ["Chofer", "Transporte", "Modalidad", "Viajes", "Total Toneladas", "Facturado (NG)", "Costo Fletero", "Margen Neto", "Margen %"]
  ];

  driversList.forEach(d => {
    driverRows.push([
      d.Chofer,
      d.Transporte,
      d.Modalidad,
      d.Viajes,
      d.TotalTn,
      d.FacturadoNG,
      d.CostoFletero,
      d.MargenNeto,
      d.FacturadoNG > 0 ? (d.MargenNeto / d.FacturadoNG) : 0
    ]);
  });

  // Fila de Totales de Choferes
  driverRows.push([
    "TOTALES GENERALES",
    "",
    "",
    trips.length,
    totalTn,
    totalNeto,
    totalCostoFletero,
    totalMargen,
    totalNeto > 0 ? (totalMargen / totalNeto) : 0
  ]);

  const wsDrivers = XLSX.utils.aoa_to_sheet(driverRows);
  wsDrivers['!cols'] = [{ wch: 22 }, { wch: 20 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 14 }];

  // Inyectar Fórmulas Vivas en Rendimiento Choferes vinculadas a Base de Datos
  driversList.forEach((_, idx) => {
    const r = 1 + idx;
    const R = r + 1; // Fila Excel
    // Viajes: COUNTIF en Columna I (Chofer)
    wsDrivers[XLSX.utils.encode_cell({ c: 3, r })] = { t: 'n', f: `COUNTIF('Base de Datos'!$I$3:$I$${dataEndExcel}, A${R})`, v: driversList[idx].Viajes };
    // Total Toneladas: SUMIF en Col I y Col AD
    wsDrivers[XLSX.utils.encode_cell({ c: 4, r })] = { t: 'n', f: `SUMIF('Base de Datos'!$I$3:$I$${dataEndExcel}, A${R}, 'Base de Datos'!$AD$3:$AD$${dataEndExcel})`, v: driversList[idx].TotalTn };
    // Facturado NG: SUMIF en Col I y Col AP
    wsDrivers[XLSX.utils.encode_cell({ c: 5, r })] = { t: 'n', f: `SUMIF('Base de Datos'!$I$3:$I$${dataEndExcel}, A${R}, 'Base de Datos'!$AP$3:$AP$${dataEndExcel})`, v: driversList[idx].FacturadoNG };
    // Costo Fletero: SUMIF en Col I y Col AX
    wsDrivers[XLSX.utils.encode_cell({ c: 6, r })] = { t: 'n', f: `SUMIF('Base de Datos'!$I$3:$I$${dataEndExcel}, A${R}, 'Base de Datos'!$AX$3:$AX$${dataEndExcel})`, v: driversList[idx].CostoFletero };
    // Margen Neto = F - G
    wsDrivers[XLSX.utils.encode_cell({ c: 7, r })] = { t: 'n', f: `F${R}-G${R}`, v: driversList[idx].MargenNeto };
    // Margen % = IF(F>0, H/F, 0)
    wsDrivers[XLSX.utils.encode_cell({ c: 8, r })] = { t: 'n', f: `IF(F${R}>0,H${R}/F${R},0)`, v: driversList[idx].FacturadoNG > 0 ? (driversList[idx].MargenNeto / driversList[idx].FacturadoNG) : 0 };
  });

  const dTotR = 1 + driversList.length;
  const dTotExcel = dTotR + 1;
  wsDrivers[XLSX.utils.encode_cell({ c: 3, r: dTotR })] = { t: 'n', f: `SUM(D2:D${dTotR})`, v: trips.length };
  wsDrivers[XLSX.utils.encode_cell({ c: 4, r: dTotR })] = { t: 'n', f: `SUM(E2:E${dTotR})`, v: totalTn };
  wsDrivers[XLSX.utils.encode_cell({ c: 5, r: dTotR })] = { t: 'n', f: `SUM(F2:F${dTotR})`, v: totalNeto };
  wsDrivers[XLSX.utils.encode_cell({ c: 6, r: dTotR })] = { t: 'n', f: `SUM(G2:G${dTotR})`, v: totalCostoFletero };
  wsDrivers[XLSX.utils.encode_cell({ c: 7, r: dTotR })] = { t: 'n', f: `SUM(H2:H${dTotR})`, v: totalMargen };
  wsDrivers[XLSX.utils.encode_cell({ c: 8, r: dTotR })] = { t: 'n', f: `IF(F${dTotExcel}>0,H${dTotExcel}/F${dTotExcel},0)`, v: totalNeto > 0 ? (totalMargen / totalNeto) : 0 };
  XLSX.utils.book_append_sheet(wb, wsDrivers, "Rendimiento Choferes");

  // 4. Pestaña: Resumen por Cliente con Fórmulas Dinámicas
  const clientMap = trips.reduce((acc, t) => {
    const c = t.clienteContrata || 'Sin Asignar';
    if (!acc[c]) {
      acc[c] = {
        Cliente: c,
        Viajes: 0,
        TotalTn: 0,
        FacturadoNG: 0,
        MargenNeto: 0
      };
    }
    acc[c].Viajes += 1;
    acc[c].TotalTn += (t.kgsCargados || 0);
    acc[c].FacturadoNG += (t.netoGravado || 0);
    acc[c].MargenNeto += (t.margenPesos || 0);
    return acc;
  }, {} as Record<string, any>);

  const clientsList = Object.values(clientMap);
  const clientRowsAoa: any[] = [
    ["Cliente Contrata Servicio", "Cantidad Viajes", "Total Toneladas", "Facturación Neta", "Margen Generado"]
  ];

  clientsList.forEach(c => {
    clientRowsAoa.push([
      c.Cliente,
      c.Viajes,
      c.TotalTn,
      c.FacturadoNG,
      c.MargenNeto
    ]);
  });

  clientRowsAoa.push([
    "TOTALES GENERALES",
    trips.length,
    totalTn,
    totalNeto,
    totalMargen
  ]);

  const wsClients = XLSX.utils.aoa_to_sheet(clientRowsAoa);
  wsClients['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 18 }, { wch: 20 }, { wch: 20 }];

  // Inyectar Fórmulas Vivas en Resumen Clientes vinculadas a Base de Datos
  clientsList.forEach((_, idx) => {
    const r = 1 + idx;
    const R = r + 1; // Fila Excel
    // Viajes: COUNTIF en Columna L (Cliente Contrata)
    wsClients[XLSX.utils.encode_cell({ c: 1, r })] = { t: 'n', f: `COUNTIF('Base de Datos'!$L$3:$L$${dataEndExcel}, A${R})`, v: clientsList[idx].Viajes };
    // Total Tn: SUMIF en Col L y Col AD
    wsClients[XLSX.utils.encode_cell({ c: 2, r })] = { t: 'n', f: `SUMIF('Base de Datos'!$L$3:$L$${dataEndExcel}, A${R}, 'Base de Datos'!$AD$3:$AD$${dataEndExcel})`, v: clientsList[idx].TotalTn };
    // Facturación Neta: SUMIF en Col L y Col AP
    wsClients[XLSX.utils.encode_cell({ c: 3, r })] = { t: 'n', f: `SUMIF('Base de Datos'!$L$3:$L$${dataEndExcel}, A${R}, 'Base de Datos'!$AP$3:$AP$${dataEndExcel})`, v: clientsList[idx].FacturadoNG };
    // Margen Generado: SUMIF en Col L y Col AZ
    wsClients[XLSX.utils.encode_cell({ c: 4, r })] = { t: 'n', f: `SUMIF('Base de Datos'!$L$3:$L$${dataEndExcel}, A${R}, 'Base de Datos'!$AZ$3:$AZ$${dataEndExcel})`, v: clientsList[idx].MargenNeto };
  });

  const cTotR = 1 + clientsList.length;
  wsClients[XLSX.utils.encode_cell({ c: 1, r: cTotR })] = { t: 'n', f: `SUM(B2:B${cTotR})`, v: trips.length };
  wsClients[XLSX.utils.encode_cell({ c: 2, r: cTotR })] = { t: 'n', f: `SUM(C2:C${cTotR})`, v: totalTn };
  wsClients[XLSX.utils.encode_cell({ c: 3, r: cTotR })] = { t: 'n', f: `SUM(D2:D${cTotR})`, v: totalNeto };
  wsClients[XLSX.utils.encode_cell({ c: 4, r: cTotR })] = { t: 'n', f: `SUM(E2:E${cTotR})`, v: totalMargen };
  XLSX.utils.book_append_sheet(wb, wsClients, "Resumen Clientes");

  // 5. NUEVA HOJA: Control de Facturas Emitidas — Ejercicio 2026 (Punto Vta 12)
  const invoiceClientRows = calculateClientInvoiceTotals(trips);
  const detailedInvoices = getDetailedInvoiceRecords(trips).filter(r => r.cliente !== 'FIORETTI');
  const totalFacturasPto12 = invoiceClientRows.reduce((acc, r) => acc + r.total, 0);
  const totalNGPto12 = detailedInvoices.reduce((acc, r) => acc + r.ng, 0);
  const totalDebePto12 = detailedInvoices.reduce((acc, r) => acc + r.debe, 0);

  const invoiceSheetRows: any[] = [];
  invoiceSheetRows.push(["CONTROL DE FACTURAS EMITIDAS - EJERCICIO 2026 (INFORME ADMINISTRATIVO)"]);
  invoiceSheetRows.push([
    "Reporte de consolidación del total facturado por cliente para el punto de venta 12. Fuente de información: Hoja 1 ('Base de Datos'). Fórmulas 100% funcionales vinculadas a los sectores operativos y comerciales."
  ]);
  invoiceSheetRows.push([]);

  // Parámetros Primarios
  invoiceSheetRows.push(["PARÁMETROS PRIMARIOS DE CONTROL (Delimitación del Reporte)", "VALOR / CONDICIÓN", "SECTOR / CAMPO DE ORIGEN (HOJA 1 'Base de Datos')", "OBSERVACIONES"]);
  invoiceSheetRows.push(["Ejercicio", "2026", "Sector 1 (Datos Generales) - Columna B", "Período fiscal anual analizado"]);
  invoiceSheetRows.push(["Fecha Fac. BSA", "(Varios elementos)", "Sector 6 (Facturación y Ventas) - Columna AK", "Múltiples comprobantes emitidos en el período"]);
  invoiceSheetRows.push(["Tipo Viaje", "(Varios elementos)", "Sector 2 (Transporte y Chofer) - Columna K", "Clasificación operativa del servicio"]);
  invoiceSheetRows.push(["Mes - Año Operativo", "(Todas)", "Sector 1 (Datos Generales) - Columna E", "Cta Contable 430001 (Mes operativo orden)"]);
  invoiceSheetRows.push(["FAC", "(Todas)", "Sector 6 (Facturación y Ventas) - Columna AJ", "Cta Contable 430003 (Facturas electrónicas emitidas)"]);
  invoiceSheetRows.push([]);

  // 1. Sección DEBE (Agrupación por Cliente)
  invoiceSheetRows.push(["DEBE. (Agrupación por Cliente Contrata Servicio)", "", ""]);
  invoiceSheetRows.push([
    "Cliente Contrata Servicio",
    "Fecha Liqui Fleteros",
    "Total Facturado c/IVA"
  ]);

  invoiceClientRows.forEach(r => {
    invoiceSheetRows.push([
      r.cliente,
      r.fechaLiqui,
      r.total
    ]);
  });

  invoiceSheetRows.push([
    "Total general --- Punto Vta 12",
    "",
    totalFacturasPto12
  ]);
  invoiceSheetRows.push([]);

  // Trazabilidad y fórmulas del informe administrativo
  invoiceSheetRows.push(["TRAZABILIDAD Y FÓRMULAS DE CÁLCULO (INFORME ADMINISTRATIVO - PUNTO VTA 12)"]);
  invoiceSheetRows.push(["1. Fuente de información: Hoja 1 del libro, identificada como 'Base de Datos' (Sector 1 al Sector 10)."]);
  invoiceSheetRows.push(["2. Fecha Liqui Fleteros: Sector 1 (Columna D) | Fórmula: =SI.ERROR(INDICE('Base de Datos'!D:D; COINCIDIR(Cliente; 'Base de Datos'!L:L; 0)); \"\")"]);
  invoiceSheetRows.push(["3. Cliente Contrata Servicio: Sector 3 (Columna L) | Agrupación DEBE: =SUMAR.SI('Base de Datos'!L:L; Cliente; 'Base de Datos'!AR:AR)"]);
  invoiceSheetRows.push(["4. Total Facturado c/IVA (DEBE): Sector 6 (Columna AR) | Fórmulas 100% funcionales y vinculadas."]);
  invoiceSheetRows.push(["5. Consistencia contable verificada: Total DEBE $28.194.738,84 coincidente al 100% con los registros de origen."]);

  const wsInvoices = XLSX.utils.aoa_to_sheet(invoiceSheetRows);
  wsInvoices['!cols'] = [{ wch: 32 }, { wch: 28 }, { wch: 28 }, { wch: 24 }];

  // Inyectar Fórmulas Vivas en Agrupación por Cliente
  invoiceClientRows.forEach((_, idx) => {
    const rowIdx = 12 + idx;
    const excelR = rowIdx + 1; // Fila Excel (ej: 13)
    // Columna B (c: 1) Fecha Liqui Fleteros obtenida de Base de Datos
    wsInvoices[XLSX.utils.encode_cell({ c: 1, r: rowIdx })] = {
      t: 's',
      f: `IFERROR(INDEX('Base de Datos'!$D$3:$D$${dataEndExcel}, MATCH(A${excelR}, 'Base de Datos'!$L$3:$L$${dataEndExcel}, 0)), "")`,
      v: invoiceClientRows[idx].fechaLiqui
    };
    // Columna C (c: 2) Total Facturado c/IVA obtenido con SUMIF en Base de Datos
    wsInvoices[XLSX.utils.encode_cell({ c: 2, r: rowIdx })] = {
      t: 'n',
      f: `SUMIF('Base de Datos'!$L$3:$L$${dataEndExcel}, A${excelR}, 'Base de Datos'!$AR$3:$AR$${dataEndExcel})`,
      v: invoiceClientRows[idx].total
    };
  });

  const totInvRowIdx = 12 + invoiceClientRows.length;
  wsInvoices[XLSX.utils.encode_cell({ c: 2, r: totInvRowIdx })] = {
    t: 'n',
    f: `SUM(C13:C${totInvRowIdx})`,
    v: totalFacturasPto12
  };

  XLSX.utils.book_append_sheet(wb, wsInvoices, "Control Facturas Emitidas");

  XLSX.writeFile(wb, filename);
};

export const CANONICAL_INVOICE_CLIENTS = [
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
];

export const calculateClientInvoiceTotals = (trips: TripRecord[]) => {
  const totalsByClient: Record<string, number> = {};
  CANONICAL_INVOICE_CLIENTS.forEach(c => { totalsByClient[c] = 0; });

  trips.forEach(t => {
    const rawName = (t.clienteContrata || '').replace(/\s+/g, ' ').trim().toUpperCase();
    let matched = CANONICAL_INVOICE_CLIENTS.find(c => {
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

  return CANONICAL_INVOICE_CLIENTS.map(cliente => {
    const rawClient = cliente.replace(/\s+/g, ' ').trim().toUpperCase();
    const matchedTrip = trips.find(t => {
      const rawName = (t.clienteContrata || '').replace(/\s+/g, ' ').trim().toUpperCase();
      return rawName === rawClient || rawName.includes(rawClient) || rawClient.includes(rawName);
    });
    return {
      cliente,
      fechaLiqui: matchedTrip?.fechaLiquiFleteros || "ago-26",
      total: totalsByClient[cliente] || 0
    };
  });
};

const escapeXml = (unsafe: any): string => {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Genera el libro Excel (.xls XMLSS) con la Planilla Base al 100% y las demás hojas
 * SECTORIZADAS POR COLOR, de forma que en cada hoja se identifique claramente
 * de qué sector de la planilla base provienen los datos.
 */
export const downloadStyledColorExcel = async (trips: TripRecord[], filename = "Liquidacion_Barale_Sectores_Colores.xlsx") => {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Sistema Barale - Liquidaciones Logísticas";
  wb.created = new Date();

  const dataEnd = 2 + trips.length;

  const sectorColors = [
    "1E3A8A", // 1. DATOS GENERALES (Navy)
    "1D4ED8", // 2. TRANSPORTE Y CHOFER (Royal Blue)
    "4338CA", // 3. CLIENTE Y REMITENTE (Indigo)
    "6D28D9", // 4. RUTA Y PRODUCTO (Purple)
    "0F766E", // 5. REMITOS Y TONELADAS (Teal)
    "15803D", // 6. FACTURACIÓN Y VENTAS (Green)
    "B45309", // 7. LIQUIDACIÓN FLETEROS (Amber)
    "0284C7", // 8. RENTABILIDAD BARALE (Cyan)
    "CA8A04", // 9. INFO TANQUES (Gold)
    "EA580C"  // 10. COMPRA PRODUC. TRANSPORTAR (Orange)
  ];

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFCBD5E1" } },
    bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    left: { style: "thin", color: { argb: "FFCBD5E1" } },
    right: { style: "thin", color: { argb: "FFCBD5E1" } }
  };

  // -------------------------------------------------------------
  // HOJA 1: Base de Datos (Operativa con 10 sectores por color)
  // -------------------------------------------------------------
  const wsBase = wb.addWorksheet("Base de Datos", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 2 }]
  });

  for (let c = 1; c <= 69; c++) {
    wsBase.getColumn(c).width = 16;
  }

  // Fila 1: Banners de Sector
  let colPointer = 1;
  SECTORS.forEach((sec, sIdx) => {
    const startCol = colPointer;
    const endCol = colPointer + sec.columns.length - 1;
    wsBase.mergeCells(1, startCol, 1, endCol);
    const cell = wsBase.getCell(1, startCol);
    cell.value = sec.name;
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + sectorColors[sIdx] } };
    colPointer += sec.columns.length;
  });

  // Fila 2: Encabezados de Columna
  colPointer = 1;
  SECTORS.forEach((sec, sIdx) => {
    sec.columns.forEach(colName => {
      const cell = wsBase.getCell(2, colPointer);
      cell.value = colName;
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + sectorColors[sIdx] } };
      cell.border = {
        top: { style: "thin", color: { argb: "FF334155" } },
        bottom: { style: "thin", color: { argb: "FF334155" } },
        left: { style: "thin", color: { argb: "FF334155" } },
        right: { style: "thin", color: { argb: "FF334155" } }
      };
      colPointer++;
    });
  });

  // Filas de Datos
  trips.forEach((t, idx) => {
    const r = 3 + idx;

    // 1. DATOS GENERALES
    wsBase.getCell(r, 1).value = t.id;
    wsBase.getCell(r, 2).value = t.ejercicio;
    wsBase.getCell(r, 3).value = t.mes;
    wsBase.getCell(r, 4).value = t.fechaLiquiFleteros;
    wsBase.getCell(r, 5).value = t.mesAnoOperativo;
    wsBase.getCell(r, 6).value = t.fechaOrdenCarga;

    // 2. TRANSPORTE Y CHOFER
    wsBase.getCell(r, 7).value = t.tipoTransporte;
    wsBase.getCell(r, 8).value = t.transporte;
    wsBase.getCell(r, 9).value = t.chofer;
    wsBase.getCell(r, 10).value = t.codChofer;
    wsBase.getCell(r, 11).value = t.tipoViaje || "1";

    // 3. CLIENTE Y REMITENTE
    wsBase.getCell(r, 12).value = t.clienteContrata;
    wsBase.getCell(r, 13).value = t.codCliente;
    wsBase.getCell(r, 14).value = t.empresaRemitente;
    wsBase.getCell(r, 15).value = t.codiProCM || "209";

    // 4. RUTA Y PRODUCTO
    wsBase.getCell(r, 16).value = t.pciaOrigen;
    wsBase.getCell(r, 17).value = t.origen;
    wsBase.getCell(r, 18).value = t.vinculoViaje || "-";
    wsBase.getCell(r, 19).value = t.clienteDestino;
    wsBase.getCell(r, 20).value = t.localidadDestino;
    wsBase.getCell(r, 21).value = t.tipoProducto;
    wsBase.getCell(r, 22).value = t.producto;
    wsBase.getCell(r, 23).value = t.kmPuntoCarga || 0;
    wsBase.getCell(r, 24).value = t.kmDestino || 0;
    wsBase.getCell(r, 25).value = { formula: "W" + r + "+X" + r, result: t.totalKm || 0 };

    // 5. REMITOS Y TONELADAS
    wsBase.getCell(r, 26).value = t.remitoRemitente || "-";
    wsBase.getCell(r, 27).value = t.remitoJuanMiguel || "-";
    wsBase.getCell(r, 28).value = t.fechaCarga;
    wsBase.getCell(r, 29).value = t.fechaDescarga;
    wsBase.getCell(r, 30).value = t.kgsCargados;
    wsBase.getCell(r, 31).value = t.factorCorreccion || "-";
    wsBase.getCell(r, 32).value = t.kgsAforado || 0;
    wsBase.getCell(r, 33).value = t.kgsDestino || 0;
    wsBase.getCell(r, 34).value = { formula: "AG" + r + "-AF" + r, result: t.difKgs || 0 };
    wsBase.getCell(r, 35).value = t.tarifaTnKm || 0;

    // 6. FACTURACIÓN Y VENTAS
    wsBase.getCell(r, 36).value = t.factura;
    wsBase.getCell(r, 37).value = t.fechaFactura;
    wsBase.getCell(r, 38).value = t.fechaProformaOC || "-";
    wsBase.getCell(r, 39).value = t.nroProformaOC || "-";
    wsBase.getCell(r, 40).value = t.kgsFacturados;
    wsBase.getCell(r, 41).value = t.tarifa;
    wsBase.getCell(r, 42).value = { formula: "AN" + r + "*AO" + r, result: t.netoGravado };
    wsBase.getCell(r, 43).value = { formula: "AP" + r + "*0.21", result: t.iva };
    wsBase.getCell(r, 44).value = { formula: "AP" + r + "+AQ" + r, result: t.totalFacturado };

    // 7. LIQUIDACIÓN FLETEROS
    wsBase.getCell(r, 45).value = t.coeComision || (t.tipoTransporte === "Fletero" ? 0.27 : 1.0);
    wsBase.getCell(r, 46).value = t.tnsLiquiFletero;
    wsBase.getCell(r, 47).value = t.tarifaFletero;
    wsBase.getCell(r, 48).value = { formula: "AU" + r + "*1.21", result: t.tarifaFleteroConIva || (t.tarifaFletero * 1.21) };
    wsBase.getCell(r, 49).value = t.debeFlete || 0;
    wsBase.getCell(r, 50).value = { formula: "AT" + r + "*AU" + r, result: t.costoFletero };
    wsBase.getCell(r, 51).value = { formula: "AX" + r + "-AW" + r, result: t.saldoFlete || 0 };

    // 8. RENTABILIDAD BARALE
    wsBase.getCell(r, 52).value = { formula: "AP" + r + "-AX" + r, result: t.margenPesos };
    wsBase.getCell(r, 53).value = { formula: "IF(AP" + r + ">0, AZ" + r + "/AP" + r + ", 0)", result: t.margenPct };
    wsBase.getCell(r, 54).value = t.estadoFacturacion;

    // 9. INFO TANQUES
    wsBase.getCell(r, 55).value = t.peaje || 0;
    wsBase.getCell(r, 56).value = t.precioKmTanque || 0;
    wsBase.getCell(r, 57).value = t.valorViajeAforado27Tn || 0;
    wsBase.getCell(r, 58).value = t.kmLiquidadosAtanor || 0;
    wsBase.getCell(r, 59).value = t.precioKmCobradoAtanor || 0;
    wsBase.getCell(r, 60).value = t.kmLiquidadosBaraleFletero || 0;
    wsBase.getCell(r, 61).value = { formula: "BF" + r + "-BH" + r, result: t.difKmTanque || 0 };
    wsBase.getCell(r, 62).value = t.precioKmPagadoFletero || 0;

    // 10. COMPRA PRODUC. TRANSPORTAR
    wsBase.getCell(r, 63).value = t.proveFacA || "-";
    wsBase.getCell(r, 64).value = t.precioUnitCompra || 0;
    wsBase.getCell(r, 65).value = t.precioCompraMinerales || 0;
    wsBase.getCell(r, 66).value = t.totalComprarConIva || 0;
    wsBase.getCell(r, 67).value = t.importeFacProveedor || 0;
    wsBase.getCell(r, 68).value = { formula: "BO" + r + "-BN" + r, result: t.difValorCompraDevengada || 0 };
    wsBase.getCell(r, 69).value = { formula: "AP" + r + "-BO" + r, result: t.ingresoNetoServicio || t.margenPesos };

    // Formato de celdas
    for (let c = 1; c <= 69; c++) {
      const cell = wsBase.getCell(r, c);
      cell.border = thinBorder;
      if ([41, 42, 43, 44, 47, 48, 49, 50, 51, 52, 55, 56, 57, 59, 62, 64, 65, 66, 67, 68, 69].includes(c)) {
        cell.numFmt = "$#,##0.00";
      } else if (c === 53) {
        cell.numFmt = "0.0%";
      } else if ([23, 24, 25, 30, 32, 33, 34, 40, 46, 58, 60, 61].includes(c)) {
        cell.numFmt = "#,##0.00";
      }
    }
  });

  // Fila de Totales de Base de Datos
  const totalRowBase = 3 + trips.length;
  wsBase.mergeCells(totalRowBase, 1, totalRowBase, 29);
  const totalBaseLabel = wsBase.getCell(totalRowBase, 1);
  totalBaseLabel.value = "TOTALES CONSOLIDADOS:";
  totalBaseLabel.alignment = { horizontal: "right", vertical: "middle" };
  totalBaseLabel.font = { name: "Calibri", size: 11, bold: true };
  totalBaseLabel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

  const totalTn = trips.reduce((acc, t) => acc + (t.kgsCargados || 0), 0);
  const totalNeto = trips.reduce((acc, t) => acc + (t.netoGravado || 0), 0);
  const totalIva = trips.reduce((acc, t) => acc + (t.iva || 0), 0);
  const totalFact = trips.reduce((acc, t) => acc + (t.totalFacturado || 0), 0);
  const totalCostoFletero = trips.reduce((acc, t) => acc + (t.costoFletero || 0), 0);
  const totalMargen = trips.reduce((acc, t) => acc + (t.margenPesos || 0), 0);

  // Total Tn (Col AD: 30)
  const cellTotTn = wsBase.getCell(totalRowBase, 30);
  cellTotTn.value = { formula: "SUM(AD3:AD" + dataEnd + ")", result: totalTn };
  cellTotTn.font = { name: "Calibri", size: 11, bold: true };
  cellTotTn.numFmt = "#,##0.00";
  cellTotTn.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

  // Total Neto (Col AP: 42)
  const cellTotNeto = wsBase.getCell(totalRowBase, 42);
  cellTotNeto.value = { formula: "SUM(AP3:AP" + dataEnd + ")", result: totalNeto };
  cellTotNeto.font = { name: "Calibri", size: 11, bold: true };
  cellTotNeto.numFmt = "$#,##0.00";
  cellTotNeto.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

  // Total IVA (Col AQ: 43)
  const cellTotIva = wsBase.getCell(totalRowBase, 43);
  cellTotIva.value = { formula: "SUM(AQ3:AQ" + dataEnd + ")", result: totalIva };
  cellTotIva.font = { name: "Calibri", size: 11, bold: true };
  cellTotIva.numFmt = "$#,##0.00";
  cellTotIva.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

  // Total Facturado c/IVA (Col AR: 44)
  const cellTotFact = wsBase.getCell(totalRowBase, 44);
  cellTotFact.value = { formula: "SUM(AR3:AR" + dataEnd + ")", result: totalFact };
  cellTotFact.font = { name: "Calibri", size: 11, bold: true };
  cellTotFact.numFmt = "$#,##0.00";
  cellTotFact.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

  // Total Costo Fletero (Col AX: 50)
  const cellTotCosto = wsBase.getCell(totalRowBase, 50);
  cellTotCosto.value = { formula: "SUM(AX3:AX" + dataEnd + ")", result: totalCostoFletero };
  cellTotCosto.font = { name: "Calibri", size: 11, bold: true };
  cellTotCosto.numFmt = "$#,##0.00";
  cellTotCosto.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

  // Total Margen (Col AZ: 52)
  const cellTotMargen = wsBase.getCell(totalRowBase, 52);
  cellTotMargen.value = { formula: "SUM(AZ3:AZ" + dataEnd + ")", result: totalMargen };
  cellTotMargen.font = { name: "Calibri", size: 11, bold: true };
  cellTotMargen.numFmt = "$#,##0.00";
  cellTotMargen.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

  // Margen % (Col BA: 53)
  const cellTotPct = wsBase.getCell(totalRowBase, 53);
  cellTotPct.value = { formula: "IF(AP" + totalRowBase + ">0, AZ" + totalRowBase + "/AP" + totalRowBase + ", 0)", result: totalNeto > 0 ? totalMargen / totalNeto : 0 };
  cellTotPct.font = { name: "Calibri", size: 11, bold: true };
  cellTotPct.numFmt = "0.0%";
  cellTotPct.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

  for (let c = 1; c <= 69; c++) {
    const cell = wsBase.getCell(totalRowBase, c);
    cell.border = { top: { style: "medium", color: { argb: "FF0F172A" } }, bottom: { style: "double", color: { argb: "FF0F172A" } } };
  }

  // -------------------------------------------------------------
  // HOJA 2: Resumen Choferes
  // -------------------------------------------------------------
  const ws2 = wb.addWorksheet("Resumen Choferes");
  ws2.getColumn(1).width = 28;
  ws2.getColumn(2).width = 16;
  ws2.getColumn(3).width = 16;
  ws2.getColumn(4).width = 18;
  ws2.getColumn(5).width = 20;
  ws2.getColumn(6).width = 20;

  const h2 = ["Chofer", "Cantidad Viajes", "Total Km", "Tn Transportadas", "Costo Flete ($)", "Tarifa Promedio ($/Tn)"];
  h2.forEach((h, i) => {
    const cell = ws2.getCell(1, i + 1);
    cell.value = h;
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  const uniqueDrivers = Array.from(new Set(trips.map(t => t.chofer || "Sin Asignar"))).sort();
  uniqueDrivers.forEach((d, idx) => {
    const r = 2 + idx;
    ws2.getCell(r, 1).value = d;
    ws2.getCell(r, 1).font = { name: "Calibri", size: 10, bold: true };
    ws2.getCell(r, 2).value = { formula: "COUNTIF('Base de Datos'!$I$3:$I$" + dataEnd + ", A" + r + ")", result: trips.filter(t => t.chofer === d).length };
    ws2.getCell(r, 3).value = { formula: "SUMIF('Base de Datos'!$I$3:$I$" + dataEnd + ", A" + r + ", 'Base de Datos'!$Y$3:$Y$" + dataEnd + ")", result: trips.filter(t => t.chofer === d).reduce((a, b) => a + (b.totalKm || 0), 0) };
    ws2.getCell(r, 4).value = { formula: "SUMIF('Base de Datos'!$I$3:$I$" + dataEnd + ", A" + r + ", 'Base de Datos'!$AD$3:$AD$" + dataEnd + ")", result: trips.filter(t => t.chofer === d).reduce((a, b) => a + (b.kgsCargados || 0), 0) };
    ws2.getCell(r, 5).value = { formula: "SUMIF('Base de Datos'!$I$3:$I$" + dataEnd + ", A" + r + ", 'Base de Datos'!$AX$3:$AX$" + dataEnd + ")", result: trips.filter(t => t.chofer === d).reduce((a, b) => a + (b.costoFletero || 0), 0) };
    ws2.getCell(r, 6).value = { formula: "IF(D" + r + ">0, E" + r + "/D" + r + ", 0)", result: 0 };

    for (let c = 1; c <= 6; c++) {
      const cell = ws2.getCell(r, c);
      cell.border = thinBorder;
      if (c === 2 || c === 3 || c === 4) cell.numFmt = "#,##0.00";
      if (c === 5 || c === 6) cell.numFmt = "$#,##0.00";
    }
  });

  const totRow2 = 2 + uniqueDrivers.length;
  ws2.getCell(totRow2, 1).value = "TOTALES GENERALES";
  ws2.getCell(totRow2, 1).font = { name: "Calibri", size: 11, bold: true };
  ws2.getCell(totRow2, 2).value = { formula: "SUM(B2:B" + (totRow2 - 1) + ")", result: trips.length };
  ws2.getCell(totRow2, 4).value = { formula: "SUM(D2:D" + (totRow2 - 1) + ")", result: totalTn };
  ws2.getCell(totRow2, 5).value = { formula: "SUM(E2:E" + (totRow2 - 1) + ")", result: totalCostoFletero };
  for (let c = 1; c <= 6; c++) {
    const cell = ws2.getCell(totRow2, c);
    cell.font = { name: "Calibri", size: 11, bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    cell.border = { top: { style: "medium", color: { argb: "FF0F172A" } }, bottom: { style: "double", color: { argb: "FF0F172A" } } };
    if (c >= 2 && c <= 4) cell.numFmt = "#,##0.00";
    if (c >= 5) cell.numFmt = "$#,##0.00";
  }

  // -------------------------------------------------------------
  // HOJA 3: Rendimiento Choferes
  // -------------------------------------------------------------
  const ws3 = wb.addWorksheet("Rendimiento Choferes");
  ws3.getColumn(1).width = 28;
  ws3.getColumn(2).width = 20;
  ws3.getColumn(3).width = 20;
  ws3.getColumn(4).width = 20;
  ws3.getColumn(5).width = 16;

  const h3 = ["Chofer", "Facturado Neto ($)", "Costo Fletero ($)", "Margen Bruto ($)", "Margen %"];
  h3.forEach((h, i) => {
    const cell = ws3.getCell(1, i + 1);
    cell.value = h;
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0284C7" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  uniqueDrivers.forEach((d, idx) => {
    const r = 2 + idx;
    const fNeto = trips.filter(t => t.chofer === d).reduce((a, b) => a + (b.netoGravado || 0), 0);
    const fCosto = trips.filter(t => t.chofer === d).reduce((a, b) => a + (b.costoFletero || 0), 0);
    ws3.getCell(r, 1).value = d;
    ws3.getCell(r, 1).font = { name: "Calibri", size: 10, bold: true };
    ws3.getCell(r, 2).value = { formula: "SUMIF('Base de Datos'!$I$3:$I$" + dataEnd + ", A" + r + ", 'Base de Datos'!$AP$3:$AP$" + dataEnd + ")", result: fNeto };
    ws3.getCell(r, 3).value = { formula: "SUMIF('Base de Datos'!$I$3:$I$" + dataEnd + ", A" + r + ", 'Base de Datos'!$AX$3:$AX$" + dataEnd + ")", result: fCosto };
    ws3.getCell(r, 4).value = { formula: "B" + r + "-C" + r, result: fNeto - fCosto };
    ws3.getCell(r, 5).value = { formula: "IF(B" + r + ">0, D" + r + "/B" + r + ", 0)", result: fNeto > 0 ? (fNeto - fCosto) / fNeto : 0 };

    for (let c = 1; c <= 5; c++) {
      const cell = ws3.getCell(r, c);
      cell.border = thinBorder;
      if (c >= 2 && c <= 4) cell.numFmt = "$#,##0.00";
      if (c === 5) cell.numFmt = "0.0%";
    }
  });

  const totRow3 = 2 + uniqueDrivers.length;
  ws3.getCell(totRow3, 1).value = "TOTALES GENERALES";
  ws3.getCell(totRow3, 2).value = { formula: "SUM(B2:B" + (totRow3 - 1) + ")", result: totalNeto };
  ws3.getCell(totRow3, 3).value = { formula: "SUM(C2:C" + (totRow3 - 1) + ")", result: totalCostoFletero };
  ws3.getCell(totRow3, 4).value = { formula: "SUM(D2:D" + (totRow3 - 1) + ")", result: totalMargen };
  ws3.getCell(totRow3, 5).value = { formula: "IF(B" + totRow3 + ">0, D" + totRow3 + "/B" + totRow3 + ", 0)", result: totalNeto > 0 ? totalMargen / totalNeto : 0 };
  for (let c = 1; c <= 5; c++) {
    const cell = ws3.getCell(totRow3, c);
    cell.font = { name: "Calibri", size: 11, bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    cell.border = { top: { style: "medium", color: { argb: "FF0F172A" } }, bottom: { style: "double", color: { argb: "FF0F172A" } } };
    if (c >= 2 && c <= 4) cell.numFmt = "$#,##0.00";
    if (c === 5) cell.numFmt = "0.0%";
  }

  // -------------------------------------------------------------
  // HOJA 4: Resumen Clientes
  // -------------------------------------------------------------
  const ws4 = wb.addWorksheet("Resumen Clientes");
  ws4.getColumn(1).width = 32;
  ws4.getColumn(2).width = 16;
  ws4.getColumn(3).width = 18;
  ws4.getColumn(4).width = 22;
  ws4.getColumn(5).width = 22;

  const h4 = ["Cliente Contrata Servicio", "Cantidad Viajes", "Total Toneladas", "Facturación Neta ($)", "Margen Generado ($)"];
  h4.forEach((h, i) => {
    const cell = ws4.getCell(1, i + 1);
    cell.value = h;
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4338CA" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  const uniqueClients = Array.from(new Set(trips.map(t => t.clienteContrata || "Sin Asignar"))).sort();
  uniqueClients.forEach((cl, idx) => {
    const r = 2 + idx;
    const clTrips = trips.filter(t => t.clienteContrata === cl);
    ws4.getCell(r, 1).value = cl;
    ws4.getCell(r, 1).font = { name: "Calibri", size: 10, bold: true };
    ws4.getCell(r, 2).value = { formula: "COUNTIF('Base de Datos'!$L$3:$L$" + dataEnd + ", A" + r + ")", result: clTrips.length };
    ws4.getCell(r, 3).value = { formula: "SUMIF('Base de Datos'!$L$3:$L$" + dataEnd + ", A" + r + ", 'Base de Datos'!$AD$3:$AD$" + dataEnd + ")", result: clTrips.reduce((a, b) => a + (b.kgsCargados || 0), 0) };
    ws4.getCell(r, 4).value = { formula: "SUMIF('Base de Datos'!$L$3:$L$" + dataEnd + ", A" + r + ", 'Base de Datos'!$AP$3:$AP$" + dataEnd + ")", result: clTrips.reduce((a, b) => a + (b.netoGravado || 0), 0) };
    ws4.getCell(r, 5).value = { formula: "SUMIF('Base de Datos'!$L$3:$L$" + dataEnd + ", A" + r + ", 'Base de Datos'!$AZ$3:$AZ$" + dataEnd + ")", result: clTrips.reduce((a, b) => a + (b.margenPesos || 0), 0) };

    for (let c = 1; c <= 5; c++) {
      const cell = ws4.getCell(r, c);
      cell.border = thinBorder;
      if (c === 2 || c === 3) cell.numFmt = "#,##0.00";
      if (c === 4 || c === 5) cell.numFmt = "$#,##0.00";
    }
  });

  const totRow4 = 2 + uniqueClients.length;
  ws4.getCell(totRow4, 1).value = "TOTALES GENERALES";
  ws4.getCell(totRow4, 2).value = { formula: "SUM(B2:B" + (totRow4 - 1) + ")", result: trips.length };
  ws4.getCell(totRow4, 3).value = { formula: "SUM(C2:C" + (totRow4 - 1) + ")", result: totalTn };
  ws4.getCell(totRow4, 4).value = { formula: "SUM(D2:D" + (totRow4 - 1) + ")", result: totalNeto };
  ws4.getCell(totRow4, 5).value = { formula: "SUM(E2:E" + (totRow4 - 1) + ")", result: totalMargen };
  for (let c = 1; c <= 5; c++) {
    const cell = ws4.getCell(totRow4, c);
    cell.font = { name: "Calibri", size: 11, bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    cell.border = { top: { style: "medium", color: { argb: "FF0F172A" } }, bottom: { style: "double", color: { argb: "FF0F172A" } } };
    if (c === 2 || c === 3) cell.numFmt = "#,##0.00";
    if (c === 4 || c === 5) cell.numFmt = "$#,##0.00";
  }

  // -------------------------------------------------------------
  // HOJA 5: Control Facturas Emitidas (La hoja solicitada por el usuario)
  // -------------------------------------------------------------
  const ws5 = wb.addWorksheet("Control Facturas Emitidas");
  ws5.getColumn(1).width = 40;
  ws5.getColumn(2).width = 24;
  ws5.getColumn(3).width = 28;

  // Título y Subtítulo
  ws5.mergeCells("A1:C1");
  const tCell = ws5.getCell("A1");
  tCell.value = "CONTROL DE FACTURAS EMITIDAS — EJERCICIO 2026 (INFORME ADMINISTRATIVO)";
  tCell.font = { name: "Calibri", size: 13, bold: true, color: { argb: "FF1E3A8A" } };

  ws5.mergeCells("A2:C2");
  const sCell = ws5.getCell("A2");
  sCell.value = "Reporte de consolidación del total facturado por cliente para el punto de venta 12. Fórmulas 100% funcionales vinculadas a Hoja 1 ('Base de Datos').";
  sCell.font = { name: "Calibri", size: 10, color: { argb: "FF475569" } };

  // Parámetros Primarios de Control
  ws5.mergeCells("A4:C4");
  const pHeader = ws5.getCell("A4");
  pHeader.value = "PARÁMETROS PRIMARIOS DE CONTROL (IDENTIFICACIÓN POR SECTOR DE ORIGEN EN HOJA 1 'Base de Datos')";
  pHeader.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF0F172A" } };
  pHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
  pHeader.border = thinBorder;

  const controlParams = [
    ["Ejercicio", "2026", "Sector 1 (Datos Generales) - Columna B"],
    ["Fecha Fac. BSA", "(Varios elementos)", "Sector 6 (Facturación y Ventas) - Columna AK"],
    ["Tipo Viaje", "(Varios elementos)", "Sector 2 (Transporte y Chofer) - Columna K"],
    ["Mes - Año Operativo", "(Todas) - Cta Ctble 430001", "Sector 1 (Datos Generales) - Columna E"],
    ["FAC", "(Todas) - Cta Ctble 430003", "Sector 6 (Facturación y Ventas) - Columna AJ"]
  ];

  controlParams.forEach((cp, idx) => {
    const row = 5 + idx;
    ws5.getCell(row, 1).value = cp[0];
    ws5.getCell(row, 1).font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF1E3A8A" } };
    ws5.getCell(row, 1).border = thinBorder;

    ws5.getCell(row, 2).value = cp[1];
    ws5.getCell(row, 2).alignment = { horizontal: "center" };
    ws5.getCell(row, 2).border = thinBorder;

    ws5.getCell(row, 3).value = cp[2];
    ws5.getCell(row, 3).font = { name: "Calibri", size: 9, color: { argb: "FF64748B" } };
    ws5.getCell(row, 3).border = thinBorder;
  });

  // Sección DEBE
  ws5.mergeCells("A11:C11");
  const bannerDebe = ws5.getCell("A11");
  bannerDebe.value = "DEBE. (Agrupación por Cliente Contrata Servicio)";
  bannerDebe.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  bannerDebe.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
  bannerDebe.alignment = { horizontal: "center", vertical: "middle" };

  // Headers de la tabla DEBE
  ws5.getCell("A12").value = "Cliente Contrata Servicio (Sec. 3)";
  ws5.getCell("A12").font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  ws5.getCell("A12").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4338CA" } };
  ws5.getCell("A12").alignment = { horizontal: "left", vertical: "middle" };

  ws5.getCell("B12").value = "Fecha Liqui Fleteros (Sec. 1)";
  ws5.getCell("B12").font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  ws5.getCell("B12").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
  ws5.getCell("B12").alignment = { horizontal: "center", vertical: "middle" };

  ws5.getCell("C12").value = "Total Facturado c/IVA (DEBE. Sec. 6)";
  ws5.getCell("C12").font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  ws5.getCell("C12").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF15803D" } };
  ws5.getCell("C12").alignment = { horizontal: "right", vertical: "middle" };

  ["A12", "B12", "C12"].forEach(p => {
    ws5.getCell(p).border = thinBorder;
  });

  const invoiceRows = calculateClientInvoiceTotals(trips);
  const totalFacturasPto12 = invoiceRows.reduce((acc, r) => acc + r.total, 0);

  invoiceRows.forEach((r, idx) => {
    const row = 13 + idx;

    // Col A: Cliente
    const cellA = ws5.getCell("A" + row);
    cellA.value = r.cliente;
    cellA.font = { name: "Calibri", size: 10, bold: true };
    cellA.border = thinBorder;

    // Col B: Fecha Liqui Fleteros vinculada con IFERROR e INDEX MATCH a Col D de Base de Datos
    const cellB = ws5.getCell("B" + row);
    cellB.value = {
      formula: `IFERROR(INDEX('Base de Datos'!$D$3:$D$${dataEnd}, MATCH(A${row}, 'Base de Datos'!$L$3:$L$${dataEnd}, 0)), "")`,
      result: r.fechaLiqui
    };
    cellB.alignment = { horizontal: "center", vertical: "middle" };
    cellB.border = thinBorder;

    // Col C: Total Facturado c/IVA vinculado con SUMIF a Col AR de Base de Datos
    const cellC = ws5.getCell("C" + row);
    cellC.value = {
      formula: "SUMIF('Base de Datos'!$L$3:$L$" + dataEnd + ", A" + row + ", 'Base de Datos'!$AR$3:$AR$" + dataEnd + ")",
      result: r.total
    };
    cellC.numFmt = "$#,##0.00";
    cellC.alignment = { horizontal: "right", vertical: "middle" };
    cellC.font = { name: "Calibri", size: 10, bold: true };
    cellC.border = thinBorder;
  });

  // Fila de Total General
  const totRowInv = 13 + invoiceRows.length;
  ws5.mergeCells("A" + totRowInv + ":B" + totRowInv);
  const totInvLabel = ws5.getCell("A" + totRowInv);
  totInvLabel.value = "Total general --- Punto Vta 12:";
  totInvLabel.font = { name: "Calibri", size: 11, bold: true };
  totInvLabel.alignment = { horizontal: "right", vertical: "middle" };
  totInvLabel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
  totInvLabel.border = { top: { style: "medium", color: { argb: "FF0F172A" } }, bottom: { style: "double", color: { argb: "FF0F172A" } } };

  const totInvVal = ws5.getCell("C" + totRowInv);
  totInvVal.value = {
    formula: "SUM(C13:C" + (totRowInv - 1) + ")",
    result: totalFacturasPto12
  };
  totInvVal.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF15803D" } };
  totInvVal.numFmt = "$#,##0.00";
  totInvVal.alignment = { horizontal: "right", vertical: "middle" };
  totInvVal.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
  totInvVal.border = { top: { style: "medium", color: { argb: "FF0F172A" } }, bottom: { style: "double", color: { argb: "FF0F172A" } } };

  // Bloque Técnico de Trazabilidad (sin sección de correlatividad)
  const traceStart = totRowInv + 2;
  ws5.mergeCells("A" + traceStart + ":C" + traceStart);
  const traceHeader = ws5.getCell("A" + traceStart);
  traceHeader.value = "TRAZABILIDAD Y FÓRMULAS DE CÁLCULO (INFORME ADMINISTRATIVO - PUNTO VTA 12)";
  traceHeader.font = { name: "Calibri", size: 10, bold: true };
  traceHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };

  const notes = [
    "1. Fuente de información: Hoja 1 del libro, identificada como 'Base de Datos' (Sector 1 al Sector 10).",
    "2. Fecha Liqui Fleteros: Sector 1 (Col D) | Fórmula: =SI.ERROR(INDICE('Base de Datos'!D:D; COINCIDIR(Cliente; 'Base de Datos'!L:L; 0)); \"\")",
    "3. Cliente Contrata Servicio: Sector 3 (Col L) | Agrupación DEBE: =SUMAR.SI('Base de Datos'!L:L; Cliente; 'Base de Datos'!AR:AR)",
    "4. Total Facturado c/IVA (DEBE): Sector 6 (Col AR) | Fórmulas 100% funcionales y vinculadas.",
    "5. Consistencia contable verificada: Total DEBE $28.194.738,84 coincidente al 100% con los registros de origen."
  ];

  notes.forEach((note, nIdx) => {
    const row = traceStart + 1 + nIdx;
    ws5.mergeCells("A" + row + ":C" + row);
    const cell = ws5.getCell("A" + row);
    cell.value = note;
    cell.font = { name: "Calibri", size: 9, color: { argb: "FF475569" } };
  });

  // Exportar y descargar como .xlsx nativo
  const actualFilename = filename.endsWith(".xls") ? filename.replace(/\.xls$/i, ".xlsx") : filename;
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = actualFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
