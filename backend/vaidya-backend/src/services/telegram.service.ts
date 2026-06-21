import { env } from '../config/env';
import { logger } from '../utils/logger';

export class TelegramService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;
  }

  async sendMessage(chatId: string, message: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const result = await response.json() as { ok: boolean; description?: string };

      if (!result.ok) {
        logger.warn({ chatId, error: result.description }, 'Telegram message failed');
      } else {
        logger.info({ chatId }, 'Telegram message sent');
      }
    } catch (err) {
      // Never crash the worker over a Telegram failure
      logger.error({ err, chatId }, 'Telegram send error');
    }
  }

  async notifyDoctorNewAppointment(options: {
    doctorTelegramChatId: string | null;
    doctorName: string;
    patientName: string;
    scheduledAt: string;
    notes?: string;
  }): Promise<void> {
    // Graceful fallback — log and skip if no chat ID
    if (!options.doctorTelegramChatId) {
      logger.warn(
        { doctorName: options.doctorName },
        'Doctor has no telegram_chat_id — skipping notification'
      );
      return;
    }

    const date = new Date(options.scheduledAt).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    });

    const message = [
      `🏥 <b>New Appointment — VAIDYA.AI</b>`,
      ``,
      `👤 <b>Patient:</b> ${options.patientName}`,
      `📅 <b>Scheduled:</b> ${date}`,
      options.notes ? `📝 <b>Notes:</b> ${options.notes}` : null,
      ``,
      `Please confirm or reschedule via the app.`,
    ]
      .filter(Boolean)
      .join('\n');

    await this.sendMessage(options.doctorTelegramChatId, message);
  }
}

export const telegramService = new TelegramService();