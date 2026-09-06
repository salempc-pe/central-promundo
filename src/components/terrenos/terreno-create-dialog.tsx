"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TerrenoCompleto,
  Propietario,
} from "@/types";
import {
  LIMA_DISTRICT_BOUNDS,
  validateTerrenoCoordinates,
} from "@/lib/map/geo-validator";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  MapPin,
  DollarSign,
  Layers,
  AlertCircle,
  Plus,
  RefreshCw,
  UserPlus,
  Check,
  X,
  Compass,
} from "lucide-react";

interface TerrenoCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nuevoTerreno: TerrenoCompleto) => Promise<void> | void;
  propietariosDisponibles: Propietario[];
  onCrearPropietario?: (p: Omit<Propietario, "id" | "createdAt" | "updatedAt">) => Promise<Propietario>;
  totalTerrenosCount: number;
}

const DISTRITOS_LIMA = [
  "Miraflores",
  "San Isidro",
  "Santiago de Surco",
  "San Borja",
  "Barranco",
  "Magdalena del Mar",
  "Jesús María",
  "Lince",
  "San Miguel",
  "Pueblo Libre",
  "Surquillo",
  "La Molina",
  "Ate",
  "Chorrillos",
  "Callao",
];

const ZONIFICACIONES = [
  { value: "RDA", label: "RDA - Residencial Densidad Alta" },
  { value: "RDM", label: "RDM - Residencial Densidad Media" },
  { value: "CZ", label: "CZ - Comercio Zonal" },
  { value: "CM", label: "CM - Comercio Metropolitano" },
  { value: "I1", label: "I1 - Industria Elemental / Liviana" },
  { value: "ZTE", label: "ZTE - Zona de Tratamiento Especial" },
];

const USOS_OPCIONES = [
  "Residencial Multifamiliar",
  "Comercio Zonal",
  "Oficinas Corporativas",
  "Hotel Boutique",
  "Retail Primer Nivel",
  "Equipamiento de Salud",
  "Educativo",
];

function getDistrictCodePrefix(distrito: string): string {
  const norm = distrito.toUpperCase().replace(/\s+/g, "");
  if (norm.includes("MIRAFLORES")) return "MIRA";
  if (norm.includes("SANISIDRO")) return "SISI";
  if (norm.includes("SURCO")) return "SURC";
  if (norm.includes("SANBORJA")) return "SBOR";
  if (norm.includes("BARRANCO")) return "BCO";
  if (norm.includes("MAGDALENA")) return "MAG";
  if (norm.includes("JESUSMARIA")) return "JMA";
  if (norm.includes("LINCE")) return "LCE";
  if (norm.includes("SANMIGUEL")) return "SMIG";
  if (norm.includes("PUEBLOLIBRE")) return "PLIB";
  if (norm.includes("SURQUILLO")) return "SURQ";
  if (norm.includes("LAMOLINA")) return "LMOL";
  if (norm.includes("ATE")) return "ATE";
  if (norm.includes("CHORRILLOS")) return "CHO";
  return norm.substring(0, 4);
}

function getCentroidForDistrict(distrito: string): { lat: number; lng: number } {
  const bounds = LIMA_DISTRICT_BOUNDS[distrito];
  if (bounds) {
    return {
      lat: Number(((bounds.minLat + bounds.maxLat) / 2).toFixed(7)),
      lng: Number(((bounds.minLng + bounds.maxLng) / 2).toFixed(7)),
    };
  }
  return { lat: -12.1192, lng: -77.0298 };
}

export function TerrenoCreateDialog({
  isOpen,
  onClose,
  onSubmit,
  propietariosDisponibles,
  onCrearPropietario,
  totalTerrenosCount,
}: TerrenoCreateDialogProps) {
  // Form values
  const [distrito, setDistrito] = useState<string>("Miraflores");
  const [codigoInterno, setCodigoInterno] = useState<string>("");
  const [codigoCustom, setCodigoCustom] = useState<boolean>(false);
  const [propietarioId, setPropietarioId] = useState<string>("");
  const [direccion, setDireccion] = useState<string>("");
  const [referencia, setReferencia] = useState<string>("");

  // Coordenadas
  const [latitud, setLatitud] = useState<string>("-12.1230000");
  const [longitud, setLongitud] = useState<string>("-77.0300000");

  // Parámetros técnicos
  const [zonificacion, setZonificacion] = useState<string>("RDA");
  const [areaM2, setAreaM2] = useState<string>("850");
  const [frenteLinealM, setFrenteLinealM] = useState<string>("20.5");
  const [fondoPromedioM, setFondoPromedioM] = useState<string>("41.46");
  const [alturaMaxPisos, setAlturaMaxPisos] = useState<string>("10");
  const [coeficienteEdificacion, setCoeficienteEdificacion] = useState<string>("4.5");
  const [areaLibreMinPct, setAreaLibreMinPct] = useState<string>("35");
  const [usosPermitidos, setUsosPermitidos] = useState<string[]>([
    "Residencial Multifamiliar",
    "Comercio Zonal",
  ]);

  // Parámetros comerciales
  const [precioTotal, setPrecioTotal] = useState<string>("2550000");
  const [precioM2, setPrecioM2] = useState<string>("3000");
  const [moneda, setMoneda] = useState<"USD" | "PEN">("USD");
  const [estadoTerreno, setEstadoTerreno] = useState<"Disponible" | "En Negociacion" | "Vendido" | "Inactivo">("Disponible");

  // Modal rápido de nuevo propietario
  const [showNuevoPropietario, setShowNuevoPropietario] = useState(false);
  const [nuevoPropNombre, setNuevoPropNombre] = useState("");
  const [nuevoPropTipoDoc, setNuevoPropTipoDoc] = useState("RUC");
  const [nuevoPropNumDoc, setNuevoPropNumDoc] = useState("");
  const [nuevoPropTelefono, setNuevoPropTelefono] = useState("");
  const [nuevoPropEmail, setNuevoPropEmail] = useState("");
  const [nuevoPropRepresentante, setNuevoPropRepresentante] = useState("");

  // Control de errores y loading
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Generar código interno predeterminado
  const generarCodigoSugerido = React.useCallback(
    (dist: string) => {
      const prefix = getDistrictCodePrefix(dist);
      const seq = String(totalTerrenosCount + 1).padStart(3, "0");
      return `TR-${prefix}-${seq}`;
    },
    [totalTerrenosCount]
  );

  // Inicializar código y propietario al abrir
  useEffect(() => {
    if (isOpen) {
      if (!codigoCustom) {
        setCodigoInterno(generarCodigoSugerido(distrito));
      }
      if (!propietarioId && propietariosDisponibles.length > 0) {
        setPropietarioId(propietariosDisponibles[0].id);
      }
    }
  }, [isOpen, distrito, codigoCustom, propietarioId, generarCodigoSugerido, propietariosDisponibles]);

  // Manejar cambio de distrito
  const handleDistritoChange = (nuevoDistrito: string) => {
    setDistrito(nuevoDistrito);
    if (!codigoCustom) {
      setCodigoInterno(generarCodigoSugerido(nuevoDistrito));
    }
    const centroid = getCentroidForDistrict(nuevoDistrito);
    setLatitud(centroid.lat.toString());
    setLongitud(centroid.lng.toString());
  };

  // Cálculos bidireccionales Financieros
  const handleAreaChange = (val: string) => {
    setAreaM2(val);
    const a = parseFloat(val);
    const pM2 = parseFloat(precioM2);
    if (!isNaN(a) && a > 0 && !isNaN(pM2) && pM2 > 0) {
      setPrecioTotal(Math.round(a * pM2).toString());
    }
    const f = parseFloat(frenteLinealM);
    if (!isNaN(a) && a > 0 && !isNaN(f) && f > 0) {
      setFondoPromedioM((a / f).toFixed(2));
    }
  };

  const handlePrecioTotalChange = (val: string) => {
    setPrecioTotal(val);
    const tot = parseFloat(val);
    const a = parseFloat(areaM2);
    if (!isNaN(tot) && tot > 0 && !isNaN(a) && a > 0) {
      setPrecioM2(Math.round(tot / a).toString());
    }
  };

  const handlePrecioM2Change = (val: string) => {
    setPrecioM2(val);
    const pM2 = parseFloat(val);
    const a = parseFloat(areaM2);
    if (!isNaN(pM2) && pM2 > 0 && !isNaN(a) && a > 0) {
      setPrecioTotal(Math.round(a * pM2).toString());
    }
  };

  const handleFrenteChange = (val: string) => {
    setFrenteLinealM(val);
    const f = parseFloat(val);
    const a = parseFloat(areaM2);
    if (!isNaN(f) && f > 0 && !isNaN(a) && a > 0) {
      setFondoPromedioM((a / f).toFixed(2));
    }
  };

  const toggleUso = (uso: string) => {
    if (usosPermitidos.includes(uso)) {
      if (usosPermitidos.length > 1) {
        setUsosPermitidos(usosPermitidos.filter((u) => u !== uso));
      }
    } else {
      setUsosPermitidos([...usosPermitidos, uso]);
    }
  };

  // Registro rápido de nuevo propietario
  const handleGuardarNuevoPropietario = async () => {
    if (!nuevoPropNombre.trim()) {
      setError("Ingresa la razón social o nombre del propietario titular.");
      return;
    }
    try {
      let createdProp: Propietario;
      if (onCrearPropietario) {
        createdProp = await onCrearPropietario({
          razonSocialONombre: nuevoPropNombre.trim(),
          tipoDoc: nuevoPropTipoDoc,
          numeroDoc: nuevoPropNumDoc.trim() || null,
          telefono: nuevoPropTelefono.trim() || null,
          email: nuevoPropEmail.trim() || null,
          contactoRepresentante: nuevoPropRepresentante.trim() || null,
          notasInternas: "Registrado desde alta rápida de terreno.",
        });
      } else {
        createdProp = {
          id: `prop-${Date.now().toString(36)}`,
          razonSocialONombre: nuevoPropNombre.trim(),
          tipoDoc: nuevoPropTipoDoc,
          numeroDoc: nuevoPropNumDoc.trim() || null,
          telefono: nuevoPropTelefono.trim() || null,
          email: nuevoPropEmail.trim() || null,
          contactoRepresentante: nuevoPropRepresentante.trim() || null,
          notasInternas: "Registrado desde alta rápida de terreno.",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      setPropietarioId(createdProp.id);
      setShowNuevoPropietario(false);
      setNuevoPropNombre("");
      setNuevoPropNumDoc("");
      setNuevoPropTelefono("");
      setNuevoPropEmail("");
      setNuevoPropRepresentante("");
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al crear el propietario");
    }
  };

  // Envío final del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!codigoInterno.trim()) {
      setError("El código interno de cartera es obligatorio.");
      return;
    }
    if (!direccion.trim()) {
      setError("Ingresa la dirección oficial del predio.");
      return;
    }
    if (!propietarioId) {
      setError("Debes seleccionar o registrar un propietario titular.");
      return;
    }

    const areaNum = parseFloat(areaM2);
    if (isNaN(areaNum) || areaNum <= 0) {
      setError("El área en m² debe ser un número válido mayor a 0.");
      return;
    }

    const totalNum = parseFloat(precioTotal);
    if (isNaN(totalNum) || totalNum <= 0) {
      setError("El precio total de oferta debe ser mayor a 0 USD.");
      return;
    }

    const latNum = parseFloat(latitud);
    const lngNum = parseFloat(longitud);
    const validacionGeo = validateTerrenoCoordinates(distrito, latNum, lngNum);
    if (!validacionGeo.valid) {
      setError(`Alerta de Georreferenciación: ${validacionGeo.error}`);
      return;
    }

    const propObj = propietariosDisponibles.find((p) => p.id === propietarioId) || {
      id: propietarioId,
      razonSocialONombre: "Titular Registrado",
      tipoDoc: "RUC",
      numeroDoc: "20000000000",
      telefono: null,
      email: null,
      contactoRepresentante: null,
      notasInternas: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const nuevoTerreno: TerrenoCompleto = {
      id: `tr-${Date.now().toString(36)}`,
      codigoInterno: codigoInterno.trim().toUpperCase(),
      propietarioId: propObj.id,
      direccion: direccion.trim(),
      distrito,
      referencia: referencia.trim() || null,
      latitud: latNum.toFixed(7),
      longitud: lngNum.toFixed(7),
      geom: { lat: latNum, lng: lngNum },
      areaM2: areaNum.toFixed(2),
      frenteLinealM: frenteLinealM ? parseFloat(frenteLinealM).toFixed(2) : null,
      fondoPromedioM: fondoPromedioM ? parseFloat(fondoPromedioM).toFixed(2) : null,
      zonificacion,
      alturaMaxPisos: alturaMaxPisos ? parseInt(alturaMaxPisos, 10) : null,
      coeficienteEdificacion: coeficienteEdificacion || null,
      areaLibreMinPct: areaLibreMinPct || null,
      usosPermitidos,
      precioTotal: totalNum.toFixed(2),
      precioM2: parseFloat(precioM2).toFixed(2),
      moneda,
      estadoTerreno,
      createdAt: new Date(),
      updatedAt: new Date(),
      propietario: propObj,
      documentos: [],
      negociaciones: [],
    };

    setSubmitting(true);
    try {
      await onSubmit(nuevoTerreno);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al registrar el lote en el sistema");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white border border-slate-200 shadow-xl rounded-none sm:rounded-sm">
        {/* Cabecera Corporativa Bloomberg Light */}
        <DialogHeader className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold font-mono text-slate-900 tracking-tight">
                  Alta de Lote de Suelo Institucional
                </DialogTitle>
                <DialogDescription className="text-2xs font-mono text-slate-500">
                  Ingreso de nuevo activo territorial a la cartera de inversión
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="font-mono text-3xs font-semibold px-2 py-0.5 border-blue-300 text-blue-700 bg-blue-50/60"
              >
                {codigoInterno || "TR-NUEVO"}
              </Badge>
              <Badge
                variant="outline"
                className="font-mono text-3xs font-semibold px-2 py-0.5 border-emerald-300 text-emerald-700 bg-emerald-50/60"
              >
                {estadoTerreno}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs font-mono">
          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-2xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-mono font-medium">{error}</div>
            </div>
          )}

          {/* Fila 1: Identificación y Código */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/80 rounded border border-slate-200">
            <div>
              <label className="block text-3xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Distrito (Lima Metropolitana) *
              </label>
              <Select value={distrito} onValueChange={handleDistritoChange}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-300 focus:border-blue-500">
                  <SelectValue placeholder="Seleccionar distrito" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {DISTRITOS_LIMA.map((d) => (
                    <SelectItem key={d} value={d} className="text-xs font-mono">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-3xs font-bold text-slate-600 uppercase tracking-wider">
                  Código de Cartera *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCodigoCustom(false);
                    setCodigoInterno(generarCodigoSugerido(distrito));
                  }}
                  className="text-3xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                  title="Restablecer correlativo distrital"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Auto
                </button>
              </div>
              <Input
                value={codigoInterno}
                onChange={(e) => {
                  setCodigoCustom(true);
                  setCodigoInterno(e.target.value.toUpperCase());
                }}
                className="h-8 text-xs font-mono font-bold uppercase bg-white border-slate-300"
                placeholder="TR-MIRA-085"
                required
              />
            </div>

            <div>
              <label className="block text-3xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Estado Comercial
              </label>
              <Select
                value={estadoTerreno}
                onValueChange={(val: any) => setEstadoTerreno(val)}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="Disponible" className="text-xs font-mono text-emerald-700 font-semibold">
                    Disponible
                  </SelectItem>
                  <SelectItem value="En Negociacion" className="text-xs font-mono text-amber-700 font-semibold">
                    En Negociación
                  </SelectItem>
                  <SelectItem value="Vendido" className="text-xs font-mono text-slate-600">
                    Vendido
                  </SelectItem>
                  <SelectItem value="Inactivo" className="text-xs font-mono text-slate-400">
                    Inactivo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fila 2: Propietario Titular */}
          <div className="p-3 bg-white rounded border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-3xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Propietario Titular / Titular Registral en SUNARP *
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowNuevoPropietario(!showNuevoPropietario)}
                className="h-6 text-3xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1.5 gap-1"
              >
                {showNuevoPropietario ? (
                  <>
                    <X className="w-3 h-3" /> Cancelar nuevo
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" /> + Registrar Nuevo Propietario
                  </>
                )}
              </Button>
            </div>

            {showNuevoPropietario ? (
              <div className="p-2.5 rounded bg-blue-50/50 border border-blue-200 space-y-2">
                <div className="text-3xs font-bold text-blue-900 uppercase">
                  Alta Rápida de Titular / Empresa
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Razón Social o Nombre Completo *"
                      value={nuevoPropNombre}
                      onChange={(e) => setNuevoPropNombre(e.target.value)}
                      className="h-7 text-xs bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <Select value={nuevoPropTipoDoc} onValueChange={setNuevoPropTipoDoc}>
                      <SelectTrigger className="h-7 text-2xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="RUC" className="text-2xs">RUC</SelectItem>
                        <SelectItem value="DNI" className="text-2xs">DNI</SelectItem>
                        <SelectItem value="CE" className="text-2xs">CE</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="N° Doc"
                      value={nuevoPropNumDoc}
                      onChange={(e) => setNuevoPropNumDoc(e.target.value)}
                      className="h-7 text-xs bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    placeholder="Teléfono de contacto"
                    value={nuevoPropTelefono}
                    onChange={(e) => setNuevoPropTelefono(e.target.value)}
                    className="h-7 text-xs bg-white"
                  />
                  <Input
                    placeholder="Email de contacto"
                    value={nuevoPropEmail}
                    onChange={(e) => setNuevoPropEmail(e.target.value)}
                    className="h-7 text-xs bg-white"
                  />
                  <Input
                    placeholder="Apoderado / Representante"
                    value={nuevoPropRepresentante}
                    onChange={(e) => setNuevoPropRepresentante(e.target.value)}
                    className="h-7 text-xs bg-white"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleGuardarNuevoPropietario}
                    className="h-7 text-2xs bg-blue-600 hover:bg-blue-700 text-white font-mono gap-1"
                  >
                    <Check className="w-3 h-3" /> Confirmar Titular
                  </Button>
                </div>
              </div>
            ) : (
              <Select value={propietarioId} onValueChange={setPropietarioId}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-300">
                  <SelectValue placeholder="Seleccionar titular registrado" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 max-h-56">
                  {propietariosDisponibles.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs font-mono">
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="font-semibold text-slate-800">{p.razonSocialONombre}</span>
                        <span className="text-slate-400 text-3xs">
                          {p.tipoDoc} {p.numeroDoc || "S/D"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Fila 3: Dirección & Georreferenciación WGS84 */}
          <div className="p-3 bg-white rounded border border-slate-200 space-y-2">
            <label className="text-3xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Dirección Física y Coordenadas WGS84 (Lima Metropolitana)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Input
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Av. Balboa 640 o Jr. Salaverry 410 *"
                  className="h-8 text-xs bg-white border-slate-300"
                  required
                />
              </div>
              <div>
                <Input
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Referencia: Esquina con Av. Principal, frente a parque..."
                  className="h-8 text-xs bg-white border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-3xs font-bold text-slate-500 uppercase w-12">Latitud:</span>
                <Input
                  value={latitud}
                  onChange={(e) => setLatitud(e.target.value)}
                  className="h-7 text-xs font-mono bg-slate-50 border-slate-300"
                  placeholder="-12.1230000"
                />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-3xs font-bold text-slate-500 uppercase w-14">Longitud:</span>
                <Input
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                  className="h-7 text-xs font-mono bg-slate-50 border-slate-300"
                  placeholder="-77.0300000"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const centroid = getCentroidForDistrict(distrito);
                    setLatitud(centroid.lat.toString());
                    setLongitud(centroid.lng.toString());
                  }}
                  title="Calcular centroide del distrito"
                  className="h-7 text-3xs font-mono text-slate-600 px-2 shrink-0 border-slate-300"
                >
                  <Compass className="w-3 h-3 mr-1" />
                  Centroide
                </Button>
              </div>
            </div>
          </div>

          {/* Fila 4: Parámetros Técnicos y Normativos */}
          <div className="p-3 bg-white rounded border border-slate-200 space-y-2">
            <label className="text-3xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Parámetros Urbanísticos & Geometría Predial
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-3xs text-slate-500 font-bold uppercase mb-0.5">
                  Zonificación *
                </label>
                <Select value={zonificacion} onValueChange={setZonificacion}>
                  <SelectTrigger className="h-8 text-xs font-bold bg-white border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {ZONIFICACIONES.map((z) => (
                      <SelectItem key={z.value} value={z.value} className="text-xs font-mono">
                        {z.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-3xs text-slate-500 font-bold uppercase mb-0.5">
                  Área Total (m²) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={areaM2}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  className="h-8 text-xs font-mono font-bold bg-white border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-3xs text-slate-500 font-bold uppercase mb-0.5">
                  Frente Lineal (m)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={frenteLinealM}
                  onChange={(e) => handleFrenteChange(e.target.value)}
                  className="h-8 text-xs font-mono bg-white border-slate-300"
                />
              </div>

              <div>
                <label className="block text-3xs text-slate-500 font-bold uppercase mb-0.5">
                  Fondo Promedio (m)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={fondoPromedioM}
                  onChange={(e) => setFondoPromedioM(e.target.value)}
                  className="h-8 text-xs font-mono bg-slate-50 border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="block text-3xs text-slate-500 font-bold uppercase mb-0.5">
                  Altura Máx (Pisos)
                </label>
                <Input
                  type="number"
                  value={alturaMaxPisos}
                  onChange={(e) => setAlturaMaxPisos(e.target.value)}
                  placeholder="Ej: 10"
                  className="h-8 text-xs font-mono bg-white border-slate-300"
                />
              </div>
              <div>
                <label className="block text-3xs text-slate-500 font-bold uppercase mb-0.5">
                  Coef. Edificación
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={coeficienteEdificacion}
                  onChange={(e) => setCoeficienteEdificacion(e.target.value)}
                  placeholder="Ej: 4.5"
                  className="h-8 text-xs font-mono bg-white border-slate-300"
                />
              </div>
              <div>
                <label className="block text-3xs text-slate-500 font-bold uppercase mb-0.5">
                  Área Libre Mín (%)
                </label>
                <Input
                  type="number"
                  value={areaLibreMinPct}
                  onChange={(e) => setAreaLibreMinPct(e.target.value)}
                  placeholder="Ej: 35"
                  className="h-8 text-xs font-mono bg-white border-slate-300"
                />
              </div>
            </div>

            {/* Usos Permitidos Tags */}
            <div className="pt-1">
              <label className="block text-3xs text-slate-500 font-bold uppercase mb-1">
                Usos Permitidos
              </label>
              <div className="flex flex-wrap gap-1">
                {USOS_OPCIONES.map((uso) => {
                  const selected = usosPermitidos.includes(uso);
                  return (
                    <button
                      key={uso}
                      type="button"
                      onClick={() => toggleUso(uso)}
                      className={`text-3xs font-mono px-2 py-0.5 rounded border transition-colors ${
                        selected
                          ? "bg-blue-50 border-blue-300 text-blue-700 font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {selected ? "✓ " : "+ "}
                      {uso}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Fila 5: Condiciones Comerciales & Cálculo Bidireccional */}
          <div className="p-3 bg-slate-50/80 rounded border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-3xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Condiciones Comerciales & Valuación de Suelo (Cálculo Bidireccional)
              </label>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setMoneda("USD")}
                  className={`text-3xs font-mono px-2 py-0.5 rounded border ${
                    moneda === "USD"
                      ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setMoneda("PEN")}
                  className={`text-3xs font-mono px-2 py-0.5 rounded border ${
                    moneda === "PEN"
                      ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  PEN (S/)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-3xs text-slate-500 font-bold uppercase mb-0.5">
                  Precio Total ({moneda}) *
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                    {moneda === "USD" ? "$" : "S/"}
                  </span>
                  <Input
                    type="number"
                    value={precioTotal}
                    onChange={(e) => handlePrecioTotalChange(e.target.value)}
                    className="h-8 text-xs font-mono font-bold pl-7 bg-white border-slate-300 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-3xs text-slate-500 font-bold uppercase mb-0.5">
                  Precio por Metro Cuadrado ({moneda}/m²) *
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                    {moneda === "USD" ? "$" : "S/"}
                  </span>
                  <Input
                    type="number"
                    value={precioM2}
                    onChange={(e) => handlePrecioM2Change(e.target.value)}
                    className="h-8 text-xs font-mono font-bold pl-7 bg-white border-slate-300 text-emerald-700"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Resumen de Valoración Institucional */}
            <div className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between text-2xs font-mono">
              <div className="text-slate-500">
                Resumen Financiero: <span className="font-bold text-slate-800">{areaM2 || 0} m²</span> @{" "}
                <span className="font-bold text-emerald-700">
                  {formatCurrency(Number(precioM2) || 0)}/m²
                </span>
              </div>
              <div className="font-bold text-slate-900 text-xs">
                Total: {formatCurrency(Number(precioTotal) || 0)}
              </div>
            </div>
          </div>
        </form>

        {/* Footer del Diálogo */}
        <DialogFooter className="px-5 py-3 bg-slate-50 border-t border-slate-200 sm:justify-between items-center gap-2">
          <div className="text-3xs font-mono text-slate-400 hidden sm:block">
            * Campos requeridos para registro en cartera institucional
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-2xs font-mono border-slate-300 text-slate-700 hover:bg-slate-100"
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
              className="h-8 text-2xs font-mono bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              {submitting ? "Registrando Lote..." : "Guardar en Cartera"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
