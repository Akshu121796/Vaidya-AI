import { villageRepository } from '../repositories/village.repository';
import { telegramService } from './telegram.service';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class OutbreakService {
  // ─── Run Detection Engine ──────────────────────────────────────
  async runDetection(): Promise<{
    alertsCreated: number;
    clusters: Array<{
      village_id: string;
      symptom: string;
      case_count: number;
      severity: string;
    }>;
  }> {
    const threshold = env.OUTBREAK_THRESHOLD;     // default 10
    const windowHours = env.OUTBREAK_WINDOW_HOURS; // default 48

    logger.info(
      { threshold, windowHours },
      'Running outbreak detection'
    );

    const clusters = await villageRepository.getSymptomClusters(
      threshold,
      windowHours
    );

    if (clusters.length === 0) {
      logger.info('No outbreak clusters detected');
      return { alertsCreated: 0, clusters: [] };
    }

    const results = [];

    for (const cluster of clusters) {
      const severity = this.calculateSeverity(cluster.case_count, threshold);
      const village = await villageRepository.findById(cluster.village_id);

      logger.warn(
        {
          village: village?.name,
          symptom: cluster.symptom,
          cases: cluster.case_count,
          severity,
        },
        'Outbreak cluster detected'
      );

      // Save alert to DB
      await this.saveAlert({
        villageId: cluster.village_id,
        symptom: cluster.symptom,
        caseCount: cluster.case_count,
        severity,
      });

      // Notify admin via Telegram if configured
      await this.notifyAdmin({
        villageName: village?.name ?? 'Unknown Village',
        district: village?.district ?? '',
        symptom: cluster.symptom,
        caseCount: cluster.case_count,
        severity,
      });

      results.push({ ...cluster, severity });
    }

    return { alertsCreated: results.length, clusters: results };
  }

  // ─── Severity Calculation ──────────────────────────────────────
  private calculateSeverity(
    caseCount: number,
    threshold: number
  ): 'watch' | 'warning' | 'critical' {
    if (caseCount >= threshold * 3) return 'critical';
    if (caseCount >= threshold * 2) return 'warning';
    return 'watch';
  }

  // ─── Save Alert to DB ──────────────────────────────────────────
  private async saveAlert(input: {
    villageId: string;
    symptom: string;
    caseCount: number;
    severity: string;
  }) {
    // Import here to avoid circular deps
    const { supabaseAdmin } = await import('../config/supabase');

    const { error } = await (supabaseAdmin
      .from('outbreak_alerts') as any)
      .upsert([
        {
          village_id: input.villageId,
          symptom_type: input.symptom,
          case_count: input.caseCount,
          severity: input.severity,
          is_active: true,
          detected_at: new Date().toISOString(),
        },
      ], {
        onConflict: 'village_id,symptom_type',
        ignoreDuplicates: false,
      });

    if (error) {
      logger.error({ error }, 'Failed to save outbreak alert');
    }
  }

  // ─── Notify Admin ──────────────────────────────────────────────
  private async notifyAdmin(input: {
    villageName: string;
    district: string;
    symptom: string;
    caseCount: number;
    severity: string;
  }) {
    // Admin telegram chat ID from env — optional
    const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID ?? null;

    if (!adminChatId) {
      logger.warn('ADMIN_TELEGRAM_CHAT_ID not set — skipping outbreak alert');
      return;
    }

    const severityEmoji: Record<string, string> = {
      watch: '👀',
      warning: '⚠️',
      critical: '🚨',
    };

    const message = [
      `${severityEmoji[input.severity] ?? '⚠️'} <b>Outbreak Alert — VAIDYA.AI</b>`,
      ``,
      `📍 <b>Village:</b> ${input.villageName}, ${input.district}`,
      `🦠 <b>Symptom:</b> ${input.symptom}`,
      `👥 <b>Cases:</b> ${input.caseCount} in last 48 hours`,
      `🔴 <b>Severity:</b> ${input.severity.toUpperCase()}`,
      ``,
      `Immediate attention required. Check the admin dashboard.`,
    ].join('\n');

    await telegramService.sendMessage(adminChatId, message);
  }

  // ─── Get Active Alerts ─────────────────────────────────────────
  async getActiveAlerts() {
    const { supabaseAdmin } = await import('../config/supabase');

    const { data, error } = await (supabaseAdmin
      .from('outbreak_alerts') as any)
      .select(`
        *,
        villages (name, district, latitude, longitude)
      `)
      .eq('is_active', true)
      .order('detected_at', { ascending: false });

    if (error || !data) return [];
    return data;
  }

  // ─── Get Heatmap ──────────────────────────────────────────────
  async getHeatmap() {
    return await villageRepository.getHeatmapData();
  }
}

export const outbreakService = new OutbreakService();