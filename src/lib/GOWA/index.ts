
import { z } from 'zod';

const SendMessageSchema = z.object({
  phone: z.string(),
  message: z.string(),
  reply_message_id: z.string().optional(),
  is_forwarded: z.boolean().optional(),
  duration: z.number().optional(),
});

type SendMessagePayload = z.infer<typeof SendMessageSchema>;

export class GowaClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(
    baseUrl: string = 'https://khalid.whatsapp.swalha.com',
    apiKey: string,
  ) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async sendMessage(payload: SendMessagePayload) {
    const validationResult = SendMessageSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Invalid payload: ${validationResult.error.message}`);
    }

    const response = await fetch(`${this.baseUrl}/send/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(this.apiKey).toString('base64')}`,
      },
      body: JSON.stringify(validationResult.data),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    return await response.json();
  }
} 