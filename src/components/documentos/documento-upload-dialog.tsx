"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { TipoDocumento, UploadDocumentoInput } from "@/types/documentos";
import { mockTerrenosCompletos } from "@/lib/mock/terrenos-seed";
import { createDocumento } from "@/lib/services/documentos";
import {
  UploadCloud,
  FileText,
  Calendar,
  Lock,
  Building,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface DocumentoUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultTerrenoId?: string;
}

export function DocumentoUploadDialog({
  isOpen,
  onClose,
  onSuccess,
  defaultTerrenoId,
}: DocumentoUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [terrenoId, setTerrenoId] = useState<string>(defaultTerrenoId || mockTerrenosCompletos[0]?.id || "");
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>("Certificado_Parametros");
  const [fechaEmision, setFechaEmision] = useState<string>(new Date().toISOString().split("T")[0]);
  const [fechaVencimiento, setFechaVencimiento] = useState<string>("");
  const [esConfidencial, setEsConfidencial] = useState<boolean>(false);
  const [numeroDocumento, setNumeroDocumento] = useState<string>("");
  const [entidadEmisora, setEntidadEmisora] = useState<string>("");
  const [notas, setNotas] = useState<string>("");

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Al abrir o cambiar defaultTerrenoId
  React.useEffect(() => {
    if (defaultTerrenoId) {
      setTerrenoId(defaultTerrenoId);
    }
  }, [defaultTerrenoId]);

  // Calculador rápido de vencimiento (+36 meses según Ley 29090)
  const handleApply36Meses = () => {
    const baseDate = fechaEmision ? new Date(fechaEmision) : new Date();
    baseDate.setFullYear(baseDate.getFullYear() + 3);
    setFechaVencimiento(baseDate.toISOString().split("T")[0]);
  };

  // Calculador rápido de vigencia para Due Diligence (+30 días)
  const handleApply30Dias = () => {
    const baseDate = fechaEmision ? new Date(fechaEmision) : new Date();
    baseDate.setDate(baseDate.getDate() + 30);
    setFechaVencimiento(baseDate.toISOString().split("T")[0]);
  };

  // Sin vencimiento
  const handleClearVencimiento = () => {
    setFechaVencimiento("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terrenoId) {
      setErrorMsg("Debes seleccionar un terreno asociado.");
      return;
    }

    const fileName = selectedFile
      ? selectedFile.name
      : `${tipoDocumento}_${new Date().toISOString().split("T")[0]}.pdf`;

    setIsUploading(true);
    setUploadProgress(20);

    try {
      // Simulación de carga en storage
      await new Promise((r) => setTimeout(r, 150));
      setUploadProgress(60);
      await new Promise((r) => setTimeout(r, 150));
      setUploadProgress(100);

      const input: UploadDocumentoInput = {
        terrenoId,
        tipoDocumento,
        nombreArchivo: fileName,
        fechaEmision: fechaEmision || null,
        fechaVencimiento: fechaVencimiento || null,
        esConfidencial,
        tamanoBytes: selectedFile ? selectedFile.size : 2100000,
        mimeType: selectedFile ? selectedFile.type : "application/pdf",
        numeroDocumento: numeroDocumento || undefined,
        entidadEmisora: entidadEmisora || undefined,
        notas: notas || undefined,
      };

      await createDocumento(input);
      setIsUploading(false);
      onSuccess();
      onClose();

      // Reset
      setSelectedFile(null);
      setUploadProgress(0);
      setNumeroDocumento("");
      setEntidadEmisora("");
      setNotas("");
    } catch (err: any) {
      setIsUploading(false);
      setErrorMsg(err.message || "Error al registrar el documento.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && !isUploading && onClose()}>
      <DialogContent className="max-w-lg p-0 bg-white border-slate-200 text-slate-800 overflow-hidden shadow-2xl">
        <DialogHeader className="p-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <DialogTitle className="text-xs font-mono font-bold text-slate-900">
              Cargar Documento / Certificado de Parámetros
            </DialogTitle>
          </div>
          <DialogDescription className="text-3xs text-slate-500 font-mono">
            Custodia técnica, legal y cálculo de vigencia para el lote
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xs text-3xs font-mono">
              {errorMsg}
            </div>
          )}

          {/* Zona Drag & Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xs p-4 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50/50"
                : selectedFile
                ? "border-emerald-500/50 bg-emerald-50/50"
                : "border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-mono text-2xs">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold truncate max-w-[280px]">
                  {selectedFile.name}
                </span>
                <span className="text-slate-500">({formatBytes(selectedFile.size)})</span>
              </div>
            ) : (
              <div className="space-y-1">
                <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                <div className="text-2xs font-mono text-slate-700">
                  Arrastra un PDF o plano aquí, o haz <span className="text-blue-600 underline">clic para examinar</span>
                </div>
                <div className="text-3xs text-slate-500 font-mono">
                  Soporta PDF, DWG, PNG, JPG (Máx. 25 MB)
                </div>
              </div>
            )}
          </div>

          {/* Terreno Asociado */}
          <div>
            <label className="text-3xs font-mono text-slate-600 uppercase tracking-wider block mb-1">
              Terreno Asociado *
            </label>
            <select
              value={terrenoId}
              onChange={(e) => setTerrenoId(e.target.value)}
              disabled={Boolean(defaultTerrenoId)}
              className="w-full h-7 bg-white border border-slate-300 rounded-xs px-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 disabled:opacity-60"
            >
              {mockTerrenosCompletos.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.codigoInterno}] {t.distrito} - {t.direccion.slice(0, 35)}...
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Documento */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-3xs font-mono text-slate-600 uppercase tracking-wider block mb-1">
                Tipo de Documento *
              </label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value as TipoDocumento)}
                className="w-full h-7 bg-white border border-slate-300 rounded-xs px-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Certificado_Parametros">Certificado de Parámetros (CPU)</option>
                <option value="Partida_Registral">Partida Registral / CRI</option>
                <option value="Plano_Catastral">Plano Catastral / Topográfico</option>
                <option value="Otros">Otros (Tasación, Memoria, HR-PU)</option>
              </select>
            </div>

            <div>
              <label className="text-3xs font-mono text-slate-600 uppercase tracking-wider block mb-1">
                N° Documento / Expediente
              </label>
              <Input
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                placeholder="Ej. CPU-2025-0812"
                className="h-7 text-xs font-mono bg-white border-slate-300 text-slate-800"
              />
            </div>
          </div>

          {/* Fechas de Emisión y Caducidad con Calculadores Rápidos */}
          <div className="p-2.5 bg-slate-50 rounded-xs border border-slate-200 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-3xs font-mono text-slate-600 uppercase tracking-wider block mb-1">
                  Fecha de Emisión
                </label>
                <Input
                  type="date"
                  value={fechaEmision}
                  onChange={(e) => setFechaEmision(e.target.value)}
                  className="h-7 text-xs font-mono bg-white border-slate-300 text-slate-800"
                />
              </div>

              <div>
                <label className="text-3xs font-mono text-slate-600 uppercase tracking-wider block mb-1">
                  Fecha de Vencimiento
                </label>
                <Input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  className="h-7 text-xs font-mono bg-white border-slate-300 text-slate-800"
                />
              </div>
            </div>

            {/* Accesos rápidos de cálculo normativo */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-3xs font-mono text-slate-500 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-blue-600" /> Auto-calcular:
              </span>
              <button
                type="button"
                onClick={handleApply36Meses}
                className="text-3xs font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
              >
                +36 meses (Ley 29090)
              </button>
              <button
                type="button"
                onClick={handleApply30Dias}
                className="text-3xs font-mono px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
              >
                +30 días (Due Diligence)
              </button>
              <button
                type="button"
                onClick={handleClearVencimiento}
                className="text-3xs font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
              >
                Sin vencimiento
              </button>
            </div>
          </div>

          {/* Entidad Emisora y Confidencialidad */}
          <div className="grid grid-cols-2 gap-2 items-center">
            <div>
              <label className="text-3xs font-mono text-slate-600 uppercase tracking-wider block mb-1">
                Entidad Emisora
              </label>
              <Input
                value={entidadEmisora}
                onChange={(e) => setEntidadEmisora(e.target.value)}
                placeholder="Ej. Municipalidad de Miraflores"
                className="h-7 text-xs font-mono bg-white border-slate-300 text-slate-800"
              />
            </div>

            <div className="pt-4 flex items-center gap-2">
              <Checkbox
                id="confidencial-check"
                checked={esConfidencial}
                onCheckedChange={(c) => setEsConfidencial(Boolean(c))}
              />
              <label
                htmlFor="confidencial-check"
                className="text-2xs font-mono text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Documento Confidencial</span>
              </label>
            </div>
          </div>

          {/* Barra de progreso si está subiendo */}
          {isUploading && (
            <div className="space-y-1 pt-1 font-mono text-3xs text-slate-500">
              <div className="flex justify-between">
                <span>Subiendo a Supabase Storage...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={onClose}
              className="h-7 text-xs font-mono border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isUploading}
              className="h-7 text-xs font-mono bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Registrar Documento</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
