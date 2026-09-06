"use client";

import React, { useState, useMemo } from "react";
import type { SolicitudAcceso, RolUsuario, EstadoAcceso } from "@/types/auth";
import { SUPER_ADMIN_EMAIL } from "@/types/auth";
import {
  aprobarAccesoAction,
  denegarAccesoAction,
  cambiarRolAction,
} from "@/app/auth/actions";
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  RefreshCw,
  Mail,
  UserCog,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface AccesosClientProps {
  initialUsuarios: SolicitudAcceso[];
}

export function AccesosClient({ initialUsuarios }: AccesosClientProps) {
  const [usuarios, setUsuarios] = useState<SolicitudAcceso[]>(initialUsuarios);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modales de Acción
  const [modalAprobar, setModalAprobar] = useState<{ open: boolean; usuario: SolicitudAcceso | null }>({
    open: false,
    usuario: null,
  });
  const [rolSeleccionado, setRolSeleccionado] = useState<RolUsuario>("broker_junior");
  const [notasAprobacion, setNotasAprobacion] = useState<string>("");

  const [modalDenegar, setModalDenegar] = useState<{ open: boolean; usuario: SolicitudAcceso | null }>({
    open: false,
    usuario: null,
  });
  const [motivoDenegacion, setMotivoDenegacion] = useState<string>("");

  // KPIs
  const kpis = useMemo(() => {
    const pendientes = usuarios.filter((u) => u.estadoAcceso === "pendiente").length;
    const aprobados = usuarios.filter((u) => u.estadoAcceso === "aprobado" && u.activo).length;
    const denegados = usuarios.filter((u) => u.estadoAcceso === "denegado" || !u.activo).length;
    return { pendientes, aprobados, denegados, total: usuarios.length };
  }, [usuarios]);

  // Lista Filtrada
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      // Filtro por tab de estado
      if (filtroEstado !== "todos" && u.estadoAcceso !== filtroEstado) {
        return false;
      }
      // Filtro por búsqueda
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim();
        const coincideNombre = u.nombre.toLowerCase().includes(query);
        const coincideEmail = u.email.toLowerCase().includes(query);
        const coincideRol = u.rol.toLowerCase().includes(query);
        if (!coincideNombre && !coincideEmail && !coincideRol) {
          return false;
        }
      }
      return true;
    });
  }, [usuarios, filtroEstado, busqueda]);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Ejecutar Aprobación
  const handleConfirmarAprobacion = async () => {
    if (!modalAprobar.usuario) return;
    setIsProcessing(true);
    try {
      const res = await aprobarAccesoAction(
        modalAprobar.usuario.id,
        rolSeleccionado,
        notasAprobacion
      );
      if (res) {
        setUsuarios((prev) =>
          prev.map((u) => (u.id === modalAprobar.usuario!.id ? res : u))
        );
        showNotification(
          "success",
          `Acceso concedido a ${modalAprobar.usuario.nombre} con rol ${rolSeleccionado}.`
        );
      }
      setModalAprobar({ open: false, usuario: null });
      setNotasAprobacion("");
    } catch {
      showNotification("error", "Ocurrió un error al aprobar el acceso.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Ejecutar Denegación
  const handleConfirmarDenegacion = async () => {
    if (!modalDenegar.usuario) return;
    setIsProcessing(true);
    try {
      const res = await denegarAccesoAction(
        modalDenegar.usuario.id,
        motivoDenegacion
      );
      if (res) {
        setUsuarios((prev) =>
          prev.map((u) => (u.id === modalDenegar.usuario!.id ? res : u))
        );
        showNotification(
          "success",
          `Acceso denegado a ${modalDenegar.usuario.nombre}.`
        );
      }
      setModalDenegar({ open: false, usuario: null });
      setMotivoDenegacion("");
    } catch {
      showNotification("error", "Ocurrió un error al denegar el acceso.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Cambiar Rol Directamente
  const handleCambiarRol = async (usuario: SolicitudAcceso, nuevoRol: RolUsuario) => {
    if (usuario.email === SUPER_ADMIN_EMAIL && nuevoRol !== "admin") {
      showNotification("error", "El Superadministrador no puede cambiar de rol.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await cambiarRolAction(usuario.id, nuevoRol);
      if (res) {
        setUsuarios((prev) =>
          prev.map((u) => (u.id === usuario.id ? res : u))
        );
        showNotification("success", `Rol de ${usuario.nombre} actualizado a ${nuevoRol}.`);
      }
    } catch {
      showNotification("error", "Error al actualizar el rol.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3 pb-8">
      {/* Título y Subtítulo de Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              GESTIÓN DE ACCESOS & SOLICITUDES GOOGLE
            </h1>
            <span className="text-3xs font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
              MODULO ADMIN
            </span>
          </div>
          <p className="text-2xs text-slate-500 font-medium">
            Aprobación manual de usuarios que ingresan con cuenta de Google y control fiduciario de roles.
          </p>
        </div>

        {/* Administrador Titular */}
        <div className="flex items-center space-x-2 bg-blue-50/70 border border-blue-200 rounded px-2.5 py-1 text-2xs font-mono">
          <Lock className="w-3 h-3 text-blue-600" />
          <span className="text-blue-900 font-semibold">Superadmin:</span>
          <span className="text-blue-700 font-bold">{SUPER_ADMIN_EMAIL}</span>
        </div>
      </div>

      {/* Alerta / Notificación flotante */}
      {notification && (
        <div
          className={`p-2.5 rounded text-2xs flex items-center justify-between border ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold px-1 hover:opacity-75"
          >
            &times;
          </button>
        </div>
      )}

      {/* KPI Cards Compactas (34px de alto) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div
          onClick={() => setFiltroEstado("pendiente")}
          className={`cursor-pointer rounded border p-2 flex items-center justify-between transition-colors ${
            filtroEstado === "pendiente"
              ? "bg-amber-100 border-amber-300 ring-1 ring-amber-400"
              : "bg-amber-50/80 border-amber-200 hover:bg-amber-100/70"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Clock className={`w-3.5 h-3.5 ${kpis.pendientes > 0 ? "text-amber-600 animate-pulse" : "text-amber-500"}`} />
            <span className="text-3xs font-mono font-bold text-amber-900 uppercase">
              Pendientes de Aprobación
            </span>
          </div>
          <span className="text-xs font-mono font-black text-amber-800 bg-white/80 border border-amber-200 px-1.5 py-0.5 rounded">
            {kpis.pendientes}
          </span>
        </div>

        <div
          onClick={() => setFiltroEstado("aprobado")}
          className={`cursor-pointer rounded border p-2 flex items-center justify-between transition-colors ${
            filtroEstado === "aprobado"
              ? "bg-emerald-100 border-emerald-300 ring-1 ring-emerald-400"
              : "bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100/70"
          }`}
        >
          <div className="flex items-center space-x-2">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-3xs font-mono font-bold text-emerald-900 uppercase">
              Brokers Autorizados
            </span>
          </div>
          <span className="text-xs font-mono font-black text-emerald-800 bg-white/80 border border-emerald-200 px-1.5 py-0.5 rounded">
            {kpis.aprobados}
          </span>
        </div>

        <div
          onClick={() => setFiltroEstado("denegado")}
          className={`cursor-pointer rounded border p-2 flex items-center justify-between transition-colors ${
            filtroEstado === "denegado"
              ? "bg-rose-100 border-rose-300 ring-1 ring-rose-400"
              : "bg-rose-50/80 border-rose-200 hover:bg-rose-100/70"
          }`}
        >
          <div className="flex items-center space-x-2">
            <UserX className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-3xs font-mono font-bold text-rose-900 uppercase">
              Denegados / Inactivos
            </span>
          </div>
          <span className="text-xs font-mono font-black text-rose-800 bg-white/80 border border-rose-200 px-1.5 py-0.5 rounded">
            {kpis.denegados}
          </span>
        </div>

        <div
          onClick={() => setFiltroEstado("todos")}
          className={`cursor-pointer rounded border p-2 flex items-center justify-between transition-colors ${
            filtroEstado === "todos"
              ? "bg-slate-200 border-slate-300 ring-1 ring-slate-400"
              : "bg-slate-100 border-slate-200 hover:bg-slate-200/70"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-3xs font-mono font-bold text-slate-800 uppercase">
              Total Registros
            </span>
          </div>
          <span className="text-xs font-mono font-black text-slate-900 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
            {kpis.total}
          </span>
        </div>
      </div>

      {/* Toolbar: Pestañas + Buscador */}
      <div className="bg-white border border-slate-200 rounded-t p-2 flex flex-col sm:flex-row items-center justify-between gap-2 select-none">
        {/* Pestañas de Estado */}
        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFiltroEstado("todos")}
            className={`h-7 px-2.5 text-2xs font-semibold rounded transition-colors ${
              filtroEstado === "todos"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Todos ({kpis.total})
          </button>
          <button
            onClick={() => setFiltroEstado("pendiente")}
            className={`h-7 px-2.5 text-2xs font-semibold rounded flex items-center gap-1.5 transition-colors ${
              filtroEstado === "pendiente"
                ? "bg-amber-600 text-white"
                : "text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            Pendientes ({kpis.pendientes})
          </button>
          <button
            onClick={() => setFiltroEstado("aprobado")}
            className={`h-7 px-2.5 text-2xs font-semibold rounded transition-colors ${
              filtroEstado === "aprobado"
                ? "bg-emerald-700 text-white"
                : "text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            Autorizados ({kpis.aprobados})
          </button>
          <button
            onClick={() => setFiltroEstado("denegado")}
            className={`h-7 px-2.5 text-2xs font-semibold rounded transition-colors ${
              filtroEstado === "denegado"
                ? "bg-rose-700 text-white"
                : "text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            Denegados ({kpis.denegados})
          </button>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, correo o rol..."
            className="w-full h-7 pl-7 pr-2 text-2xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>
      </div>

      {/* Data Grid de Alta Densidad Bloomberg Light Theme */}
      <div className="bg-white border border-t-0 border-slate-200 rounded-b overflow-x-auto shadow-2xs">
        <table className="w-full text-left border-collapse text-2xs">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-3xs font-mono font-semibold text-slate-600 uppercase tracking-wider">
              <th className="px-3 py-2">Usuario / Cuenta Google</th>
              <th className="px-3 py-2">Estado de Acceso</th>
              <th className="px-3 py-2">Rol Asignado</th>
              <th className="px-3 py-2">Fecha Solicitud</th>
              <th className="px-3 py-2">Resolución / Notas</th>
              <th className="px-3 py-2 text-right">Acciones Directas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                  No se encontraron usuarios ni solicitudes en este criterio.
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((item) => {
                const isSuper = item.email === SUPER_ADMIN_EMAIL;
                const formattedDate = item.fechaSolicitud
                  ? new Date(item.fechaSolicitud).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors h-9 ${
                      item.estadoAcceso === "pendiente" ? "bg-amber-50/30" : ""
                    }`}
                  >
                    {/* Usuario */}
                    <td className="px-3 py-1.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-3xs shrink-0">
                          {item.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate flex items-center gap-1">
                            <span>{item.nombre}</span>
                            {isSuper && (
                              <span className="text-3xs font-mono bg-blue-100 text-blue-800 border border-blue-200 px-1 rounded font-bold">
                                PRINCIPAL
                              </span>
                            )}
                          </div>
                          <div className="text-3xs font-mono text-slate-500 truncate">
                            {item.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      {item.estadoAcceso === "pendiente" && (
                        <span className="inline-flex items-center gap-1 font-mono text-3xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-2.5 h-2.5 text-amber-600 animate-pulse" />
                          PENDIENTE
                        </span>
                      )}
                      {item.estadoAcceso === "aprobado" && (
                        <span className="inline-flex items-center gap-1 font-mono text-3xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          APROBADO
                        </span>
                      )}
                      {item.estadoAcceso === "denegado" && (
                        <span className="inline-flex items-center gap-1 font-mono text-3xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                          <XCircle className="w-2.5 h-2.5 text-rose-600" />
                          DENEGADO
                        </span>
                      )}
                    </td>

                    {/* Rol */}
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1 text-3xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                          <Lock className="w-2.5 h-2.5" />
                          admin (Inmutable)
                        </span>
                      ) : (
                        <select
                          value={item.rol}
                          onChange={(e) => handleCambiarRol(item, e.target.value as RolUsuario)}
                          disabled={isProcessing}
                          className="h-6 text-2xs font-mono bg-white border border-slate-200 rounded px-1.5 text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="broker_junior">broker_junior</option>
                          <option value="broker_senior">broker_senior</option>
                          <option value="admin">admin</option>
                        </select>
                      )}
                    </td>

                    {/* Fecha Solicitud */}
                    <td className="px-3 py-1.5 whitespace-nowrap font-mono text-3xs text-slate-500">
                      {formattedDate}
                    </td>

                    {/* Resolución / Notas */}
                    <td className="px-3 py-1.5 text-3xs text-slate-600 max-w-xs truncate">
                      {item.resueltoPor && (
                        <span className="font-mono text-slate-400 mr-1">
                          [{item.resueltoPor}]:
                        </span>
                      )}
                      <span>{item.notas || "Sin notas registradas"}</span>
                    </td>

                    {/* Acciones */}
                    <td className="px-3 py-1.5 text-right whitespace-nowrap">
                      {isSuper ? (
                        <span className="text-3xs font-mono text-slate-400 italic">
                          Cuenta Protegida
                        </span>
                      ) : item.estadoAcceso === "pendiente" ? (
                        <div className="inline-flex items-center space-x-1.5">
                          <Button
                            size="sm"
                            onClick={() => {
                              setModalAprobar({ open: true, usuario: item });
                              setRolSeleccionado(item.rol || "broker_junior");
                            }}
                            className="h-6 px-2 text-2xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 shadow-2xs"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Aprobar</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setModalDenegar({ open: true, usuario: item })}
                            className="h-6 px-2 text-2xs border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold flex items-center gap-1"
                          >
                            <UserX className="w-3 h-3" />
                            <span>Denegar</span>
                          </Button>
                        </div>
                      ) : item.estadoAcceso === "aprobado" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setModalDenegar({ open: true, usuario: item })}
                          className="h-6 px-2 text-3xs border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                        >
                          Revocar Acceso
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setModalAprobar({ open: true, usuario: item });
                            setRolSeleccionado("broker_junior");
                          }}
                          className="h-6 px-2 text-3xs border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200"
                        >
                          Reconsiderar / Aprobar
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* DIÁLOGO: APROBAR ACCESO */}
      <Dialog
        open={modalAprobar.open}
        onOpenChange={(open) => setModalAprobar({ open, usuario: open ? modalAprobar.usuario : null })}
      >
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md p-5">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Aprobar Solicitud de Acceso
            </DialogTitle>
            <DialogDescription className="text-2xs text-slate-500">
              Concederás acceso operativo a la plataforma y catálogo confidencial de suelo.
            </DialogDescription>
          </DialogHeader>

          {modalAprobar.usuario && (
            <div className="space-y-3 my-2 text-2xs">
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 font-mono space-y-1">
                <div>
                  <span className="text-slate-400">Usuario:</span>{" "}
                  <strong className="text-slate-800">{modalAprobar.usuario.nombre}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>{" "}
                  <strong className="text-slate-800">{modalAprobar.usuario.email}</strong>
                </div>
              </div>

              <div>
                <label className="block text-3xs font-mono font-bold text-slate-600 uppercase mb-1">
                  Rol Institucional a Asignar:
                </label>
                <select
                  value={rolSeleccionado}
                  onChange={(e) => setRolSeleccionado(e.target.value as RolUsuario)}
                  className="w-full h-8 px-2 text-2xs bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="broker_junior">broker_junior (Prospección y visualización)</option>
                  <option value="broker_senior">broker_senior (Gestión de cartera, pipeline y matching)</option>
                  <option value="admin">admin (Control total y módulo de accesos)</option>
                </select>
              </div>

              <div>
                <label className="block text-3xs font-mono font-bold text-slate-600 uppercase mb-1">
                  Notas de Aprobación (Opcional):
                </label>
                <input
                  type="text"
                  value={notasAprobacion}
                  onChange={(e) => setNotasAprobacion(e.target.value)}
                  placeholder="Ej. Broker asignado a zona Lima Top (Miraflores/San Isidro)"
                  className="w-full h-8 px-2 text-2xs bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalAprobar({ open: false, usuario: null })}
              className="h-8 text-2xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmarAprobacion}
              disabled={isProcessing}
              className="h-8 text-2xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {isProcessing ? "Aprobando..." : "Confirmar y Dar Acceso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: DENEGAR ACCESO */}
      <Dialog
        open={modalDenegar.open}
        onOpenChange={(open) => setModalDenegar({ open, usuario: open ? modalDenegar.usuario : null })}
      >
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md p-5">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-rose-700 flex items-center gap-2">
              <UserX className="w-4 h-4 text-rose-600" />
              Denegar o Revocar Acceso
            </DialogTitle>
            <DialogDescription className="text-2xs text-slate-500">
              El usuario será restringido y no podrá ver ningún dato de la plataforma.
            </DialogDescription>
          </DialogHeader>

          {modalDenegar.usuario && (
            <div className="space-y-3 my-2 text-2xs">
              <div className="bg-rose-50/60 border border-rose-200 rounded p-2.5 font-mono space-y-1">
                <div>
                  <span className="text-rose-600">Usuario:</span>{" "}
                  <strong className="text-rose-900">{modalDenegar.usuario.nombre}</strong>
                </div>
                <div>
                  <span className="text-rose-600">Email:</span>{" "}
                  <strong className="text-rose-900">{modalDenegar.usuario.email}</strong>
                </div>
              </div>

              <div>
                <label className="block text-3xs font-mono font-bold text-slate-600 uppercase mb-1">
                  Motivo de Denegación (Opcional):
                </label>
                <input
                  type="text"
                  value={motivoDenegacion}
                  onChange={(e) => setMotivoDenegacion(e.target.value)}
                  placeholder="Ej. Cuenta externa no reconocida por el comité de inversión"
                  className="w-full h-8 px-2 text-2xs bg-white border border-slate-300 rounded focus:outline-none focus:border-rose-500 font-sans"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalDenegar({ open: false, usuario: null })}
              className="h-8 text-2xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmarDenegacion}
              disabled={isProcessing}
              className="h-8 text-2xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {isProcessing ? "Denegando..." : "Confirmar Denegación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
