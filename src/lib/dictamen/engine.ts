/**
 * Módulo F: Algoritmo de Dictamen Automático
 *
 * Evalúa los insumos documentales y de inspección para emitir un status de dictamen.
 */

export type DictamenStatus = 'OK_NO_ALERTS' | 'BUY_UNDER_CLIENT_RESPONSIBILITY' | 'REJECTED';

export interface DocumentVerification {
  docType: string;
  isVerified: boolean;
  isMandatory: boolean;
}

export interface InspectionData {
  obd2Codes: string[];
  checklist: {
    leaks: boolean;
    brakesWear: string;
    fluidsStatus: string;
  };
}

export interface DictamenResult {
  status: DictamenStatus;
  confidenceScore: number;
  flags: string[];
}

export function evaluateDictamen(
  documents: DocumentVerification[],
  inspectionData: InspectionData
): DictamenResult {
  let score = 100;
  const flags: string[] = [];

  // 1. Evaluar documentos
  const mandatoryDocs = documents.filter(d => d.isMandatory);
  const allMandatoryVerified = mandatoryDocs.every(d => d.isVerified);

  if (!allMandatoryVerified) {
    flags.push('Faltan documentos obligatorios verificados.');
    score -= 40;
  }

  // 2. Evaluar inspección
  // Fallas críticas
  if (inspectionData.obd2Codes.length > 0) {
    flags.push(`Códigos OBD-II detectados: ${inspectionData.obd2Codes.join(', ')}`);
    score -= (inspectionData.obd2Codes.length * 10);
  }

  if (inspectionData.checklist.leaks) {
    flags.push('Fugas visibles detectadas.');
    score -= 15;
  }

  if (inspectionData.checklist.brakesWear === 'Needs Replacement') {
    flags.push('Frenos requieren reemplazo.');
    score -= 10;
  }

  if (inspectionData.checklist.fluidsStatus === 'Needs Service') {
    flags.push('Fluidos requieren servicio.');
    score -= 5;
  }

  // Asegurar que el score se mantenga entre 0 y 100
  score = Math.max(0, Math.min(100, score));

  // 3. Determinar Status
  let status: DictamenStatus = 'OK_NO_ALERTS';

  if (score < 50 || !allMandatoryVerified) {
    status = 'REJECTED';
  } else if (score < 85) {
    status = 'BUY_UNDER_CLIENT_RESPONSIBILITY';
  }

  return {
    status,
    confidenceScore: parseFloat(score.toFixed(2)),
    flags
  };
}
