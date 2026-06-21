import { supabaseAdmin } from '../config/supabase';

export interface CreateSymptomReportInput {
  patient_id?: string;
  village_id?: string;
  symptoms_raw: string;
  symptoms_structured: Array<{
    symptom: string;
    duration?: string;
    severity?: string;
  }>;
  urgency_level: 'low' | 'medium' | 'emergency';
  language: string;
}

export class SymptomRepository {
  async create(input: CreateSymptomReportInput) {
    const { data, error } = await (supabaseAdmin
      .from('symptom_reports') as any)
      .insert([{
        patient_id: input.patient_id ?? null,
        village_id: input.village_id ?? null,
        symptoms_raw: input.symptoms_raw,
        symptoms_structured: input.symptoms_structured,
        urgency_level: input.urgency_level,
        language: input.language,
      }])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to save symptom report');
    }
    return data;
  }

  async findById(reportId: string) {
    const { data, error } = await (supabaseAdmin
      .from('symptom_reports') as any)
      .select('*')
      .eq('report_id', reportId)
      .single();

    if (error || !data) return null;
    return data;
  }
}

export const symptomRepository = new SymptomRepository();