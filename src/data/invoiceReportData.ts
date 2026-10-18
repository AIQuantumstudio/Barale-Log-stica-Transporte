import { TripRecord } from '../types/logistics';

export interface DetailedInvoiceRow {
  fechaLiqui: string;
  cliente: string;
  fac: string;
  fechaFac: string;
  ng: number;
  debe: number;
}

/**
 * 40 registros canónicos oficiales extraídos fielmente de la imagen
 * "Informe de Facturas Emitidas en Azul.png" - Ejercicio 2026
 */
export const CANONICAL_DETAILED_INVOICES: DetailedInvoiceRow[] = [
  // BRESSAN
  { fechaLiqui: "1/8/2026", cliente: "BRESSAN", fac: "12-5232", fechaFac: "17/8/2026", ng: 118170.00, debe: 142985.70 },
  // TRANSPORTE JOSE CARLOS SRL
  { fechaLiqui: "", cliente: "TRANSPORTE JOSE CARLOS SRL", fac: "12-5224", fechaFac: "10/8/2026", ng: 128904.00, debe: 155973.84 },
  { fechaLiqui: "", cliente: "TRANSPORTE JOSE CARLOS SRL", fac: "12-5238", fechaFac: "24/8/2026", ng: 68429.00, debe: 82799.09 },
  // BARRILIN ROBERTO
  { fechaLiqui: "", cliente: "BARRILIN ROBERTO", fac: "12-5239", fechaFac: "26/8/2026", ng: 6000.00, debe: 7260.00 },
  // LUCERO CESAR MAURICIO
  { fechaLiqui: "", cliente: "LUCERO CESAR MAURICIO", fac: "12-5240", fechaFac: "26/8/2026", ng: 6000.00, debe: 7260.00 },
  // MARTINEZ NESTOR JABIER
  { fechaLiqui: "", cliente: "MARTINEZ NESTOR JABIER", fac: "12-5241", fechaFac: "26/8/2026", ng: 6000.00, debe: 7260.00 },
  // RUBEN EDUARDO EZEQUIEL
  { fechaLiqui: "", cliente: "RUBEN EDUARDO EZEQUIEL", fac: "12-5244", fechaFac: "26/8/2026", ng: 6000.00, debe: 7260.00 },
  // RUBEN EMANUEL ALEJANDRO
  { fechaLiqui: "", cliente: "RUBEN EMANUEL ALEJANDRO", fac: "12-5243", fechaFac: "26/8/2026", ng: 6000.00, debe: 7260.00 },
  // RUBEN EDUARDO JOSE
  { fechaLiqui: "", cliente: "RUBEN EDUARDO JOSE", fac: "12-5242", fechaFac: "26/8/2026", ng: 6000.00, debe: 7260.00 },
  // GRUPO CKOSS SRL
  { fechaLiqui: "", cliente: "GRUPO CKOSS SRL", fac: "12-5228", fechaFac: "14/8/2026", ng: 158014.00, debe: 191196.94 },
  // HECTOR A BERTONE
  { fechaLiqui: "", cliente: "HECTOR A BERTONE", fac: "12-5229", fechaFac: "14/8/2026", ng: 342888.00, debe: 414894.48 },
  { fechaLiqui: "", cliente: "HECTOR A BERTONE", fac: "12-5248", fechaFac: "31/8/2026", ng: 169988.00, debe: 205685.48 },
  // GALEAZZI FRANCO MAURICIO
  { fechaLiqui: "", cliente: "GALEAZZI FRANCO MAURICIO", fac: "12-5249", fechaFac: "31/8/2026", ng: 74050.00, debe: 89600.50 },
  // ALACAL SRL
  { fechaLiqui: "", cliente: "ALACAL SRL", fac: "12-5227", fechaFac: "10/8/2026", ng: 553344.00, debe: 669546.24 },
  { fechaLiqui: "", cliente: "ALACAL SRL", fac: "12-5230", fechaFac: "14/8/2026", ng: 497970.00, debe: 602543.70 },
  { fechaLiqui: "", cliente: "ALACAL SRL", fac: "12-5237", fechaFac: "24/8/2026", ng: 489192.00, debe: 591922.32 },
  { fechaLiqui: "", cliente: "ALACAL SRL", fac: "12-5247", fechaFac: "31/8/2026", ng: 339108.00, debe: 410320.68 },
  { fechaLiqui: "", cliente: "ALACAL SRL", fac: "Pendiente", fechaFac: "Pendiente", ng: 52536.00, debe: 63568.56 },
  // RONATA
  { fechaLiqui: "", cliente: "RONATA", fac: "0012-00887", fechaFac: "10/8/2026", ng: 2239679.52, debe: 2710012.22 },
  { fechaLiqui: "", cliente: "RONATA", fac: "0012-00888", fechaFac: "10/8/2026", ng: 1532434.70, debe: 1854245.99 },
  { fechaLiqui: "", cliente: "RONATA", fac: "0012-00889", fechaFac: "14/8/2026", ng: 519263.82, debe: 628309.22 },
  { fechaLiqui: "", cliente: "RONATA", fac: "0012-00890", fechaFac: "18/8/2026", ng: 2101821.67, debe: 2543204.22 },
  { fechaLiqui: "", cliente: "RONATA", fac: "0012-00891", fechaFac: "18/8/2026", ng: 1678972.49, debe: 2031556.71 },
  { fechaLiqui: "", cliente: "RONATA", fac: "0012-00892", fechaFac: "24/8/2026", ng: 791480.02, debe: 957690.82 },
  { fechaLiqui: "", cliente: "RONATA", fac: "0012-00893", fechaFac: "24/8/2026", ng: 752165.38, debe: 910120.11 },
  { fechaLiqui: "", cliente: "RONATA", fac: "0012-00894", fechaFac: "24/8/2026", ng: 1532349.60, debe: 1854143.02 },
  { fechaLiqui: "", cliente: "RONATA", fac: "0012-00895", fechaFac: "24/8/2026", ng: 1238252.85, debe: 1498285.95 },
  { fechaLiqui: "", cliente: "RONATA", fac: "0012-00896", fechaFac: "31/8/2026", ng: 2107097.71, debe: 2549588.23 },
  { fechaLiqui: "", cliente: "RONATA", fac: "0012-00897", fechaFac: "31/8/2026", ng: 0.00, debe: 0.00 },
  { fechaLiqui: "", cliente: "RONATA", fac: "0012-00898", fechaFac: "31/8/2026", ng: 1336527.30, debe: 1617198.03 },
  // ABIC
  { fechaLiqui: "", cliente: "ABIC", fac: "12-5223", fechaFac: "8/8/2026", ng: 578544.00, debe: 700038.24 },
  { fechaLiqui: "", cliente: "ABIC", fac: "12-5231", fechaFac: "17/8/2026", ng: 964240.00, debe: 1166730.40 },
  { fechaLiqui: "", cliente: "ABIC", fac: "12-5234", fechaFac: "24/8/2026", ng: 385696.00, debe: 466692.16 },
  { fechaLiqui: "", cliente: "ABIC", fac: "12-5245", fechaFac: "27/8/2026", ng: 578544.00, debe: 700038.24 },
  // PUCARA
  { fechaLiqui: "", cliente: "PUCARA", fac: "12-5225", fechaFac: "10/8/2026", ng: 157225.00, debe: 190242.25 },
  { fechaLiqui: "", cliente: "PUCARA", fac: "12-5246", fechaFac: "27/8/2026", ng: 321100.00, debe: 388531.00 },
  // DALMASO - RONATA
  { fechaLiqui: "", cliente: "DALMASO - RONATA", fac: "Dalmaso", fechaFac: "30+L9:P42/11/2019", ng: 0.00, debe: 0.00 },
  // GRANJA SAN JUAN
  { fechaLiqui: "", cliente: "GRANJA SAN JUAN", fac: "12-5233", fechaFac: "17/8/2026", ng: 317700.00, debe: 384417.00 },
  { fechaLiqui: "", cliente: "GRANJA SAN JUAN", fac: "12-5236", fechaFac: "24/8/2026", ng: 931140.00, debe: 1126679.40 },
  // GLOBE
  { fechaLiqui: "", cliente: "GLOBE", fac: "12-5235", fechaFac: "24/8/2026", ng: 208610.00, debe: 252418.10 }
];

/**
 * Totales globales de control
 */
export const TOTAL_INVOICES_NG = 23301437.06;
export const TOTAL_INVOICES_DEBE = 28194738.84;

/**
 * Obtiene o calcula los registros de facturas emitidas a partir de los viajes actuales.
 * Si los viajes corresponden a la base inicial de agosto 2026, consolida con fidelidad
 * las 40 facturas exactas de la imagen. Si hay nuevos viajes cargados por el usuario,
 * agrega y recalcula dinámicamente las facturas emitidas.
 */
export const getDetailedInvoiceRecords = (trips: TripRecord[]): DetailedInvoiceRow[] => {
  // Map para acumular por clave (cliente + factura)
  const grouped: Record<string, DetailedInvoiceRow> = {};

  // Inicializar con la base canónica
  CANONICAL_DETAILED_INVOICES.forEach(item => {
    const key = `${item.cliente}___${item.fac}`;
    grouped[key] = {
      fechaLiqui: item.fechaLiqui || '',
      cliente: item.cliente,
      fac: item.fac,
      fechaFac: item.fechaFac,
      ng: item.ng,
      debe: item.debe
    };
  });

  // Si hay viajes en trips con facturas adicionales no presentes en la base canónica
  trips.forEach(t => {
    if (!t.factura || t.factura === '-') return;
    const clientName = t.clienteContrata?.trim().toUpperCase() || 'CLIENTE';
    const key = `${clientName}___${t.factura}`;
    if (!grouped[key]) {
      grouped[key] = {
        fechaLiqui: t.fechaLiquiFleteros || '',
        cliente: t.clienteContrata || 'CLIENTE',
        fac: t.factura,
        fechaFac: t.fechaFactura || 'Pendiente',
        ng: 0,
        debe: 0
      };
      grouped[key].ng += (t.netoGravado || 0);
      grouped[key].debe += (t.totalFacturado || 0);
    }
  });

  return Object.values(grouped);
};
