import { connectToDatabase } from '@/lib/mongodb/connection';
import {
  contactMessageInputSchema,
  validateAndSanitize,
} from '@/lib/validation/portfolio-schemas';
import { contactMessageRepository } from '@/repositories';
import type { ContactMessageDTO } from '@/types/portfolio';

export interface SubmitContactMessageResult {
  persisted: boolean;
  message: ContactMessageDTO;
}

export const contactService = {
  async submitContactMessage(
    rawInput: unknown,
    options?: { ipHash?: string }
  ): Promise<SubmitContactMessageResult> {
    const validated = validateAndSanitize(contactMessageInputSchema, rawInput);

    const conn = await connectToDatabase({ strict: false });
    if (conn) {
      try {
        const saved = await contactMessageRepository.create({
          ...validated,
          ipHash: options?.ipHash,
        });
        return {
          persisted: true,
          message: saved,
        };
      } catch {
        // Fall through to resilient synthetic confirmation if DB write fails transiently
      }
    }

    return {
      persisted: false,
      message: {
        id: `local-${Date.now()}`,
        fullname: validated.fullname,
        email: validated.email,
        message: validated.message,
        isRead: false,
        ipHash: options?.ipHash,
        createdAt: new Date().toISOString(),
      },
    };
  },

  async listMessages(): Promise<ContactMessageDTO[]> {
    const conn = await connectToDatabase({ strict: false });
    if (!conn) {
      return [];
    }
    return contactMessageRepository.findAll();
  },

  async markMessageReadState(
    id: string,
    isRead: boolean
  ): Promise<ContactMessageDTO | null> {
    await connectToDatabase({ strict: false });
    return contactMessageRepository.markReadState(id, Boolean(isRead));
  },

  async deleteMessage(id: string): Promise<boolean> {
    await connectToDatabase({ strict: false });
    return contactMessageRepository.deleteById(id);
  },
};
