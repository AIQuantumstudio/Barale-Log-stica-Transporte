export interface TripRecord {
  // 1. DATOS GENERALES
  id: string;
  ejercicio: number;
  mes: number;
  fechaLiquiFleteros: string;
  mesAnoOperativo: string;
  fechaOrdenCarga: string;

  // 2. TRANSPORTE Y CHOFER
  tipoTransporte: 'Propio' | 'Fletero';
  transporte: string;
  chofer: string;
  codChofer: string;
  tipoViaje: string;

  // 3. CLIENTE Y REMITENTE
  clienteContrata: string;
  codCliente: string;
  empresaRemitente: string;
  codiProCM?: string;

  // 4. RUTA Y PRODUCTO
  pciaOrigen: string;
  origen: string;
  vinculoViaje?: string;
  clienteDestino: string;
  localidadDestino: string;
  tipoProducto: string;
  producto: string;
  kmPuntoCarga: number;
  kmDestino: number;
  totalKm: number;

  // 5. REMITOS Y TONELADAS
  remitoRemitente: string;
  remitoJuanMiguel: string;
  fechaCarga: string;
  fechaDescarga: string;
  kgsCargados: number; // En Toneladas (Tn)
  factorCorreccion?: string | number;
  kgsAforado?: number;
  kgsDestino?: number;
  difKgs?: number;
  tarifaTnKm: number;

  // 6. FACTURACIÓN Y VENTAS
  factura: string;
  fechaFactura: string;
  fechaProformaOC?: string;
  nroProformaOC: string;
  kgsFacturados: number;
  tarifa: number;
  netoGravado: number;
  iva: number;
  totalFacturado: number; // DEBE

  // 7. LIQUIDACIÓN FLETEROS
  coeComision?: number;
  tnsLiquiFletero: number;
  tarifaFletero: number;
  tarifaFleteroConIva?: number;
  debeFlete?: number;
  costoFletero: number; // Haber Flete
  saldoFlete?: number;

  // 8. RENTABILIDAD BARALE
  margenPesos: number;
  margenPct: number;
  estadoFacturacion: 'Facturado' | 'Pendiente';

  // 9. INFO TANQUES
  peaje?: number;
  precioKmTanque?: number;
  valorViajeAforado27Tn?: number;
  kmLiquidadosAtanor?: number;
  precioKmCobradoAtanor?: number;
  kmLiquidadosBaraleFletero?: number;
  difKmTanque?: number;
  precioKmPagadoFletero?: number;

  // 10. COMPRA PRODUC. TRANSPORTAR
  proveFacA?: string;
  precioUnitCompra?: number;
  precioCompraMinerales?: number;
  totalComprarConIva?: number;
  importeFacProveedor?: number;
  difValorCompraDevengada?: number;
  ingresoNetoServicio?: number;
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
