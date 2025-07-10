
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

// Utility function to clean phone numbers
function cleanPhoneNumber(phone: string): string {
	return phone.replace(/@s\.whatsapp\.net|@g\.us/g, '');
}

// Function to extract sender phone from "sender in destination" format
function extractSenderPhone(phoneString: string): string {
	const parts = phoneString.split(' in ');
	const senderPart = parts[0];
	return senderPart.replace(/@s\.whatsapp\.net|@g\.us/g, '');
}

// Function to extract destination from "sender in destination" format
function extractDestination(phoneString: string): string {
	const parts = phoneString.split(' in ');
	if (parts.length < 2) {
		return 'self';
	}
	const destinationPart = parts[1];
	return destinationPart.replace(/@s\.whatsapp\.net|@g\.us/g, '');
}

const SendMessageSchema = z.object({
	phone: z.string(),
	message: z.string(),
	reply_message_id: z.string().optional(),
	is_forwarded: z.boolean().optional(),
	duration: z.number().optional(),
});

// Base message schema
const BaseMessageSchema = z.object({
	id: z.string(),
	text: z.string().optional(),
	replied_id: z.string().optional(),
	quoted_message: z.string().optional(),
});

// Regular message payload schema
const RegularMessagePayloadSchema = z.preprocess((data: any) => {
	if (data && data.from) {
		return {
			...data,
			from: extractSenderPhone(data.from),
			destination: extractDestination(data.from)
		};
	}
	return data;
}, z.object({
	from: z.string(),
	destination: z.string(),
	from_lid: z.string().optional(),
	message: BaseMessageSchema,
	pushname: z.string(),
	timestamp: z.string(),
}));

// Message edited payload schema
const MessageEditedPayloadSchema = z.preprocess((data: any) => {
	if (data && data.from) {
		return {
			...data,
			from: extractSenderPhone(data.from),
			destination: extractDestination(data.from)
		};
	}
	return data;
}, z.object({
	action: z.literal('message_edited'),
	edited_text: z.string(),
	from: z.string(),
	destination: z.string(),
	from_lid: z.string().optional(),
	message: z.object({
		id: z.string(),
	}),
	pushname: z.string(),
	timestamp: z.string(),
}));

// Message revoked payload schema
const MessageRevokedPayloadSchema = z.preprocess((data: any) => {
	if (data && data.from) {
		return {
			...data,
			from: extractSenderPhone(data.from),
			destination: extractDestination(data.from),
			revoked_chat: cleanPhoneNumber(data.revoked_chat)
		};
	}
	return data;
}, z.object({
	action: z.literal('message_revoked'),
	from: z.string(),
	destination: z.string(),
	from_lid: z.string().optional(),
	message: z.object({
		id: z.string(),
	}),
	pushname: z.string(),
	revoked_chat: z.string(),
	revoked_from_me: z.boolean(),
	revoked_message_id: z.string(),
	timestamp: z.string(),
}));

// Union of all possible webhook payloads
const WebhookPayloadSchema = z.union([
	MessageEditedPayloadSchema,
	MessageRevokedPayloadSchema,
	RegularMessagePayloadSchema,
]);

// Main webhook schema
const WebhookSchema = z.object({
	timestamp: z.string(),
	payload: WebhookPayloadSchema,
});

// Flexible webhook schema that handles both wrapped and direct message formats
const FlexibleWebhookSchema = z.union([
	// Standard wrapped format
	WebhookSchema,
	// Direct message format - transform to wrapped format
	WebhookPayloadSchema.transform((data) => ({
		timestamp: new Date().toISOString(),
		payload: data
	}))
]);

const WHATSAPP_WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || 'secret';
const GOWA_API_KEY = process.env.GOWA_API_KEY || '';
const GOWA_BASE_URL = process.env.GOWA_BASE_URL || 'https://khalid.whatsapp.swalha.com';

type SendMessagePayload = z.infer<typeof SendMessageSchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
export type RegularMessagePayload = z.infer<typeof RegularMessagePayloadSchema>;
export type MessageEditedPayload = z.infer<typeof MessageEditedPayloadSchema>;
export type MessageRevokedPayload = z.infer<typeof MessageRevokedPayloadSchema>;
export type Webhook = z.infer<typeof WebhookSchema>;

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

	async parseMessage(request: NextRequest): Promise<Webhook> {
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
		const rawPayload = JSON.parse(body);

		console.log('Raw payload:', JSON.stringify(rawPayload, null, 2));
		console.log('Raw payload keys:', Object.keys(rawPayload));
		console.log('Payload field exists:', 'payload' in rawPayload);
		console.log('Payload value:', rawPayload.payload);
		
		// Validate and return type-safe webhook object using flexible schema
		const validationResult = FlexibleWebhookSchema.safeParse(rawPayload);
		if (!validationResult.success) {
			console.error('Invalid webhook payload:', JSON.stringify(validationResult.error, null, 2));
			console.error('Failed to validate data:', JSON.stringify(rawPayload, null, 2));
			throw new Error(`Invalid webhook payload: ${JSON.stringify(validationResult.error.issues, null, 2)}`);
		}
		
		return validationResult.data;
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