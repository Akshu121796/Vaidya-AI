import { supabaseAdmin } from '../config/supabase';

export class VillageRepository {
  // Core outbreak detection query
  // Finds villages where the same symptom appears 10+ times in 48 hours
  async getSymptomClusters(
    thresholdCount: number,
    windowHours: number
  ) {
    const windowStart = new Date(
      Date.now() - windowHours * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await (supabaseAdmin
      .from('symptom_reports') as any)
      .select(`
        village_id,
        symptoms_structured,
        created_at
      `)
      .gte('created_at', windowStart)
      .not('village_id', 'is', null);

    if (error || !data) return [];

    // Group by village and symptom in JavaScript
    // Supabase free tier doesn't support GROUP BY via the client
    const clusters: Record<string, Record<string, number>> = {};

    for (const report of data) {
      const villageId = report.village_id;
      if (!villageId) continue;

      const symptoms: Array<{ symptom: string }> =
        report.symptoms_structured ?? [];

      for (const s of symptoms) {
        const symptom = s.symptom?.toLowerCase().trim();
        if (!symptom) continue;

        if (!clusters[villageId]) clusters[villageId] = {};
        clusters[villageId][symptom] =
          (clusters[villageId][symptom] ?? 0) + 1;
      }
    }

    // Filter to only clusters that exceed the threshold
    const results: Array<{
      village_id: string;
      symptom: string;
      case_count: number;
    }> = [];

    for (const [villageId, symptoms] of Object.entries(clusters)) {
      for (const [symptom, count] of Object.entries(symptoms)) {
        if (count >= thresholdCount) {
          results.push({
            village_id: villageId,
            symptom,
            case_count: count,
          });
        }
      }
    }

    return results;
  }

  async getHeatmapData() {
    const windowStart = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000 // last 7 days
    ).toISOString();

    const { data, error } = await (supabaseAdmin
      .from('symptom_reports') as any)
      .select(`
        village_id,
        urgency_level,
        villages (
          name,
          district,
          latitude,
          longitude
        )
      `)
      .gte('created_at', windowStart)
      .not('village_id', 'is', null);

    if (error || !data) return [];

    // Group by village
    const heatmap: Record<string, any> = {};

    for (const report of data) {
      const vid = report.village_id;
      if (!vid) continue;

      if (!heatmap[vid]) {
        heatmap[vid] = {
          village_id: vid,
          village: report.villages,
          total_cases: 0,
          emergency_cases: 0,
        };
      }

      heatmap[vid].total_cases += 1;
      if (report.urgency_level === 'emergency') {
        heatmap[vid].emergency_cases += 1;
      }
    }

    return Object.values(heatmap);
  }

  async findById(villageId: string) {
    const { data, error } = await (supabaseAdmin
      .from('villages') as any)
      .select('*')
      .eq('village_id', villageId)
      .single();

    if (error || !data) return null;
    return data;
  }
}

export const villageRepository = new VillageRepository();