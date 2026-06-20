import type { FastifyRequest, FastifyReply } from 'fastify';
import { telegramService } from '../services/telegram.service';
import { userRepository } from '../repositories/user.repository';
import { doctorRepository } from '../repositories/doctor.repository';
import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';

export class TelegramController {
  async handleWebhook(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;

    if (!body || !body.message) {
      return reply.status(200).send({ ok: true });
    }

    const { chat, text } = body.message;
    if (!chat || !chat.id || !text) {
      return reply.status(200).send({ ok: true });
    }

    const chatId = String(chat.id);
    const commandText = text.trim();

    logger.info({ chatId, text: commandText }, 'Received Telegram command');

    try {
      if (commandText === '/start') {
        const welcome = [
          `🏥 <b>Welcome to VAIDYA.AI Notification Hub</b>`,
          ``,
          `I can notify you instantly when patients book telehealth consultations.`,
          ``,
          `To pair this chat, please register using the phone number registered in the Vaidya.AI app:`,
          `➡️ <code>/register &lt;phone_number&gt;</code> (e.g. <code>/register 9876501234</code>)`,
        ].join('\n');

        await telegramService.sendMessage(chatId, welcome);
      } else if (commandText.startsWith('/register')) {
        const phone = commandText.replace('/register', '').trim().replace(/\D/g, '');

        if (phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
          await telegramService.sendMessage(
            chatId,
            `❌ Please enter a valid 10-digit Indian phone number starting with 6-9.\nExample: <code>/register 9876501234</code>`
          );
          return reply.status(200).send({ ok: true });
        }

        // Find user by phone
        const user = await userRepository.findByPhone(phone);
        if (!user) {
          await telegramService.sendMessage(
            chatId,
            `❌ User with phone number <b>${phone}</b> not found in our database.`
          );
          return reply.status(200).send({ ok: true });
        }

        if (user.role !== 'doctor') {
          await telegramService.sendMessage(
            chatId,
            `⚠️ Pair is only active for Doctors to receive appointment notifications at the moment.`
          );
          return reply.status(200).send({ ok: true });
        }

        // Find doctor profile
        const doctor = await doctorRepository.findByUserId(user.user_id);
        if (!doctor) {
          await telegramService.sendMessage(
            chatId,
            `❌ Clinician profile not found for user <b>${user.name}</b>.`
          );
          return reply.status(200).send({ ok: true });
        }

        // Update doctor record with telegram_chat_id
        const { error } = await (supabaseAdmin
          .from('doctors') as any)
          .update({ telegram_chat_id: chatId })
          .eq('doctor_id', doctor.doctor_id);

        if (error) {
          throw error;
        }

        await telegramService.sendMessage(
          chatId,
          `✅ <b>Registration Successful!</b>\n\nWelcome Dr. <b>${user.name}</b>. Your Telegram chat ID has been linked to your Vaidya.AI account. You will now receive instant telehealth appointment booking notifications.`
        );
      } else if (commandText === '/help') {
        const help = [
          `💡 <b>VAIDYA.AI Bot Commands:</b>`,
          ``,
          `• <code>/start</code> - Pair and configure notifications`,
          `• <code>/register &lt;phone&gt;</code> - Link your mobile number to this chat`,
          `• <code>/help</code> - Show commands`,
        ].join('\n');

        await telegramService.sendMessage(chatId, help);
      } else {
        await telegramService.sendMessage(
          chatId,
          `🤖 Command not recognized. Type <code>/help</code> for available directives.`
        );
      }
    } catch (err: any) {
      logger.error({ err, chatId }, 'Error handling Telegram webhook message');
      await telegramService.sendMessage(
        chatId,
        `❌ System error pairing your device: ${err.message ?? 'Unknown error'}`
      );
    }

    return reply.status(200).send({ ok: true });
  }
}

export const telegramController = new TelegramController();
