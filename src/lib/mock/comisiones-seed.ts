import { ComisionLiquidacion } from "@/types/comisiones";
import {
  mockNegociacionesCompletas,
  mockUsuarios,
} from "./negociaciones-seed";
import {
  mockTerrenosCompletos,
  mockClientesCompradores,
} from "./terrenos-seed";

export const mockComisionesLiquidaciones: ComisionLiquidacion[] = [
  // 1. LIQUIDADO (Sincronizado con neg-011 - Callao Faucett)
  {
    id: "com-001",
    codigoLiquidacion: "LIQ-001",
    negociacionId: "neg-011",
    montoVentaFinal: "4225000.00",
    pctComision: "3.00",
    montoComisionTotal: "126750.00",
    comisionBroker: "63375.00",
    comisionEmpresa: "63375.00",
    estadoLiquidacion: "Liquidado",
    estadoPago: "Cobrado",
    createdAt: "2026-08-10T18:00:00Z",
    updatedAt: "2026-08-25T16:00:00Z",

    // Facturación Promundo -> Besco
    tipoComprobante: "Factura",
    numeroFactura: "F001-0003890",
    fechaFactura: "2026-08-12T10:30:00Z",
    fechaVencimientoFactura: "2026-08-27T18:00:00Z",
    rucEmisor: "20608941258", // Promundo S.A.C.
    rucReceptor: "20509823411", // Besco S.A.
    razonSocialReceptor: "Besco S.A. Inmobiliaria",
    montoFacturadoIGV: 149565.0, // 126,750 + 18% IGV (22,815)

    // SPOT Detracción SUNAT (12%)
    pctDetraccion: 12.0,
    numeroConstanciaDetraccion: "BN-2026-9812401",
    fechaDetraccion: "2026-08-15T11:00:00Z",
    montoDetraccionUSD: 17947.8, // 12% de 149,565
    montoDetraccionPEN: 67304.25, // TC 3.75

    // Cobranza Promundo
    fechaCobro: "2026-08-18T15:20:00Z",
    bancoEmpresa: "BCP USD Cta Cte 193-9821034-1-45",
    nroOperacionCobro: "OP-BCP-8839210",
    montoCobradoNetoUSD: 131617.2, // 88% depositado en Cta Cte

    // Split y Liquidación Broker (Alvaro Barrenechea)
    pctSplitBroker: 50.0,
    pctSplitEmpresa: 50.0,
    tipoComprobanteBroker: "Recibo_Honorarios",
    numeroComprobanteBroker: "E001-218",
    cuentaConSuspension1609: false,
    retencionIRBrokerPct: 8.0,
    montoRetencionIRBrokerUSD: 5070.0, // 8% de 63,375
    montoNetoBrokerUSD: 58305.0, // Líquido pagado
    modalidadPagoBroker: "Transferencia_Bancaria",
    bancoBroker: "BCP Cta Ahorros USD 191-4458291-0-12",
    nroOperacionPagoBroker: "TRANS-BCP-992140",
    fechaPagoBroker: "2026-08-25T16:00:00Z",

    observaciones:
      "Operación cerrada y liquidada al 100%. Constancia de retención 4ta categoría emitida y enviada al broker.",

    negociacion: mockNegociacionesCompletas[10],
    terreno: mockTerrenosCompletos[17],
    cliente: mockClientesCompradores[1],
    broker: mockUsuarios[0],
  },

  // 2. FACTURADO (Sincronizado con neg-012 - Barranco Pedro de Osma)
  {
    id: "com-002",
    codigoLiquidacion: "LIQ-002",
    negociacionId: "neg-012",
    montoVentaFinal: "2047000.00",
    pctComision: "3.00",
    montoComisionTotal: "61410.00",
    comisionBroker: "30705.00",
    comisionEmpresa: "30705.00",
    estadoLiquidacion: "Facturado",
    estadoPago: "Facturado",
    createdAt: "2026-08-05T14:30:00Z",
    updatedAt: "2026-08-11T09:00:00Z",

    // Facturación Promundo -> Edifica
    tipoComprobante: "Factura",
    numeroFactura: "F001-0004112",
    fechaFactura: "2026-08-10T11:00:00Z",
    fechaVencimientoFactura: "2026-09-10T18:00:00Z",
    rucEmisor: "20608941258",
    rucReceptor: "20518739902", // Edifica
    razonSocialReceptor: "Inmobiliaria Edifica S.A.",
    montoFacturadoIGV: 72463.8, // 61,410 + 18% IGV (11,053.80)

    // SPOT Detracción SUNAT (12%)
    pctDetraccion: 12.0,
    numeroConstanciaDetraccion: null,
    fechaDetraccion: null,
    montoDetraccionUSD: 8695.66,
    montoDetraccionPEN: 32608.73,

    // Cobranza Promundo (Pendiente)
    fechaCobro: null,
    bancoEmpresa: null,
    nroOperacionCobro: null,
    montoCobradoNetoUSD: 63768.14,

    // Split y Liquidación Broker (Sofia Mendoza)
    pctSplitBroker: 50.0,
    pctSplitEmpresa: 50.0,
    tipoComprobanteBroker: "Recibo_Honorarios",
    numeroComprobanteBroker: null,
    cuentaConSuspension1609: true, // Con formulario 1609
    retencionIRBrokerPct: 0.0,
    montoRetencionIRBrokerUSD: 0.0,
    montoNetoBrokerUSD: 30705.0,
    modalidadPagoBroker: "Transferencia_Bancaria",
    bancoBroker: "BBVA Continental USD 0011-0284-0200847291",
    nroOperacionPagoBroker: null,
    fechaPagoBroker: null,

    observaciones:
      "Factura comercial remitida a tesorería de Edifica. Vencimiento a 30 días fijado para el 10 de Septiembre de 2026.",

    negociacion: mockNegociacionesCompletas[11],
    terreno: mockTerrenosCompletos[3],
    cliente: mockClientesCompradores[2],
    broker: mockUsuarios[1],
  },

  // 3. LIQUIDADO (Histórico San Isidro - Calle Las Palmeras)
  {
    id: "com-003",
    codigoLiquidacion: "LIQ-003",
    negociacionId: "neg-010",
    montoVentaFinal: "6650000.00",
    pctComision: "3.00",
    montoComisionTotal: "199500.00",
    comisionBroker: "99750.00",
    comisionEmpresa: "99750.00",
    estadoLiquidacion: "Liquidado",
    estadoPago: "Cobrado",
    createdAt: "2026-06-25T10:00:00Z",
    updatedAt: "2026-07-20T17:30:00Z",

    // Facturación Promundo -> Grupo Lar
    tipoComprobante: "Factura",
    numeroFactura: "F001-0003710",
    fechaFactura: "2026-06-28T09:15:00Z",
    fechaVencimientoFactura: "2026-07-15T18:00:00Z",
    rucEmisor: "20608941258",
    rucReceptor: "20504128931",
    razonSocialReceptor: "Grupo Lar Perú Inversiones S.A.C.",
    montoFacturadoIGV: 235410.0, // 199,500 + 18% IGV (35,910)

    // SPOT Detracción SUNAT (12%)
    pctDetraccion: 12.0,
    numeroConstanciaDetraccion: "BN-2026-7734190",
    fechaDetraccion: "2026-07-02T10:00:00Z",
    montoDetraccionUSD: 28249.2,
    montoDetraccionPEN: 105934.5,

    // Cobranza Promundo
    fechaCobro: "2026-07-08T14:45:00Z",
    bancoEmpresa: "BCP USD Cta Cte 193-9821034-1-45",
    nroOperacionCobro: "OP-BCP-7740215",
    montoCobradoNetoUSD: 207160.8,

    // Split y Liquidación Broker (Alvaro Barrenechea)
    pctSplitBroker: 50.0,
    pctSplitEmpresa: 50.0,
    tipoComprobanteBroker: "Factura", // Broker con RUC 20 / Empresa unipersonal
    numeroComprobanteBroker: "E001-042",
    cuentaConSuspension1609: false,
    retencionIRBrokerPct: 0.0,
    montoRetencionIRBrokerUSD: 0.0,
    montoNetoBrokerUSD: 99750.0,
    modalidadPagoBroker: "Transferencia_Bancaria",
    bancoBroker: "BCP Cta Corriente USD 193-8820491-1-08",
    nroOperacionPagoBroker: "TRANS-BCP-884012",
    fechaPagoBroker: "2026-07-20T17:30:00Z",

    observaciones:
      "Liquidación culminada exitosamente contra Factura de consultoría inmobiliaria del broker senior.",

    negociacion: mockNegociacionesCompletas[9],
    terreno: mockTerrenosCompletos[1],
    cliente: mockClientesCompradores[0],
    broker: mockUsuarios[0],
  },

  // 4. COBRADO (Histórico Lince - Av. Arequipa 2600)
  {
    id: "com-004",
    codigoLiquidacion: "LIQ-004",
    negociacionId: "neg-007",
    montoVentaFinal: "2600000.00",
    pctComision: "3.00",
    montoComisionTotal: "78000.00",
    comisionBroker: "39000.00",
    comisionEmpresa: "39000.00",
    estadoLiquidacion: "Cobrado",
    estadoPago: "Cobrado",
    createdAt: "2026-07-15T09:00:00Z",
    updatedAt: "2026-08-28T18:00:00Z",

    // Facturación Promundo -> Senda
    tipoComprobante: "Factura",
    numeroFactura: "F001-0004050",
    fechaFactura: "2026-07-20T11:30:00Z",
    fechaVencimientoFactura: "2026-08-20T18:00:00Z",
    rucEmisor: "20608941258",
    rucReceptor: "20549812409",
    razonSocialReceptor: "Senda Inmobiliaria S.A.C.",
    montoFacturadoIGV: 92040.0, // 78,000 + 18% IGV (14,040)

    // SPOT Detracción SUNAT (12%)
    pctDetraccion: 12.0,
    numeroConstanciaDetraccion: "BN-2026-9921440",
    fechaDetraccion: "2026-08-10T14:15:00Z",
    montoDetraccionUSD: 11044.8,
    montoDetraccionPEN: 41418.0,

    // Cobranza Promundo
    fechaCobro: "2026-08-25T16:20:00Z",
    bancoEmpresa: "BBVA USD Cta Cte 0011-0175-0100098231",
    nroOperacionCobro: "OP-BBVA-6639102",
    montoCobradoNetoUSD: 80995.2,

    // Split y Liquidación Broker (Sofia Mendoza - En espera de su RxH)
    pctSplitBroker: 50.0,
    pctSplitEmpresa: 50.0,
    tipoComprobanteBroker: "Recibo_Honorarios",
    numeroComprobanteBroker: null,
    cuentaConSuspension1609: false,
    retencionIRBrokerPct: 8.0,
    montoRetencionIRBrokerUSD: 3120.0, // 8% de 39,000
    montoNetoBrokerUSD: 35880.0,
    modalidadPagoBroker: "Transferencia_Bancaria",
    bancoBroker: "BBVA Continental USD 0011-0284-0200847291",
    nroOperacionPagoBroker: null,
    fechaPagoBroker: null,

    observaciones:
      "Abono neto y detracción SPOT confirmados en cuentas de Promundo. Notificado al broker para remitir su Recibo por Honorarios.",

    negociacion: mockNegociacionesCompletas[6],
    terreno: mockTerrenosCompletos[7],
    cliente: mockClientesCompradores[4],
    broker: mockUsuarios[1],
  },

  // 5. PENDIENTE (Histórico Surco - Av. Encalada 1120)
  {
    id: "com-005",
    codigoLiquidacion: "LIQ-005",
    negociacionId: "neg-009",
    montoVentaFinal: "5700000.00",
    pctComision: "3.00",
    montoComisionTotal: "171000.00",
    comisionBroker: "85500.00",
    comisionEmpresa: "85500.00",
    estadoLiquidacion: "Pendiente",
    estadoPago: "Pendiente",
    createdAt: "2026-08-26T11:00:00Z",
    updatedAt: "2026-08-26T11:00:00Z",

    // Facturación Promundo -> Viva Negocio Inmobiliario (En trámite)
    tipoComprobante: "Factura",
    numeroFactura: null,
    fechaFactura: null,
    fechaVencimientoFactura: null,
    rucEmisor: "20608941258",
    rucReceptor: "20521487901",
    razonSocialReceptor: "Viva Negocio Inmobiliario S.A.",
    montoFacturadoIGV: 201780.0, // 171,000 + 18% IGV (30,780)

    // SPOT Detracción SUNAT (12%)
    pctDetraccion: 12.0,
    numeroConstanciaDetraccion: null,
    fechaDetraccion: null,
    montoDetraccionUSD: 24213.6,
    montoDetraccionPEN: 90801.0,

    // Cobranza Promundo (Pendiente)
    fechaCobro: null,
    bancoEmpresa: null,
    nroOperacionCobro: null,
    montoCobradoNetoUSD: 177566.4,

    // Split y Liquidación Broker (Diego Palacios)
    pctSplitBroker: 50.0,
    pctSplitEmpresa: 50.0,
    tipoComprobanteBroker: "Recibo_Honorarios",
    numeroComprobanteBroker: null,
    cuentaConSuspension1609: false,
    retencionIRBrokerPct: 8.0,
    montoRetencionIRBrokerUSD: 6840.0,
    montoNetoBrokerUSD: 78660.0,
    modalidadPagoBroker: "Transferencia_Bancaria",
    bancoBroker: "BCP Cta Ahorros USD 194-9921840-0-55",
    nroOperacionPagoBroker: null,
    fechaPagoBroker: null,

    observaciones:
      "Minuta de compraventa suscrita en Notaría Fernandini. Expediente remitido a administración para emisión de factura comercial.",

    negociacion: mockNegociacionesCompletas[8],
    terreno: mockTerrenosCompletos[12],
    cliente: mockClientesCompradores[3],
    broker: mockUsuarios[2],
  },

  // 6. COBRADO (Histórico Miraflores - Calle 2 de Mayo 850)
  {
    id: "com-006",
    codigoLiquidacion: "LIQ-006",
    negociacionId: "neg-004",
    montoVentaFinal: "4700000.00",
    pctComision: "3.00",
    montoComisionTotal: "141000.00",
    comisionBroker: "70500.00",
    comisionEmpresa: "70500.00",
    estadoLiquidacion: "Cobrado",
    estadoPago: "Cobrado",
    createdAt: "2026-07-01T10:00:00Z",
    updatedAt: "2026-08-20T12:00:00Z",

    // Facturación Promundo -> Marcan
    tipoComprobante: "Factura",
    numeroFactura: "F001-0003980",
    fechaFactura: "2026-07-05T09:30:00Z",
    fechaVencimientoFactura: "2026-08-05T18:00:00Z",
    rucEmisor: "20608941258",
    rucReceptor: "20489912034",
    razonSocialReceptor: "Marcan S.A. Inmobiliaria y Constructora",
    montoFacturadoIGV: 166380.0, // 141,000 + 18% IGV (25,380)

    // SPOT Detracción SUNAT (12%)
    pctDetraccion: 12.0,
    numeroConstanciaDetraccion: "BN-2026-8819201",
    fechaDetraccion: "2026-07-28T11:00:00Z",
    montoDetraccionUSD: 19965.6,
    montoDetraccionPEN: 74871.0,

    // Cobranza Promundo
    fechaCobro: "2026-08-04T16:00:00Z",
    bancoEmpresa: "Interbank USD Cta Cte 200-3001849102",
    nroOperacionCobro: "OP-IBK-9912048",
    montoCobradoNetoUSD: 146414.4,

    // Split y Liquidación Broker (Alvaro Barrenechea - Programado pago fin de mes)
    pctSplitBroker: 50.0,
    pctSplitEmpresa: 50.0,
    tipoComprobanteBroker: "Factura",
    numeroComprobanteBroker: "E001-045",
    cuentaConSuspension1609: false,
    retencionIRBrokerPct: 0.0,
    montoRetencionIRBrokerUSD: 0.0,
    montoNetoBrokerUSD: 70500.0,
    modalidadPagoBroker: "Transferencia_Bancaria",
    bancoBroker: "BCP Cta Corriente USD 193-8820491-1-08",
    nroOperacionPagoBroker: null,
    fechaPagoBroker: null,

    observaciones:
      "Cobranza íntegra efectuada por Interbank. Factura del broker recibida y aprobada; transferencia programada en remesa bancaria.",

    negociacion: mockNegociacionesCompletas[3],
    terreno: mockTerrenosCompletos[11],
    cliente: mockClientesCompradores[5],
    broker: mockUsuarios[0],
  },

  // 7. FACTURADO (Histórico Jesús María - Av. San Felipe 740)
  {
    id: "com-007",
    codigoLiquidacion: "LIQ-007",
    negociacionId: "neg-003",
    montoVentaFinal: "3000000.00",
    pctComision: "3.00",
    montoComisionTotal: "90000.00",
    comisionBroker: "45000.00",
    comisionEmpresa: "45000.00",
    estadoLiquidacion: "Facturado",
    estadoPago: "Facturado",
    createdAt: "2026-08-18T14:00:00Z",
    updatedAt: "2026-08-25T17:00:00Z",

    // Facturación Promundo -> Marcan
    tipoComprobante: "Factura",
    numeroFactura: "F001-0004205",
    fechaFactura: "2026-08-25T11:00:00Z",
    fechaVencimientoFactura: "2026-09-25T18:00:00Z",
    rucEmisor: "20608941258",
    rucReceptor: "20489912034",
    razonSocialReceptor: "Marcan S.A. Inmobiliaria y Constructora",
    montoFacturadoIGV: 106200.0, // 90,000 + 18% IGV (16,200)

    // SPOT Detracción SUNAT (12%)
    pctDetraccion: 12.0,
    numeroConstanciaDetraccion: null,
    fechaDetraccion: null,
    montoDetraccionUSD: 12744.0,
    montoDetraccionPEN: 47790.0,

    // Cobranza Promundo (Pendiente)
    fechaCobro: null,
    bancoEmpresa: null,
    nroOperacionCobro: null,
    montoCobradoNetoUSD: 93456.0,

    // Split y Liquidación Broker (Sofia Mendoza)
    pctSplitBroker: 50.0,
    pctSplitEmpresa: 50.0,
    tipoComprobanteBroker: "Recibo_Honorarios",
    numeroComprobanteBroker: null,
    cuentaConSuspension1609: true,
    retencionIRBrokerPct: 0.0,
    montoRetencionIRBrokerUSD: 0.0,
    montoNetoBrokerUSD: 45000.0,
    modalidadPagoBroker: "Transferencia_Bancaria",
    bancoBroker: "BBVA Continental USD 0011-0284-0200847291",
    nroOperacionPagoBroker: null,
    fechaPagoBroker: null,

    observaciones:
      "Factura electrónica emitida y remitida con copia del testimonio de escritura pública.",

    negociacion: mockNegociacionesCompletas[2],
    terreno: mockTerrenosCompletos[5],
    cliente: mockClientesCompradores[5],
    broker: mockUsuarios[1],
  },
];
