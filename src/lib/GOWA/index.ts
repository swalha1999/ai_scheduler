
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

const SendMessageSchema = z.object({
  phone: z.string(),
  message: z.string(),
  reply_message_id: z.string().optional(),
  is_forwarded: z.boolean().optional(),
  duration: z.number().optional(),
});

const WHATSAPP_WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || 'secret';
const GOWA_API_KEY = process.env.GOWA_API_KEY || '';
const GOWA_BASE_URL = process.env.GOWA_BASE_URL || 'https://khalid.whatsapp.swalha.com';

type SendMessagePayload = z.infer<typeof SendMessageSchema>;

export class GowaClient {
  private baseUrl: string;
  private apiKey: string;
  private webhookSecret: string;

  constructor(
    baseUrl: string = GOWA_BASE_URL,
    apiKey: string = GOWA_API_KEY,
    webhookSecret: string = WHATSAPP_WEBHOOK_SECRET,
  ) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
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

  async parseMessage(request: NextRequest) {
    // Get the raw body as text for signature verification
		const body = await request.text();
		
		// Get the signature from headers
		const signature = request.headers.get('x-signature-256') || 
						 request.headers.get('x-hub-signature-256') || 
						 request.headers.get('signature');

		
		if (!signature) {
      console.log('Missing signature header');
      throw new Error('Missing signature header');
		}
		
		// Verify the signature
		if (!this.verifySignature(body, signature, this.webhookSecret)) {
      console.error('Whatsapp: Webhook signature verification failed');
      throw new Error('Whatsapp: Webhook signature verification failed');
		}
		
		// Parse the verified payload
		const payload = JSON.parse(body);
    
    // here we need to add checks and return a type safe message object
    // now lets keep it simple and return the payload as is
    
    return payload

  }

  async handleWebhookVerification(request: NextRequest): Promise<NextResponse> {
		const { searchParams } = new URL(request.url);
		const challenge = searchParams.get('hub.challenge');
		const verifyToken = searchParams.get('hub.verify_token');
		
		// Verify the token if provided
		if (verifyToken && verifyToken !== this.webhookSecret) {
			console.log('Invalid verify token');
			return NextResponse.json(
				{ error: 'Invalid verify token' },
				{ status: 403 }
			);
		}
		
		// Return the challenge for webhook verification
		if (challenge) {
			console.log('Challenge:', challenge);
			return new NextResponse(challenge, {
				status: 200,
				headers: {
					'Content-Type': 'text/plain',
				},
			});
		}

		console.log('Webhook endpoint is active');
		
		return NextResponse.json(
			{ 
				message: 'Webhook endpoint is active',
				timestamp: new Date().toISOString()
			},
			{ status: 200 }
		);
	}

  async verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
    const hmac = createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    // Remove 'sha256=' prefix if present
    const cleanSignature = signature.replace(/^sha256=/, '');

    // Use timing-safe comparison to prevent timing attacks
    return timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(cleanSignature, 'hex')
    );
  }
} 