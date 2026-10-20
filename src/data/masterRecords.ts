export interface DriverMaster {
  id: string;
  name: string;
  transporte: string;
  tipo: 'Propio' | 'Fletero';
  codChofer: string;
}

export interface ClientMaster {
  id: string;
  name: string;
  codCliente: string;
  empresaRemitente: string;
}

export interface MonthDefinition {
  id: string;          // 'ene-26', 'feb-26', etc.
  name: string;        // 'Enero', 'Febrero', etc.
  monthNumber: number; // 1 to 12
  year: number;        // 2026
  label: string;       // 'Enero 2026'
  shortTag: string;    // 'Ene-26'
}

export const MONTHS_2026: MonthDefinition[] = [
  { id: 'ene-26', name: 'Enero', monthNumber: 1, year: 2026, label: 'Enero 2026', shortTag: 'Ene-26' },
  { id: 'feb-26', name: 'Febrero', monthNumber: 2, year: 2026, label: 'Febrero 2026', shortTag: 'Feb-26' },
  { id: 'mar-26', name: 'Marzo', monthNumber: 3, year: 2026, label: 'Marzo 2026', shortTag: 'Mar-26' },
  { id: 'abr-26', name: 'Abril', monthNumber: 4, year: 2026, label: 'Abril 2026', shortTag: 'Abr-26' },
  { id: 'may-26', name: 'Mayo', monthNumber: 5, year: 2026, label: 'Mayo 2026', shortTag: 'May-26' },
  { id: 'jun-26', name: 'Junio', monthNumber: 6, year: 2026, label: 'Junio 2026', shortTag: 'Jun-26' },
  { id: 'jul-26', name: 'Julio', monthNumber: 7, year: 2026, label: 'Julio 2026', shortTag: 'Jul-26' },
  { id: 'ago-26', name: 'Agosto', monthNumber: 8, year: 2026, label: 'Agosto 2026', shortTag: 'Ago-26' },
  { id: 'sep-26', name: 'Septiembre', monthNumber: 9, year: 2026, label: 'Septiembre 2026', shortTag: 'Sep-26' },
  { id: 'oct-26', name: 'Octubre', monthNumber: 10, year: 2026, label: 'Octubre 2026', shortTag: 'Oct-26' },
  { id: 'nov-26', name: 'Noviembre', monthNumber: 11, year: 2026, label: 'Noviembre 2026', shortTag: 'Nov-26' },
  { id: 'dic-26', name: 'Diciembre', monthNumber: 12, year: 2026, label: 'Diciembre 2026', shortTag: 'Dic-26' },
];

export const INITIAL_DRIVERS: DriverMaster[] = [
  { id: 'DRV-01', name: 'Ruben Martin', transporte: 'JUAN y MIGUEL', tipo: 'Propio', codChofer: '10' },
  { id: 'DRV-02', name: 'Moyano Esteban', transporte: 'Ruben Eduardo', tipo: 'Fletero', codChofer: '401' },
  { id: 'DRV-03', name: 'Tosco', transporte: 'JUAN y MIGUEL', tipo: 'Propio', codChofer: '4' },
  { id: 'DRV-04', name: 'Rivarola Jorge', transporte: 'JUAN y MIGUEL', tipo: 'Propio', codChofer: '15' },
  { id: 'DRV-05', name: 'Quiroga', transporte: 'JUAN y MIGUEL', tipo: 'Propio', codChofer: '13' },
  { id: 'DRV-06', name: 'Lopez Maximiliano', transporte: 'JUAN y MIGUEL', tipo: 'Propio', codChofer: '5' },
  { id: 'DRV-07', name: 'Moreno Mauro', transporte: 'JUAN y MIGUEL', tipo: 'Propio', codChofer: '8' },
  { id: 'DRV-08', name: 'Cejas Antonio', transporte: 'JUAN y MIGUEL', tipo: 'Propio', codChofer: '12' },
  { id: 'DRV-09', name: 'Ledesma Jonatan', transporte: 'JUAN y MIGUEL', tipo: 'Propio', codChofer: '14' },
  { id: 'DRV-10', name: 'Bruni Emilio', transporte: 'JUAN y MIGUEL', tipo: 'Propio', codChofer: '6' },
  { id: 'DRV-11', name: 'Lucero Mauricio', transporte: 'Lucero', tipo: 'Fletero', codChofer: '601' },
  { id: 'DRV-12', name: 'Martinez Nestor', transporte: 'Martinez', tipo: 'Fletero', codChofer: '501' },
  { id: 'DRV-13', name: 'Sosa Juan', transporte: 'JUAN y MIGUEL', tipo: 'Propio', codChofer: '11' },
  { id: 'DRV-14', name: 'Ledesma', transporte: 'JUAN y MIGUEL', tipo: 'Propio', codChofer: '34' },
  { id: 'DRV-15', name: 'Barrilin Roberto', transporte: 'Barrilin Roberto', tipo: 'Fletero', codChofer: '301' },
  { id: 'DRV-16', name: 'Galvan', transporte: 'Galvan', tipo: 'Fletero', codChofer: '901' },
  { id: 'DRV-17', name: 'Conducción Propia', transporte: 'JUAN y MIGUEL', tipo: 'Propio', codChofer: '10' },
  { id: 'DRV-18', name: 'Hugo Garro', transporte: 'JUAN y MIGUEL', tipo: 'Propio', codChofer: '16' },
  { id: 'DRV-19', name: 'Marcelo Gomez', transporte: 'Transp. Gomez', tipo: 'Fletero', codChofer: '702' },
];

export const INITIAL_CLIENTS: ClientMaster[] = [
  { id: 'CLI-01', name: 'RONATA', codCliente: '1001', empresaRemitente: 'ABIC' },
  { id: 'CLI-02', name: 'ALACAL SRL', codCliente: '1690', empresaRemitente: 'GRUPO A SA' },
  { id: 'CLI-03', name: 'ABIC', codCliente: '1701', empresaRemitente: 'ABIC' },
  { id: 'CLI-04', name: 'PUCARA', codCliente: '1543', empresaRemitente: 'EL TALAR SRL' },
  { id: 'CLI-05', name: 'GRUPO CKOSS SRL', codCliente: '1580', empresaRemitente: 'CINTIA VILCHES - TTE CARGA ELENA' },
  { id: 'CLI-06', name: 'HECTOR A BERTONE', codCliente: '1656', empresaRemitente: 'CINTIA VILCHES - TTE CARGA ELENA' },
  { id: 'CLI-07', name: 'BRESSAN', codCliente: '1544', empresaRemitente: 'GRANAM' },
  { id: 'CLI-08', name: 'GRANJA SAN JUAN', codCliente: '1526', empresaRemitente: 'ESTABLECIMIENTO LAS CHILCAS' },
  { id: 'CLI-09', name: 'TRANSPORTE JOSE CARLOS SRL', codCliente: '1344', empresaRemitente: 'SOLDANO' },
  { id: 'CLI-10', name: 'GLOBE', codCliente: '1138', empresaRemitente: 'LONGO JUAN' },
  { id: 'CLI-11', name: 'BARRILIN ROBERTO', codCliente: 'Alquiler B.U', empresaRemitente: 'JUAN Y MIUEL' },
  { id: 'CLI-12', name: 'LUCERO CESAR MAURICIO', codCliente: 'Alquiler B.U', empresaRemitente: 'JUAN Y MIUEL' },
  { id: 'CLI-13', name: 'MARTINEZ NESTOR JABIER', codCliente: 'Alquiler B.U', empresaRemitente: 'JUAN Y MIUEL' },
  { id: 'CLI-14', name: 'RUBEN EDUARDO EZEQUIEL', codCliente: '1000', empresaRemitente: 'RUBEN EDUARDO EZEQUIEL' },
  { id: 'CLI-15', name: 'RUBEN EMANUEL ALEJANDRO', codCliente: '1000', empresaRemitente: 'RUBEN EMANUEL ALEJANDRO' },
  { id: 'CLI-16', name: 'RUBEN EDUARDO JOSE', codCliente: '1000', empresaRemitente: 'RUBEN EDUARDO JOSE' },
  { id: 'CLI-17', name: 'GALEAZZI FRANCO MAURICIO', codCliente: '1000', empresaRemitente: 'GALEAZZI FRANCO MAURICIO' },
  { id: 'CLI-18', name: 'DALMASO - RONATA', codCliente: '1000', empresaRemitente: 'DALMASO - RONATA' },
  { id: 'CLI-19', name: 'AGROEMPRESA COLON', codCliente: '1210', empresaRemitente: 'AGROEMPRESA COLON SA' },
  { id: 'CLI-20', name: 'AGRO SERVICES', codCliente: '1450', empresaRemitente: 'AGRO SERVICES SA' },
  { id: 'CLI-21', name: 'OLEAGINOSA MORENO', codCliente: '1320', empresaRemitente: 'OLEAGINOSA MORENO HNOS' },
  { id: 'CLI-22', name: 'BIOFARMA', codCliente: '1105', empresaRemitente: 'BIOFARMA SA' },
  { id: 'CLI-23', name: 'CARGILL', codCliente: '1050', empresaRemitente: 'CARGILL SACI' },
  { id: 'CLI-24', name: 'BUNGE', codCliente: '1060', empresaRemitente: 'BUNGE ARGENTINA SA' },
];

export const DRIVERS_STORAGE_KEY = 'barale_drivers_master_v2';
export const CLIENTS_STORAGE_KEY = 'barale_clients_master_v2';

export const loadStoredDrivers = (): DriverMaster[] => {
  try {
    const raw = localStorage.getItem(DRIVERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error cargando choferes guardados:', e);
  }
  return INITIAL_DRIVERS;
};

export const saveStoredDrivers = (drivers: DriverMaster[]): void => {
  try {
    localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers));
  } catch (e) {
    console.error('Error guardando choferes:', e);
  }
};

export const loadStoredClients = (): ClientMaster[] => {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error cargando clientes guardados:', e);
  }
  return INITIAL_CLIENTS;
};

export const saveStoredClients = (clients: ClientMaster[]): void => {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error('Error guardando clientes:', e);
  }
};
