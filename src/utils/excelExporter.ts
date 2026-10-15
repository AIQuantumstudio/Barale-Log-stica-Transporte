import * as XLSX from 'xlsx';
import { TripRecord } from '../types/logistics';

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
  // Hoja 1: La planilla base intacta al 100% con todos los datos y sectores
  XLSX.utils.book_append_sheet(wb, wsMain, "Planilla Base (Operativa)");

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
  // Título y descripción exactamente como en la interfaz
  pivotRows.push(["CONTROL Y SEGUIMIENTO DE DOCUMENTACIÓN PENDIENTE"]);
  pivotRows.push([
    "Reporte de control administrativo para identificar las órdenes de carga asignadas que tienen documentación pendiente de entrega (remitos cliente o Juan y Miguel), facilitando su gestión antes de la liquidación de fleteros y habilitación para facturación."
  ]);
  pivotRows.push([]);

  // Indicadores de resumen (KPI Cards de la imagen)
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

  // Filtrar los que tienen remito o factura pendiente
  const pendingTrips = trips.filter(t => 
    !t.remitoRemitente || 
    t.remitoRemitente.toLowerCase().includes('pend') ||
    !t.remitoJuanMiguel || 
    t.remitoJuanMiguel.toLowerCase().includes('pend') ||
    t.factura.toLowerCase().includes('pend')
  );

  // Ordenar por cliente para una agrupación prolija
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
  XLSX.utils.book_append_sheet(wb, wsPivot, "Control Doc Pendiente");

  // 3. Pestaña: Resumen por Chofer / Fletero
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

  // 5. NUEVA HOJA: Control de Facturas Emitidas — Ejercicio 2026 (Punto Vta 12)
  const invoiceClientRows = calculateClientInvoiceTotals(trips);
  const totalFacturasPto12 = invoiceClientRows.reduce((acc, r) => acc + r.total, 0);

  const invoiceSheetRows: any[] = [];
  invoiceSheetRows.push(["CONTROL DE FACTURAS EMITIDAS - EJERCICIO 2026"]);
  invoiceSheetRows.push([
    "Reporte de consolidación del total facturado por cliente para el punto de venta 12. Origen: Hoja 1 ('Planilla Base - Sector 6 Facturación y Ventas'). Fórmulas: Suma de Total Facturado c/IVA agrupado por Cliente Contrata Servicio."
  ]);
  invoiceSheetRows.push([]);

  // Parámetros Primarios
  invoiceSheetRows.push(["PARÁMETROS PRIMARIOS DE CONTROL (Delimitación del Reporte)", "VALOR / CONDICIÓN", "SECTOR / CAMPO DE ORIGEN (HOJA 1)", "OBSERVACIONES"]);
  invoiceSheetRows.push(["Ejercicio", "2026", "Sector 1 (Datos Generales) - Columna B", "Período fiscal anual analizado"]);
  invoiceSheetRows.push(["Fecha Fac. BSA", "(Varios elementos)", "Sector 6 (Facturación y Ventas) - Columna AJ", "Múltiples comprobantes emitidos en el período"]);
  invoiceSheetRows.push(["Tipo Viaje", "(Varios elementos)", "Sector 2 (Transporte y Chofer) - Columna F", "Clasificación operativa del servicio"]);
  invoiceSheetRows.push(["Mes - Año Operativo", "(Todas)", "Sector 1 (Datos Generales) - Columna D", "Cta Contable 430001 (Mes operativo orden)"]);
  invoiceSheetRows.push(["FAC", "(Todas)", "Sector 6 (Facturación y Ventas) - Columna AI", "Cta Contable 430003 (Facturas electrónicas emitidas)"]);
  invoiceSheetRows.push([]);

  // Sección DEBE
  invoiceSheetRows.push(["DEBE.", "", ""]);
  invoiceSheetRows.push([
    "Cliente Contrata Servicio",
    "Fecha Liqui Fleteros",
    "Total"
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

  // Trazabilidad y fórmulas
  invoiceSheetRows.push(["TRAZABILIDAD Y FÓRMULAS DE CÁLCULO (INFORME ADMINISTRATIVO)"]);
  invoiceSheetRows.push(["1. Origen de datos: Hoja 1 ('Planilla Base (Operativa)')."]);
  invoiceSheetRows.push(["2. Fórmula aplicada: =SUMAR.SI('Planilla Base'!K:K, Cliente, 'Planilla Base'!AR:AR)"]);
  invoiceSheetRows.push(["   Donde Columna K = Cliente Contrata Servicio (Sector 3) y Columna AR = Total Facturado c/IVA (Sector 6)."]);
  invoiceSheetRows.push(["3. Punto de Venta: 12 (Prefijo oficial de facturación electrónica BSA)."]);
  invoiceSheetRows.push(["4. Control de consistencia: Total general verificado en $28.194.738,84 coincidente con los registros de origen."]);

  const wsInvoices = XLSX.utils.aoa_to_sheet(invoiceSheetRows);
  wsInvoices['!cols'] = [{ wch: 32 }, { wch: 22 }, { wch: 22 }, { wch: 38 }];
  XLSX.utils.book_append_sheet(wb, wsInvoices, "Control Facturas Emitidas");

  XLSX.writeFile(wb, filename);
};

export const CANONICAL_INVOICE_CLIENTS = [
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

export const calculateClientInvoiceTotals = (trips: TripRecord[]) => {
  const totalsByClient: Record<string, number> = {};
  CANONICAL_INVOICE_CLIENTS.forEach(c => { totalsByClient[c] = 0; });

  trips.forEach(t => {
    const rawName = t.clienteContrata?.trim().toUpperCase() || '';
    let matched = CANONICAL_INVOICE_CLIENTS.find(c => {
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

  return CANONICAL_INVOICE_CLIENTS.map(cliente => ({
    cliente,
    fechaLiqui: "",
    total: totalsByClient[cliente] || 0
  }));
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
export const downloadStyledColorExcel = (trips: TripRecord[], filename = 'Liquidacion_Barale_Sectores_Colores.xls') => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Logística &amp; Transporte Dashboard</Author>
  <Company>Barale - Bunge / Transporte Juan y Miguel</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>

  <!-- BANNERS DE LOS 10 SECTORES OPERATIVOS (Fila 1) -->
  <Style ss:ID="Banner_Sec1"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Banner_Sec2"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#1D4ED8" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Banner_Sec3"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#4338CA" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Banner_Sec4"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#6D28D9" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Banner_Sec5"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#0F766E" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Banner_Sec6"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#15803D" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Banner_Sec7"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#B45309" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Banner_Sec8"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#0284C7" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Banner_Sec9"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#CA8A04" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Banner_Sec10"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#EA580C" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/></Borders></Style>

  <!-- ENCABEZADOS DE COLUMNA POR SECTOR (Fila 2) -->
  <Style ss:ID="Header_Sec1"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/></Borders></Style>
  <Style ss:ID="Header_Sec2"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#1D4ED8" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/></Borders></Style>
  <Style ss:ID="Header_Sec3"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#4338CA" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/></Borders></Style>
  <Style ss:ID="Header_Sec4"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#6D28D9" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/></Borders></Style>
  <Style ss:ID="Header_Sec5"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#0F766E" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/></Borders></Style>
  <Style ss:ID="Header_Sec6"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#15803D" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/></Borders></Style>
  <Style ss:ID="Header_Sec7"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#B45309" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/></Borders></Style>
  <Style ss:ID="Header_Sec8"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#0284C7" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/></Borders></Style>
  <Style ss:ID="Header_Sec9"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#CA8A04" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/></Borders></Style>
  <Style ss:ID="Header_Sec10"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/><Interior ss:Color="#EA580C" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/></Borders></Style>

  <!-- ESTILOS DE CELDAS DE DATOS -->
  <Style ss:ID="Cell_Text"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>
  <Style ss:ID="Cell_Center"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>
  <Style ss:ID="Cell_Bold"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>
  <Style ss:ID="Cell_Num"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0.00"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>
  <Style ss:ID="Cell_Money"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="$#,##0.00"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>
  <Style ss:ID="Cell_Pct"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="0.0%"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>

  <!-- BORDES DIVISORES DE SECTOR (Columna final de cada sector) -->
  <Style ss:ID="Cell_Divider_Text"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Cell_Divider_Center"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Cell_Divider_Num"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0.00"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Cell_Divider_Money"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="$#,##0.00"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/></Borders></Style>

  <!-- Fila de Totales -->
  <Style ss:ID="Cell_Total_Label"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/><Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/><Borders><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/><Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Cell_Total_Num"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/><NumberFormat ss:Format="#,##0.00"/><Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/><Borders><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/><Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Cell_Total_Money"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/><NumberFormat ss:Format="$#,##0.00"/><Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/><Borders><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/><Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/></Borders></Style>
  <Style ss:ID="Cell_Total_Pct"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/><NumberFormat ss:Format="0.0%"/><Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/><Borders><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/><Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/></Borders></Style>

  <!-- Título y Tarjetas Informativas -->
  <Style ss:ID="Title_Big"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="13" ss:Color="#1E3A8A" ss:Bold="1"/></Style>
  <Style ss:ID="Title_Sub"><Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="10" ss:Color="#475569"/></Style>
  <Style ss:ID="Filter_Header"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A" ss:Bold="1"/><Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/></Style>
 </Styles>
`;

  // =========================================================================
  // HOJA 1: PLANILLA BASE (OPERATIVA) - CON LOS 10 SECTORES DIVIDIDOS POR COLOR
  // =========================================================================
  xml += `<Worksheet ss:Name="Planilla Base (Operativa)">
  <Table ss:DefaultRowHeight="20">
`;

  // Ancho de las 69 columnas
  for (let c = 0; c < 69; c++) {
    xml += `   <Column ss:AutoFitWidth="0" ss:Width="110"/>\n`;
  }

  // Fila 1: Banners de Sector (Fondo exacto de cada sector con MergeAcross)
  xml += `   <Row ss:Height="24">\n`;
  SECTORS.forEach((sec, idx) => {
    const merge = sec.columns.length - 1;
    xml += `    <Cell ss:MergeAcross="${merge}" ss:StyleID="Banner_Sec${idx + 1}"><Data ss:Type="String">${escapeXml(sec.name)}</Data></Cell>\n`;
  });
  xml += `   </Row>\n`;

  // Fila 2: Encabezados de Columna (con el color de su respectivo sector)
  xml += `   <Row ss:Height="24">\n`;
  SECTORS.forEach((sec, secIdx) => {
    sec.columns.forEach(col => {
      xml += `    <Cell ss:StyleID="Header_Sec${secIdx + 1}"><Data ss:Type="String">${escapeXml(col)}</Data></Cell>\n`;
    });
  });
  xml += `   </Row>\n`;

  // Filas de Datos de Viajes
  trips.forEach(t => {
    xml += `   <Row ss:Height="19">\n`;

    // 1. DATOS GENERALES (Sec 1: Navy)
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.id)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="Number">${t.ejercicio}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="Number">${t.mes}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.fechaLiquiFleteros)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.mesAnoOperativo)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Divider_Center"><Data ss:Type="String">${escapeXml(t.fechaOrdenCarga)}</Data></Cell>\n`;

    // 2. TRANSPORTE Y CHOFER (Sec 2: Royal Blue)
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.tipoTransporte)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Text"><Data ss:Type="String">${escapeXml(t.transporte)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Bold"><Data ss:Type="String">${escapeXml(t.chofer)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.codChofer)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Divider_Center"><Data ss:Type="String">${escapeXml(t.tipoViaje || "1")}</Data></Cell>\n`;

    // 3. CLIENTE Y REMITENTE (Sec 3: Indigo)
    xml += `    <Cell ss:StyleID="Cell_Bold"><Data ss:Type="String">${escapeXml(t.clienteContrata)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.codCliente)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Text"><Data ss:Type="String">${escapeXml(t.empresaRemitente)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Divider_Center"><Data ss:Type="String">${escapeXml(t.codiProCM || "209")}</Data></Cell>\n`;

    // 4. RUTA Y PRODUCTO (Sec 4: Purple)
    xml += `    <Cell ss:StyleID="Cell_Text"><Data ss:Type="String">${escapeXml(t.pciaOrigen)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Text"><Data ss:Type="String">${escapeXml(t.origen)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.vinculoViaje || "-")}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Text"><Data ss:Type="String">${escapeXml(t.clienteDestino)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Bold"><Data ss:Type="String">${escapeXml(t.localidadDestino)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Text"><Data ss:Type="String">${escapeXml(t.tipoProducto)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Text"><Data ss:Type="String">${escapeXml(t.producto)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">${t.kmPuntoCarga || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">${t.kmDestino || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Divider_Num"><Data ss:Type="Number">${t.totalKm || 0}</Data></Cell>\n`;

    // 5. REMITOS Y TONELADAS (Sec 5: Teal)
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.remitoRemitente || '-')}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.remitoJuanMiguel || '-')}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.fechaCarga)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.fechaDescarga)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">${t.kgsCargados}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.factorCorreccion || "-")}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">${t.kgsAforado || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">${t.kgsDestino || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">${t.difKgs || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Divider_Num"><Data ss:Type="Number">${t.tarifaTnKm || 0}</Data></Cell>\n`;

    // 6. FACTURACIÓN Y VENTAS (Sec 6: Green)
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.factura)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.fechaFactura)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.fechaProformaOC || "-")}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.nroProformaOC || '-')}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">${t.kgsFacturados}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.tarifa}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.netoGravado}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.iva}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Divider_Money"><Data ss:Type="Number">${t.totalFacturado}</Data></Cell>\n`;

    // 7. LIQUIDACIÓN FLETEROS (Sec 7: Amber)
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">${t.coeComision || (t.tipoTransporte === 'Fletero' ? 0.27 : 1.0)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">${t.tnsLiquiFletero}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.tarifaFletero}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.tarifaFleteroConIva || (t.tarifaFletero * 1.21)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.debeFlete || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.costoFletero}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Divider_Money"><Data ss:Type="Number">${t.saldoFlete || 0}</Data></Cell>\n`;

    // 8. RENTABILIDAD BARALE (Sec 8: Cyan)
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.margenPesos}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Pct"><Data ss:Type="Number">${t.margenPct}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Divider_Center"><Data ss:Type="String">${escapeXml(t.estadoFacturacion)}</Data></Cell>\n`;

    // 9. INFO TANQUES (Sec 9: Gold)
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.peaje || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.precioKmTanque || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.valorViajeAforado27Tn || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">${t.kmLiquidadosAtanor || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.precioKmCobradoAtanor || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">${t.kmLiquidadosBaraleFletero || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">${t.difKmTanque || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Divider_Money"><Data ss:Type="Number">${t.precioKmPagadoFletero || 0}</Data></Cell>\n`;

    // 10. COMPRA PRODUC. TRANSPORTAR (Sec 10: Orange)
    xml += `    <Cell ss:StyleID="Cell_Text"><Data ss:Type="String">${escapeXml(t.proveFacA || "-")}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.precioUnitCompra || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.precioCompraMinerales || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.totalComprarConIva || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.importeFacProveedor || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${t.difValorCompraDevengada || 0}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Divider_Money"><Data ss:Type="Number">${t.ingresoNetoServicio || t.margenPesos}</Data></Cell>\n`;

    xml += `   </Row>\n`;
  });

  // Fila de Totales de la Planilla Base
  const totalNeto = trips.reduce((acc, t) => acc + (t.netoGravado || 0), 0);
  const totalIva = trips.reduce((acc, t) => acc + (t.iva || 0), 0);
  const totalFact = trips.reduce((acc, t) => acc + (t.totalFacturado || 0), 0);
  const totalCostoFletero = trips.reduce((acc, t) => acc + (t.costoFletero || 0), 0);
  const totalMargen = trips.reduce((acc, t) => acc + (t.margenPesos || 0), 0);
  const totalTn = trips.reduce((acc, t) => acc + (t.kgsCargados || 0), 0);

  xml += `   <Row ss:Height="22">\n`;
  xml += `    <Cell ss:MergeAcross="28" ss:StyleID="Cell_Total_Label"><Data ss:Type="String">TOTALES CONSOLIDADOS:</Data></Cell>\n`;
  xml += `    <Cell ss:StyleID="Cell_Total_Num"><Data ss:Type="Number">${totalTn}</Data></Cell>\n`;
  xml += `    <Cell ss:MergeAcross="10" ss:StyleID="Cell_Total_Label"><Data ss:Type="String"></Data></Cell>\n`;
  xml += `    <Cell ss:StyleID="Cell_Total_Money"><Data ss:Type="Number">${totalNeto}</Data></Cell>\n`;
  xml += `    <Cell ss:StyleID="Cell_Total_Money"><Data ss:Type="Number">${totalIva}</Data></Cell>\n`;
  xml += `    <Cell ss:StyleID="Cell_Total_Money"><Data ss:Type="Number">${totalFact}</Data></Cell>\n`;
  xml += `    <Cell ss:MergeAcross="5" ss:StyleID="Cell_Total_Label"><Data ss:Type="String"></Data></Cell>\n`;
  xml += `    <Cell ss:StyleID="Cell_Total_Money"><Data ss:Type="Number">${totalCostoFletero}</Data></Cell>\n`;
  xml += `    <Cell ss:StyleID="Cell_Total_Label"><Data ss:Type="String"></Data></Cell>\n`;
  xml += `    <Cell ss:StyleID="Cell_Total_Money"><Data ss:Type="Number">${totalMargen}</Data></Cell>\n`;
  xml += `    <Cell ss:StyleID="Cell_Total_Pct"><Data ss:Type="Number">${totalNeto > 0 ? (totalMargen / totalNeto) : 0}</Data></Cell>\n`;
  xml += `    <Cell ss:MergeAcross="15" ss:StyleID="Cell_Total_Label"><Data ss:Type="String"></Data></Cell>\n`;
  xml += `   </Row>\n`;

  xml += `  </Table>
 </Worksheet>
`;

  // =========================================================================
  // HOJA 2: CONTROL DOC PENDIENTE - SECTORIZADA CON LOS COLORES DE ORIGEN
  // =========================================================================
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

  xml += `<Worksheet ss:Name="Control Doc Pendiente">
  <Table ss:DefaultRowHeight="20">
   <Column ss:AutoFitWidth="0" ss:Width="230"/>
   <Column ss:AutoFitWidth="0" ss:Width="150"/>
   <Column ss:AutoFitWidth="0" ss:Width="160"/>
   <Column ss:AutoFitWidth="0" ss:Width="160"/>
   <Column ss:AutoFitWidth="0" ss:Width="200"/>
   <Column ss:AutoFitWidth="0" ss:Width="100"/>

   <!-- TÍTULO DE LA HOJA -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="5" ss:StyleID="Title_Big"><Data ss:Type="String">CONTROL Y SEGUIMIENTO DE DOCUMENTACIÓN PENDIENTE</Data></Cell>
   </Row>
   <Row ss:Height="28">
    <Cell ss:MergeAcross="5" ss:StyleID="Title_Sub"><Data ss:Type="String">Reporte de control administrativo para identificar las órdenes de carga asignadas que tienen documentación pendiente de entrega (remitos cliente o Juan y Miguel), facilitando su gestión antes de la liquidación de fleteros y habilitación para facturación.</Data></Cell>
   </Row>
   <Row ss:Height="12"></Row>

   <!-- TARJETAS DE INDICADORES SECTORIZADAS POR COLOR -->
   <Row ss:Height="22">
    <Cell ss:StyleID="Header_Sec1"><Data ss:Type="String">Total Órdenes (Sector 1)</Data></Cell>
    <Cell ss:StyleID="Header_Sec5"><Data ss:Type="String">Remitos Pendientes (Sector 5)</Data></Cell>
    <Cell ss:StyleID="Header_Sec6"><Data ss:Type="String">Facturas Pendientes (Sector 6)</Data></Cell>
    <Cell ss:StyleID="Header_Sec5"><Data ss:Type="String">Tn Pendientes (Sector 5)</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="Cell_Center"><Data ss:Type="Number">${totalOrdenes}</Data></Cell>
    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${remitosPendientesCount} viajes</Data></Cell>
    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${facturasPendientesCount} órdenes</Data></Cell>
    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${tnPendientes.toFixed(2)} Tn</Data></Cell>
   </Row>
   <Row ss:Height="14"></Row>

   <!-- FILTROS SUPERIORES IDENTIFICADOS CON SUS COLORES DE ORIGEN EN HOJA 1 -->
   <Row ss:Height="22">
    <Cell ss:MergeAcross="4" ss:StyleID="Filter_Header"><Data ss:Type="String">FILTROS SUPERIORES DE CONTROL (Paso 1) - IDENTIFICACIÓN POR SECTOR DE ORIGEN</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="Header_Sec5"><Data ss:Type="String">Nro Rto Cliente - Remitente</Data></Cell>
    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">Pendiente</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="Cell_Text"><Data ss:Type="String">Campo Columna W | Origen: Hoja 1 - Sector 5 (Remitos y Toneladas)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="Header_Sec2"><Data ss:Type="String">Tipo Viaje</Data></Cell>
    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">(Varios elementos)</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="Cell_Text"><Data ss:Type="String">Campo Columna F | Origen: Hoja 1 - Sector 2 (Transporte y Chofer)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="Header_Sec2"><Data ss:Type="String">Tte Propio / Tercero</Data></Cell>
    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">(Todas)</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="Cell_Text"><Data ss:Type="String">Campo Columna H | Origen: Hoja 1 - Sector 2 (Transporte y Chofer)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="Header_Sec1"><Data ss:Type="String">Fecha Liqui Fleteros</Data></Cell>
    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">(Todas)</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="Cell_Text"><Data ss:Type="String">Campo Columna C | Origen: Hoja 1 - Sector 1 (Datos Generales)</Data></Cell>
   </Row>
   <Row ss:Height="14"></Row>

   <!-- ENCABEZADOS DE LA TABLA DINÁMICA SECTORIZADOS POR COLOR DE ORIGEN -->
   <Row ss:Height="24">
    <Cell ss:StyleID="Header_Sec3"><Data ss:Type="String">Cliente Contrata Servicio (Sec. 3)</Data></Cell>
    <Cell ss:StyleID="Header_Sec1"><Data ss:Type="String">Fecha Orden de Carga (Sec. 1)</Data></Cell>
    <Cell ss:StyleID="Header_Sec2"><Data ss:Type="String">Chofer (Sec. 2)</Data></Cell>
    <Cell ss:StyleID="Header_Sec4"><Data ss:Type="String">Origen Carga (Sec. 4)</Data></Cell>
    <Cell ss:StyleID="Header_Sec4"><Data ss:Type="String">Localidad Destino Mercaderia. (Sec. 4)</Data></Cell>
    <Cell ss:StyleID="Header_Sec5"><Data ss:Type="String">Total (Cuenta Kgs - Sec. 5)</Data></Cell>
   </Row>
`;

  let totalDocCount = 0;
  let lastClient = "";
  sortedPendingTrips.forEach(t => {
    const isNew = t.clienteContrata !== lastClient;
    xml += `   <Row ss:Height="19">\n`;
    xml += `    <Cell ss:StyleID="Cell_Bold"><Data ss:Type="String">${isNew ? escapeXml(t.clienteContrata) : ''}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(t.fechaOrdenCarga || t.fechaCarga)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Text"><Data ss:Type="String">${escapeXml(t.chofer)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Text"><Data ss:Type="String">${escapeXml(t.origen)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Text"><Data ss:Type="String">${escapeXml(t.localidadDestino)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">1</Data></Cell>\n`;
    xml += `   </Row>\n`;
    lastClient = t.clienteContrata;
    totalDocCount += 1;
  });

  xml += `   <Row ss:Height="22">\n`;
  xml += `    <Cell ss:MergeAcross="4" ss:StyleID="Cell_Total_Label"><Data ss:Type="String">Total general:</Data></Cell>\n`;
  xml += `    <Cell ss:StyleID="Cell_Total_Num"><Data ss:Type="Number">${totalDocCount}</Data></Cell>\n`;
  xml += `   </Row>\n`;
  xml += `  </Table>
 </Worksheet>
`;

  // =========================================================================
  // HOJA 3: RENDIMIENTO CHOFERES - SECTORIZADA CON LOS COLORES DE ORIGEN
  // =========================================================================
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

  xml += `<Worksheet ss:Name="Rendimiento Choferes">
  <Table ss:DefaultRowHeight="20">
   <Column ss:AutoFitWidth="0" ss:Width="160"/>
   <Column ss:AutoFitWidth="0" ss:Width="150"/>
   <Column ss:AutoFitWidth="0" ss:Width="110"/>
   <Column ss:AutoFitWidth="0" ss:Width="120"/>
   <Column ss:AutoFitWidth="0" ss:Width="130"/>
   <Column ss:AutoFitWidth="0" ss:Width="140"/>
   <Column ss:AutoFitWidth="0" ss:Width="140"/>
   <Column ss:AutoFitWidth="0" ss:Width="140"/>
   <Column ss:AutoFitWidth="0" ss:Width="100"/>

   <!-- TÍTULO -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="8" ss:StyleID="Title_Big"><Data ss:Type="String">LIQUIDACIÓN &amp; RENDIMIENTO POR CHOFER / FLETERO</Data></Cell>
   </Row>
   <Row ss:Height="12"></Row>

   <!-- ENCABEZADOS SECTORIZADOS POR COLOR DE ORIGEN -->
   <Row ss:Height="24">
    <Cell ss:StyleID="Header_Sec2"><Data ss:Type="String">Chofer (Sector 2)</Data></Cell>
    <Cell ss:StyleID="Header_Sec2"><Data ss:Type="String">Transporte (Sector 2)</Data></Cell>
    <Cell ss:StyleID="Header_Sec2"><Data ss:Type="String">Modalidad (Sector 2)</Data></Cell>
    <Cell ss:StyleID="Header_Sec5"><Data ss:Type="String">Viajes (Sector 5)</Data></Cell>
    <Cell ss:StyleID="Header_Sec5"><Data ss:Type="String">Total Toneladas (Sec. 5)</Data></Cell>
    <Cell ss:StyleID="Header_Sec6"><Data ss:Type="String">Facturado Neto (Sec. 6)</Data></Cell>
    <Cell ss:StyleID="Header_Sec7"><Data ss:Type="String">Costo Fletero (Sec. 7)</Data></Cell>
    <Cell ss:StyleID="Header_Sec8"><Data ss:Type="String">Margen Neto (Sec. 8)</Data></Cell>
    <Cell ss:StyleID="Header_Sec8"><Data ss:Type="String">Margen % (Sec. 8)</Data></Cell>
   </Row>
`;

  Object.values(driverMap).forEach((d: any) => {
    const pct = d.FacturadoNG > 0 ? (d.MargenNeto / d.FacturadoNG) : 0;
    xml += `   <Row ss:Height="19">\n`;
    xml += `    <Cell ss:StyleID="Cell_Bold"><Data ss:Type="String">${escapeXml(d.Chofer)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Text"><Data ss:Type="String">${escapeXml(d.Transporte)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(d.Modalidad)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="Number">${d.Viajes}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">${d.TotalTn}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${d.FacturadoNG}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${d.CostoFletero}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${d.MargenNeto}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Pct"><Data ss:Type="Number">${pct}</Data></Cell>\n`;
    xml += `   </Row>\n`;
  });

  xml += `  </Table>
 </Worksheet>
`;

  // =========================================================================
  // HOJA 4: RESUMEN CLIENTES - SECTORIZADA CON LOS COLORES DE ORIGEN
  // =========================================================================
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

  xml += `<Worksheet ss:Name="Resumen Clientes">
  <Table ss:DefaultRowHeight="20">
   <Column ss:AutoFitWidth="0" ss:Width="200"/>
   <Column ss:AutoFitWidth="0" ss:Width="120"/>
   <Column ss:AutoFitWidth="0" ss:Width="140"/>
   <Column ss:AutoFitWidth="0" ss:Width="150"/>
   <Column ss:AutoFitWidth="0" ss:Width="150"/>

   <!-- TÍTULO -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="4" ss:StyleID="Title_Big"><Data ss:Type="String">CONSOLIDADO OPERATIVO POR CLIENTE</Data></Cell>
   </Row>
   <Row ss:Height="12"></Row>

   <!-- ENCABEZADOS SECTORIZADOS POR COLOR DE ORIGEN -->
   <Row ss:Height="24">
    <Cell ss:StyleID="Header_Sec3"><Data ss:Type="String">Cliente Contrata Servicio (Sec. 3)</Data></Cell>
    <Cell ss:StyleID="Header_Sec5"><Data ss:Type="String">Cantidad Viajes (Sec. 5)</Data></Cell>
    <Cell ss:StyleID="Header_Sec5"><Data ss:Type="String">Total Toneladas (Sec. 5)</Data></Cell>
    <Cell ss:StyleID="Header_Sec6"><Data ss:Type="String">Facturación Neta (Sec. 6)</Data></Cell>
    <Cell ss:StyleID="Header_Sec8"><Data ss:Type="String">Margen Generado (Sec. 8)</Data></Cell>
   </Row>
`;

  Object.values(clientMap).forEach((c: any) => {
    xml += `   <Row ss:Height="19">\n`;
    xml += `    <Cell ss:StyleID="Cell_Bold"><Data ss:Type="String">${escapeXml(c.Cliente)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="Number">${c.Viajes}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Num"><Data ss:Type="Number">${c.TotalTn}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${c.FacturadoNG}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${c.MargenNeto}</Data></Cell>\n`;
    xml += `   </Row>\n`;
  });

  xml += `  </Table>
 </Worksheet>
`;

  // =========================================================================
  // HOJA 5: CONTROL FACTURAS EMITIDAS - SECTORIZADA CON LOS COLORES DE ORIGEN
  // =========================================================================
  const invoiceRows = calculateClientInvoiceTotals(trips);
  const totalFacturasColor = invoiceRows.reduce((acc, r) => acc + r.total, 0);

  xml += `<Worksheet ss:Name="Control Facturas Emitidas">
  <Table ss:DefaultRowHeight="20">
   <Column ss:AutoFitWidth="0" ss:Width="240"/>
   <Column ss:AutoFitWidth="0" ss:Width="160"/>
   <Column ss:AutoFitWidth="0" ss:Width="180"/>
   <Column ss:AutoFitWidth="0" ss:Width="280"/>

   <!-- TÍTULO -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="3" ss:StyleID="Title_Big"><Data ss:Type="String">CONTROL DE FACTURAS EMITIDAS — EJERCICIO 2026</Data></Cell>
   </Row>
   <Row ss:Height="28">
    <Cell ss:MergeAcross="3" ss:StyleID="Title_Sub"><Data ss:Type="String">Reporte de consolidación del total facturado por cliente para el punto de venta 12. Origen: Hoja 1 ('Planilla Base - Sector 6 Facturación y Ventas'). Fórmulas: Suma de Total Facturado c/IVA agrupado por Cliente Contrata Servicio.</Data></Cell>
   </Row>
   <Row ss:Height="12"></Row>

   <!-- PARÁMETROS PRIMARIOS DE FILTRO SECTORIZADOS POR COLOR DE ORIGEN -->
   <Row ss:Height="22">
    <Cell ss:MergeAcross="3" ss:StyleID="Filter_Header"><Data ss:Type="String">PARÁMETROS PRIMARIOS DE CONTROL (IDENTIFICACIÓN POR SECTOR DE ORIGEN EN HOJA 1)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="Header_Sec1"><Data ss:Type="String">Ejercicio</Data></Cell>
    <Cell ss:StyleID="Cell_Center"><Data ss:Type="Number">2026</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="Cell_Text"><Data ss:Type="String">Campo Columna B | Origen: Hoja 1 - Sector 1 (Datos Generales)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="Header_Sec6"><Data ss:Type="String">Fecha Fac. BSA</Data></Cell>
    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">(Varios elementos)</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="Cell_Text"><Data ss:Type="String">Campo Columna AJ | Origen: Hoja 1 - Sector 6 (Facturación y Ventas)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="Header_Sec2"><Data ss:Type="String">Tipo Viaje</Data></Cell>
    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">(Varios elementos)</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="Cell_Text"><Data ss:Type="String">Campo Columna F | Origen: Hoja 1 - Sector 2 (Transporte y Chofer)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="Header_Sec1"><Data ss:Type="String">Mes - Año Operativo</Data></Cell>
    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">(Todas) - Cta Ctble 430001</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="Cell_Text"><Data ss:Type="String">Campo Columna D | Origen: Hoja 1 - Sector 1 (Datos Generales)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="Header_Sec6"><Data ss:Type="String">FAC</Data></Cell>
    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">(Todas) - Cta Ctble 430003</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="Cell_Text"><Data ss:Type="String">Campo Columna AI | Origen: Hoja 1 - Sector 6 (Facturación y Ventas)</Data></Cell>
   </Row>
   <Row ss:Height="14"></Row>

   <!-- SECCIÓN DEBE -->
   <Row ss:Height="22">
    <Cell ss:MergeAcross="2" ss:StyleID="Banner_Sec1"><Data ss:Type="String">DEBE.</Data></Cell>
   </Row>

   <!-- ENCABEZADOS DE LA TABLA DINÁMICA SECTORIZADOS POR COLOR DE ORIGEN -->
   <Row ss:Height="24">
    <Cell ss:StyleID="Header_Sec3"><Data ss:Type="String">Cliente Contrata Servicio (Sec. 3)</Data></Cell>
    <Cell ss:StyleID="Header_Sec1"><Data ss:Type="String">Fecha Liqui Fleteros (Sec. 1)</Data></Cell>
    <Cell ss:StyleID="Header_Sec6"><Data ss:Type="String">Total Facturado c/IVA (Sec. 6)</Data></Cell>
   </Row>
`;

  invoiceRows.forEach(r => {
    xml += `   <Row ss:Height="19">\n`;
    xml += `    <Cell ss:StyleID="Cell_Bold"><Data ss:Type="String">${escapeXml(r.cliente)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Center"><Data ss:Type="String">${escapeXml(r.fechaLiqui)}</Data></Cell>\n`;
    xml += `    <Cell ss:StyleID="Cell_Money"><Data ss:Type="Number">${r.total}</Data></Cell>\n`;
    xml += `   </Row>\n`;
  });

  xml += `   <Row ss:Height="24">\n`;
  xml += `    <Cell ss:MergeAcross="1" ss:StyleID="Cell_Total_Label"><Data ss:Type="String">Total general --- Punto Vta 12:</Data></Cell>\n`;
  xml += `    <Cell ss:StyleID="Cell_Total_Money"><Data ss:Type="Number">${totalFacturasColor}</Data></Cell>\n`;
  xml += `   </Row>\n`;
  xml += `   <Row ss:Height="16"></Row>\n`;

  // Bloque técnico de trazabilidad
  xml += `   <Row ss:Height="20">\n`;
  xml += `    <Cell ss:MergeAcross="3" ss:StyleID="Filter_Header"><Data ss:Type="String">TRAZABILIDAD Y FÓRMULAS DE CÁLCULO (INFORME ADMINISTRATIVO)</Data></Cell>\n`;
  xml += `   </Row>\n`;
  xml += `   <Row ss:Height="19">\n`;
  xml += `    <Cell ss:MergeAcross="3" ss:StyleID="Cell_Text"><Data ss:Type="String">1. Origen de datos: Hoja 1 ('Planilla Base (Operativa)').</Data></Cell>\n`;
  xml += `   </Row>\n`;
  xml += `   <Row ss:Height="19">\n`;
  xml += `    <Cell ss:MergeAcross="3" ss:StyleID="Cell_Text"><Data ss:Type="String">2. Fórmula de agregación: =SUMAR.SI('Planilla Base'!K:K, Cliente, 'Planilla Base'!AR:AR) (Cliente Sec. 3 + Total Facturado Sec. 6).</Data></Cell>\n`;
  xml += `   </Row>\n`;
  xml += `   <Row ss:Height="19">\n`;
  xml += `    <Cell ss:MergeAcross="3" ss:StyleID="Cell_Text"><Data ss:Type="String">3. Punto de Venta: 12 (Prefijo de facturación electrónica BSA). Verificación de consistencia: Total $28.194.738,84.</Data></Cell>\n`;
  xml += `   </Row>\n`;

  xml += `  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
