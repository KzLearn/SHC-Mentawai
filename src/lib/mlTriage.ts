import type { TriageResult } from './types';

interface VitalsInput {
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  chiefComplaint: string;
}

const ICD10_DB: Record<string, { name: string; inaCbg: string }> = {
  'J06.9': { name: 'Acute upper respiratory infection, unspecified (ISPA)', inaCbg: 'B-4-13-I' },
  'A09': { name: 'Other and unspecified gastroenteritis and colitis of infectious origin (Diare)', inaCbg: 'B-4-12-I' },
  'R50.9': { name: 'Fever, unspecified (Demam)', inaCbg: 'B-4-10-I' },
  'I10': { name: 'Essential (primary) hypertension (Hipertensi)', inaCbg: 'B-4-15-I' },
  'K30': { name: 'Functional dyspepsia (Dispepsia)', inaCbg: 'B-4-14-I' },
  'B54': { name: 'Unspecified malaria (Malaria)', inaCbg: 'B-4-11-I' },
  'J18.9': { name: 'Pneumonia, unspecified organism (Pneumonia)', inaCbg: 'E-2-16-I' },
  'E11.9': { name: 'Type 2 diabetes mellitus without complications (DM Tipe 2)', inaCbg: 'B-4-17-I' },
  'M79.3': { name: 'Panniculitis (Mialgia/Nyeri Otot)', inaCbg: 'B-4-20-I' },
  'R51': { name: 'Headache (Nyeri Kepala)', inaCbg: 'B-4-10-I' },
};

function normalize(val: number, min: number, max: number): number {
  return Math.min(1, Math.max(0, (val - min) / (max - min)));
}

export function runMlTriage(vitals: VitalsInput): TriageResult {
  const complaint = vitals.chiefComplaint.toLowerCase();
  const scores: Array<{ code: string; score: number; prob: number }> = [];

  // ISPA rule
  let ispaScore = 0;
  if (complaint.includes('batuk') || complaint.includes('pilek') || complaint.includes('hidung') || complaint.includes('tenggorokan') || complaint.includes('sakit tenggorok')) ispaScore += 30;
  if (vitals.temperature >= 37.5 && vitals.temperature <= 39.5) ispaScore += 25;
  if (vitals.respiratoryRate >= 18 && vitals.respiratoryRate <= 28) ispaScore += 15;
  if (vitals.oxygenSaturation >= 94) ispaScore += 20;
  scores.push({ code: 'J06.9', score: ispaScore, prob: 0 });

  // Diare rule
  let diareScore = 0;
  if (complaint.includes('diare') || complaint.includes('mencret') || complaint.includes('buang air') || complaint.includes('mual') || complaint.includes('muntah')) diareScore += 40;
  if (vitals.temperature >= 37.0) diareScore += 10;
  if (vitals.heartRate > 90) diareScore += 15;
  scores.push({ code: 'A09', score: diareScore, prob: 0 });

  // Hipertensi rule
  let htnScore = 0;
  if (complaint.includes('pusing') || complaint.includes('kepala') || complaint.includes('tengkuk')) htnScore += 15;
  if (vitals.systolic >= 140) htnScore += 40;
  if (vitals.diastolic >= 90) htnScore += 30;
  scores.push({ code: 'I10', score: htnScore, prob: 0 });

  // Malaria rule
  let malariaScore = 0;
  if (complaint.includes('menggigil') || complaint.includes('malaria') || complaint.includes('demam berulang')) malariaScore += 40;
  if (vitals.temperature >= 38.5) malariaScore += 30;
  if (vitals.heartRate > 100) malariaScore += 15;
  scores.push({ code: 'B54', score: malariaScore, prob: 0 });

  // Pneumonia rule
  let pneumoniaScore = 0;
  if (complaint.includes('sesak') || complaint.includes('napas') || complaint.includes('dada')) pneumoniaScore += 30;
  if (vitals.oxygenSaturation < 94) pneumoniaScore += 40;
  if (vitals.respiratoryRate > 24) pneumoniaScore += 20;
  if (vitals.temperature > 38.5) pneumoniaScore += 15;
  scores.push({ code: 'J18.9', score: pneumoniaScore, prob: 0 });

  // Dispepsia rule
  let dispepsiaScore = 0;
  if (complaint.includes('maag') || complaint.includes('ulu hati') || complaint.includes('perut') || complaint.includes('nyeri perut')) dispepsiaScore += 40;
  scores.push({ code: 'K30', score: dispepsiaScore, prob: 0 });

  // Demam rule
  let demamScore = 0;
  if (complaint.includes('demam') || complaint.includes('panas badan')) demamScore += 30;
  if (vitals.temperature >= 37.5) demamScore += 30;
  scores.push({ code: 'R50.9', score: demamScore, prob: 0 });

  // Normalize to probabilities via softmax-like
  const totalScore = scores.reduce((s, x) => s + Math.max(0, x.score), 0) || 1;
  scores.forEach(s => { s.prob = Math.max(0, s.score) / totalScore; });
  scores.sort((a, b) => b.prob - a.prob);

  const top = scores[0];
  const baseProbability = Math.round(65 + top.prob * 30);
  const clampedProb = Math.min(98, Math.max(60, baseProbability));

  const icd = ICD10_DB[top.code] || { name: 'Kondisi tidak spesifik', inaCbg: 'B-4-10-I' };

  // Determine recommendation based on severity
  let recommendation: 'Tuntas di Faskes' | 'Pertimbangkan Rujukan' | 'Rujuk Segera' = 'Tuntas di Faskes';
  if (vitals.oxygenSaturation < 90 || vitals.systolic > 180 || vitals.temperature > 40) {
    recommendation = 'Rujuk Segera';
  } else if (vitals.oxygenSaturation < 94 || top.code === 'J18.9' || top.code === 'B54') {
    recommendation = 'Pertimbangkan Rujukan';
  }

  return {
    diagnosisCode: top.code,
    diagnosisName: icd.name,
    probability: clampedProb,
    recommendation,
    basis: 'PPK Kemenkes No. HK.01.07/MENKES/1186/2022',
    inaCbgCode: icd.inaCbg,
  };
}
