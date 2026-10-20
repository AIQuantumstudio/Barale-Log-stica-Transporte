import React, { useState, useEffect } from 'react';
import { TripRecord } from '../types/logistics';
import { DriverMaster, ClientMaster, MONTHS_2026 } from '../data/masterRecords';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { X, Truck, PlusCircle, User, Building2, Trash2, ChevronDown, Check, Calendar } from 'lucide-react';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrip: (trip: TripRecord) => void;
  drivers: DriverMaster[];
  clients: ClientMaster[];
  onAddDriver: (driver: { name: string; transporte: string; tipo: 'Propio' | 'Fletero'; codChofer: string }) => void;
  onDeleteDriver: (driverIdOrName: string) => void;
  onAddClient: (client: { name: string; codCliente: string; empresaRemitente: string }) => void;
  onDeleteClient: (clientIdOrName: string) => void;
  selectedPeriod?: string;
}

export const NewTripModal: React.FC<NewTripModalProps> = ({
  isOpen,
  onClose,
  onAddTrip,
  drivers,
  clients,
  onAddDriver,
  onDeleteDriver,
  onAddClient,
  onDeleteClient,
  selectedPeriod = 'ago-26'
}) => {
  if (!isOpen) return null;

  // Selected operational month
  const initialMonthId = selectedPeriod !== 'all' ? selectedPeriod : 'ago-26';
  const [selectedMonthId, setSelectedMonthId] = useState<string>(initialMonthId);

  const [fechaCarga, setFechaCarga] = useState(new Date().toLocaleDateString('es-AR'));
  const [tipoTransporte, setTipoTransporte] = useState<'Propio' | 'Fletero'>('Propio');
  const [transporte, setTransporte] = useState('JUAN y MIGUEL');
  const [chofer, setChofer] = useState(drivers[0]?.name || 'Ruben Martin');
  const [codChofer, setCodChofer] = useState(drivers[0]?.codChofer || '10');

  const [clienteContrata, setClienteContrata] = useState(clients[0]?.name || 'RONATA');
  const [codCliente, setCodCliente] = useState(clients[0]?.codCliente || '1001');
  const [empresaRemitente, setEmpresaRemitente] = useState(clients[0]?.empresaRemitente || 'ABIC');

  const [pciaOrigen, setPciaOrigen] = useState('San Luis');
  const [origen, setOrigen] = useState('Balde');
  const [clienteDestino, setClienteDestino] = useState(clients[0]?.name || 'RONATA');
  const [localidadDestino, setLocalidadDestino] = useState('Rio Tercero');
  const [tipoProducto, setTipoProducto] = useState('Sal');
  const [producto, setProducto] = useState('Sal');
  const [remitoRemitente, setRemitoRemitente] = useState('');
  const [remitoJuanMiguel, setRemitoJuanMiguel] = useState('');
  const [kgsCargados, setKgsCargados] = useState<number>(33.5);
  const [tarifa, setTarifa] = useState<number>(4254.87);
  const [tarifaFletero, setTarifaFletero] = useState<number>(2904.03);
  const [totalKm, setTotalKm] = useState<number>(0);
  const [factura, setFactura] = useState('');
  const [nroProformaOC] = useState('');
  const [estadoFacturacion, setEstadoFacturacion] = useState<'Facturado' | 'Pendiente'>('Facturado');

  // UI state for Dropdown menus
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');
  const [isNewDriverInlineOpen, setIsNewDriverInlineOpen] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverTransport, setNewDriverTransport] = useState('');
  const [newDriverTipo, setNewDriverTipo] = useState<'Propio' | 'Fletero'>('Propio');

  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [isNewClientInlineOpen, setIsNewClientInlineOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCod, setNewClientCod] = useState('');
  const [newClientRemitente, setNewClientRemitente] = useState('');

  // Calculations
  const netoGravado = estadoFacturacion === 'Pendiente' ? 0 : kgsCargados * tarifa;
  const iva = netoGravado * 0.21;
  const totalFacturado = netoGravado + iva;
  const costoFletero = (tipoTransporte === 'Fletero' && estadoFacturacion !== 'Pendiente') ? kgsCargados * tarifaFletero : 0;
  const margenPesos = netoGravado - costoFletero;
  const margenPct = netoGravado > 0 ? margenPesos / netoGravado : 0;

  // Filtered lists for dropdowns
  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(driverSearch.toLowerCase()) || 
    d.transporte.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.codCliente.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleSelectDriver = (d: DriverMaster) => {
    setChofer(d.name);
    setTipoTransporte(d.tipo);
    setTransporte(d.transporte);
    setCodChofer(d.codChofer || (d.tipo === 'Propio' ? '10' : '500'));
    setIsDriverDropdownOpen(false);
  };

  const handleCreateAndSelectDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim()) return;

    const newDrv = {
      name: newDriverName.trim(),
      transporte: newDriverTipo === 'Propio' ? 'JUAN y MIGUEL' : (newDriverTransport.trim() || 'Fletero Asignado'),
      tipo: newDriverTipo,
      codChofer: newDriverTipo === 'Propio' ? '25' : '650'
    };
    onAddDriver(newDrv);

    setChofer(newDrv.name);
    setTipoTransporte(newDrv.tipo);
    setTransporte(newDrv.transporte);
    setCodChofer(newDrv.codChofer);

    setNewDriverName('');
    setNewDriverTransport('');
    setIsNewDriverInlineOpen(false);
    setIsDriverDropdownOpen(false);
  };

  const handleSelectClient = (c: ClientMaster) => {
    setClienteContrata(c.name);
    setCodCliente(c.codCliente);
    setEmpresaRemitente(c.empresaRemitente);
    setClienteDestino(c.name);
    setIsClientDropdownOpen(false);
  };

  const handleCreateAndSelectClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newCli = {
      name: newClientName.trim().toUpperCase(),
      codCliente: newClientCod.trim() || '1800',
      empresaRemitente: newClientRemitente.trim() || newClientName.trim().toUpperCase()
    };
    onAddClient(newCli);

    setClienteContrata(newCli.name);
    setCodCliente(newCli.codCliente);
    setEmpresaRemitente(newCli.empresaRemitente);
    setClienteDestino(newCli.name);

    setNewClientName('');
    setNewClientCod('');
    setNewClientRemitente('');
    setIsNewClientInlineOpen(false);
    setIsClientDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const monthDef = MONTHS_2026.find(m => m.id === selectedMonthId) || MONTHS_2026[7]; // default ago-26

    const newRecord: TripRecord = {
      id: `TRP-${Date.now().toString().slice(-4)}`,
      ejercicio: monthDef.year,
      mes: monthDef.monthNumber,
      fechaLiquiFleteros: monthDef.id,
      mesAnoOperativo: monthDef.id,
      fechaOrdenCarga: fechaCarga,
      tipoViaje: '1',
      codChofer,
      tipoTransporte,
      transporte: tipoTransporte === 'Propio' ? 'JUAN y MIGUEL' : transporte,
      chofer,
      codCliente,
      clienteContrata,
      empresaRemitente,
      pciaOrigen,
      origen,
      tipoProducto,
      producto,
      remitoRemitente: remitoRemitente || 'Directo',
      remitoJuanMiguel: remitoJuanMiguel || 'Directo',
      kgsCargados,
      fechaCarga,
      clienteDestino,
      localidadDestino,
      kmPuntoCarga: Math.round(totalKm / 2),
      kmDestino: Math.round(totalKm / 2),
      totalKm,
      tarifaTnKm: 0,
      fechaDescarga: fechaCarga,
      nroProformaOC,
      fechaFactura: estadoFacturacion === 'Facturado' ? fechaCarga : 'Pendiente',
      factura: factura || (estadoFacturacion === 'Facturado' ? '0012-00910' : 'Pendiente'),
      kgsFacturados: kgsCargados,
      tarifa,
      netoGravado,
      iva,
      totalFacturado,
      tnsLiquiFletero: tipoTransporte === 'Fletero' ? kgsCargados : 0,
      tarifaFletero: tipoTransporte === 'Fletero' ? tarifaFletero : 0,
      costoFletero,
      margenPesos,
      margenPct,
      estadoFacturacion
    };

    onAddTrip(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl text-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Registrar Nuevo Viaje / Carga
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Alta de viaje con asignación de chofer, cliente y mes operativo
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          
          {/* SECTOR 0: MES OPERATIVO (12 MESES DEL AÑO) */}
          <div className="bg-blue-950/30 p-3.5 rounded-xl border border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <div>
                <span className="font-semibold text-white block">Mes Operativo de la Carga</span>
                <span className="text-[11px] text-slate-400">Determina el período contable en la Base de Datos anual</span>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <select
                value={selectedMonthId}
                onChange={(e) => setSelectedMonthId(e.target.value)}
                className="w-full sm:w-56 bg-slate-800 border border-blue-500/50 rounded-lg px-3 py-1.5 text-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
              >
                {MONTHS_2026.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} 2026 ({m.shortTag})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTOR 1: CHOFER Y FLETERO CON DESPLEGABLE DINÁMICO */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                  1. Chofer & Fletero (Padrón Desplegable)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTipoTransporte('Propio');
                    setTransporte('JUAN y MIGUEL');
                  }}
                  className={`px-3 py-1 rounded-md font-medium cursor-pointer ${tipoTransporte === 'Propio' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Flota Propia
                </button>
                <button
                  type="button"
                  onClick={() => setTipoTransporte('Fletero')}
                  className={`px-3 py-1 rounded-md font-medium cursor-pointer ${tipoTransporte === 'Fletero' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Fletero Tercero
                </button>
              </div>
            </div>

            {/* Selector de Chofer Desplegable con Alta y Baja */}
            <div className="relative">
              <label className="block text-slate-400 mb-1">
                Seleccionar Chofer Guardado (Hacé clic para desplegar o registrar nuevo):
              </label>

              {/* Botón trigger del Desplegable */}
              <div 
                onClick={() => setIsDriverDropdownOpen(!isDriverDropdownOpen)}
                className="w-full bg-slate-800 border border-slate-700 hover:border-amber-500/60 rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-sm">{chofer || 'Seleccionar chofer...'}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    tipoTransporte === 'Propio' ? 'bg-blue-600/30 text-blue-300' : 'bg-amber-600/30 text-amber-300'
                  }`}>
                    {tipoTransporte} ({transporte})
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* Menú Flotante Desplegable de Choferes */}
              {isDriverDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-30 space-y-2">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <input
                      type="text"
                      placeholder="Buscar chofer..."
                      value={driverSearch}
                      onChange={(e) => setDriverSearch(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white w-full focus:outline-none focus:ring-1 focus:ring-amber-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      type="button"
                      onClick={() => setIsNewDriverInlineOpen(!isNewDriverInlineOpen)}
                      className="whitespace-nowrap px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-[11px] cursor-pointer"
                    >
                      {isNewDriverInlineOpen ? 'Cerrar' : '+ Nuevo'}
                    </button>
                  </div>

                  {/* Formulario Inline para agregar Chofer y guardarlo al padrón */}
                  {isNewDriverInlineOpen && (
                    <div className="p-3 bg-amber-950/20 border border-amber-600/30 rounded-lg space-y-2">
                      <span className="text-[11px] font-bold text-amber-300 block">
                        Agregar Nuevo Chofer al Padrón:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Nombre del Chofer"
                          value={newDriverName}
                          onChange={(e) => setNewDriverName(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Transporte / Razón Social"
                          value={newDriverTransport}
                          onChange={(e) => setNewDriverTransport(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setNewDriverTipo('Propio')}
                            className={`px-2 py-0.5 rounded text-[10px] ${newDriverTipo === 'Propio' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                          >
                            Propio
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewDriverTipo('Fletero')}
                            className={`px-2 py-0.5 rounded text-[10px] ${newDriverTipo === 'Fletero' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                          >
                            Fletero
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleCreateAndSelectDriver}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs cursor-pointer"
                        >
                          + Guardar Chofer
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista de Choferes con opción de Selección y Eliminación */}
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-800">
                    {filteredDrivers.map(d => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between p-2 hover:bg-slate-800/80 rounded transition-colors group"
                      >
                        <div 
                          onClick={() => handleSelectDriver(d)}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <span className="font-semibold text-white">{d.name}</span>
                          <span className="text-[10px] text-slate-400">({d.transporte})</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            d.tipo === 'Propio' ? 'bg-blue-600/20 text-blue-300' : 'bg-amber-600/20 text-amber-300'
                          }`}>
                            {d.tipo}
                          </span>
                          {chofer === d.name && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                        </div>

                        {/* Botón Eliminar Chofer del Padrón */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`¿Eliminar al chofer ${d.name} del padrón?`)) {
                              onDeleteDriver(d.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer ml-2"
                          title={`Eliminar ${d.name} de la lista`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {filteredDrivers.length === 0 && (
                      <div className="p-3 text-center text-slate-500 text-xs">
                        No se encontraron choferes. Registralo con "+ Nuevo".
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1">Transporte / Razón Social</label>
                <input
                  type="text"
                  required
                  value={transporte}
                  onChange={(e) => setTransporte(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Cód. Chofer</label>
                <input
                  type="text"
                  value={codChofer}
                  onChange={(e) => setCodChofer(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTOR 2: CLIENTE Y REMITENTE CON DESPLEGABLE DINÁMICO */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                2. Cliente & Trayecto (Padrón Desplegable)
              </span>
            </div>

            {/* Selector de Cliente Desplegable con Alta y Baja */}
            <div className="relative">
              <label className="block text-slate-400 mb-1">
                Cliente Contrata Servicio (Hacé clic para desplegar o registrar nuevo):
              </label>

              {/* Botón trigger del Desplegable de Clientes */}
              <div 
                onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                className="w-full bg-slate-800 border border-slate-700 hover:border-purple-500/60 rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-white text-sm">{clienteContrata || 'Seleccionar cliente...'}</span>
                  {codCliente && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-600/30 text-purple-300 font-mono">
                      Cód: {codCliente}
                    </span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* Menú Flotante Desplegable de Clientes */}
              {isClientDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-30 space-y-2">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <input
                      type="text"
                      placeholder="Buscar cliente por nombre o código..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white w-full focus:outline-none focus:ring-1 focus:ring-purple-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      type="button"
                      onClick={() => setIsNewClientInlineOpen(!isNewClientInlineOpen)}
                      className="whitespace-nowrap px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-[11px] cursor-pointer"
                    >
                      {isNewClientInlineOpen ? 'Cerrar' : '+ Nuevo'}
                    </button>
                  </div>

                  {/* Formulario Inline para agregar Cliente y guardarlo al padrón */}
                  {isNewClientInlineOpen && (
                    <div className="p-3 bg-purple-950/20 border border-purple-600/30 rounded-lg space-y-2">
                      <span className="text-[11px] font-bold text-purple-300 block">
                        Agregar Nuevo Cliente al Padrón:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Nombre / Razón Social"
                          value={newClientName}
                          onChange={(e) => setNewClientName(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Cód. Cliente (ej: 1850)"
                          value={newClientCod}
                          onChange={(e) => setNewClientCod(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Empresa Remitente"
                          value={newClientRemitente}
                          onChange={(e) => setNewClientRemitente(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleCreateAndSelectClient}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs cursor-pointer"
                        >
                          + Guardar Cliente
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista de Clientes con opción de Selección y Eliminación */}
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-800">
                    {filteredClients.map(c => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2 hover:bg-slate-800/80 rounded transition-colors group"
                      >
                        <div 
                          onClick={() => handleSelectClient(c)}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <span className="font-semibold text-white">{c.name}</span>
                          <span className="text-[10px] text-slate-400">({c.empresaRemitente})</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-purple-600/20 text-purple-300">
                            Cód: {c.codCliente}
                          </span>
                          {clienteContrata === c.name && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                        </div>

                        {/* Botón Eliminar Cliente del Padrón */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`¿Eliminar al cliente ${c.name} del padrón?`)) {
                              onDeleteClient(c.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer ml-2"
                          title={`Eliminar ${c.name} de la lista`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {filteredClients.length === 0 && (
                      <div className="p-3 text-center text-slate-500 text-xs">
                        No se encontraron clientes. Registralo con "+ Nuevo".
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1">Empresa Remitente</label>
                <input
                  type="text"
                  value={empresaRemitente}
                  onChange={(e) => setEmpresaRemitente(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Origen (Localidad)</label>
                <input
                  type="text"
                  required
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Destino (Localidad)</label>
                <input
                  type="text"
                  required
                  value={localidadDestino}
                  onChange={(e) => setLocalidadDestino(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTOR 3: CARGA & DOCUMENTACIÓN */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] block">
              3. Carga & Documentación
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1">Producto</label>
                <input
                  type="text"
                  required
                  value={producto}
                  onChange={(e) => setProducto(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Categoría</label>
                <select
                  value={tipoProducto}
                  onChange={(e) => setTipoProducto(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="Sal">Sal</option>
                  <option value="Cereales">Cereales</option>
                  <option value="Tanques">Tanques (Químico)</option>
                  <option value="Minerales">Minerales</option>
                  <option value="Alquiler Batea">Batea</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Tn Cargadas</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={kgsCargados}
                  onChange={(e) => setKgsCargados(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Km Recorrido</label>
                <input
                  type="number"
                  value={totalKm}
                  onChange={(e) => setTotalKm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Remito Remitente</label>
                <input
                  type="text"
                  value={remitoRemitente}
                  onChange={(e) => setRemitoRemitente(e.target.value)}
                  placeholder="Ej: 1355"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Remito Juan y Miguel</label>
                <input
                  type="text"
                  value={remitoJuanMiguel}
                  onChange={(e) => setRemitoJuanMiguel(e.target.value)}
                  placeholder="Ej: 107120"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Fecha Carga</label>
                <input
                  type="text"
                  value={fechaCarga}
                  onChange={(e) => setFechaCarga(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Estado</label>
                <select
                  value={estadoFacturacion}
                  onChange={(e) => setEstadoFacturacion(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="Facturado">Facturado</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTOR 4: TARIFAS & FACTURACIÓN */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] block">
              4. Facturación & Liquidación
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1">Tarifa Cliente ($/Tn)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tarifa}
                  onChange={(e) => setTarifa(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold"
                />
              </div>
              {tipoTransporte === 'Fletero' && (
                <div>
                  <label className="block text-amber-400 mb-1">Tarifa Fletero ($/Tn)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tarifaFletero}
                    onChange={(e) => setTarifaFletero(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-amber-600/50 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono font-bold"
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-400 mb-1">Nro Factura</label>
                <input
                  type="text"
                  value={factura}
                  onChange={(e) => setFactura(e.target.value)}
                  placeholder="Ej: 0012-00895"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            {/* Vista previa económica */}
            <div className="mt-2 pt-2 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
              <div>
                <span className="text-slate-400 block">Neto Gravado:</span>
                <span className="font-mono font-semibold text-white">{formatCurrency(netoGravado)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total c/IVA:</span>
                <span className="font-mono font-semibold text-slate-300">{formatCurrency(totalFacturado)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Costo Fletero:</span>
                <span className="font-mono font-semibold text-amber-400">{costoFletero > 0 ? `-${formatCurrency(costoFletero)}` : '$0'}</span>
              </div>
              <div>
                <span className="text-emerald-400 block font-semibold">Margen Barale:</span>
                <span className="font-mono font-bold text-emerald-400">{formatCurrency(margenPesos)} ({formatPercent(margenPct)})</span>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Guardar Viaje en Base de Datos</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
