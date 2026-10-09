export interface TripRecord {
  id: string;
  ejercicio: number;
  mes: number;
  fechaLiquiFleteros: string;
  mesAnoOperativo: string;
  fechaOrdenCarga: string;
  tipoViaje: string;
  codChofer: string;
  tipoTransporte: 'Propio' | 'Fletero';
  transporte: string;
  chofer: string;
  codCliente: string;
  clienteContrata: string;
  empresaRemitente: string;
  pciaOrigen: string;
  origen: string;
  tipoProducto: string;
  producto: string;
  remitoRemitente: string;
  remitoJuanMiguel: string;
  kgsCargados: number; // En Toneladas (Tn)
  fechaCarga: string;
  clienteDestino: string;
  localidadDestino: string;
  kmPuntoCarga: number;
  kmDestino: number;
  totalKm: number;
  tarifaTnKm: number;
  fechaDescarga: string;
  nroProformaOC: string;
  fechaFactura: string;
  factura: string;
  kgsFacturados: number;
  tarifa: number;
  netoGravado: number;
  iva: number;
  totalFacturado: number;
  tnsLiquiFletero: number;
  tarifaFletero: number;
  costoFletero: number; // Haber Flete
  margenPesos: number;
  margenPct: number;
  estadoFacturacion: 'Facturado' | 'Pendiente';
}

export interface DashboardMetrics {
  totalViajes: number;
  viajesPropios: number;
  viajesFleteros: number;
  viajesFacturados: number;
  viajesPendientes: number;
  totalTnCargadas: number;
  totalKmRecorridos: number;
  facturacionNeto: number; // NG total
  totalIVA: number;
  facturacionTotalConIVA: number; // DEBE total
  costoFleterosTotal: number; // Haber Flete
  margenBrutoTotal: number; // Margen Comi Pesos
  margenBrutoPct: number; // Margen global
  tarifaPromedioPorTn: number;
}
