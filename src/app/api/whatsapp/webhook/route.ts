import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { replayToWhatsapp } from '@/core/agents/chat';
import { GowaClient } from '@/lib/GOWA';

const WHATSAPP_WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || 'secret';

function verifySignature(payload: string, signature: string, secret: string): boolean {
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

export async function POST(request: NextRequest) {
	try {
		// Get the raw body as text for signature verification
		const body = await request.text();
		
		// Get the signature from headers
		const signature = request.headers.get('x-signature-256') || 
						 request.headers.get('x-hub-signature-256') || 
						 request.headers.get('signature');

		
		if (!signature) {
            console.log('Missing signature header');
			return NextResponse.json(
				{ error: 'Missing signature header' },
				{ status: 401 }
			);
		}
		
		// Verify the signature
		if (!verifySignature(body, signature, WHATSAPP_WEBHOOK_SECRET)) {
            console.error('Whatsapp: Webhook signature verification failed');
			return NextResponse.json(
				{ error: 'Invalid signature' },
				{ status: 401 }
			);
		}
		
		// Parse the verified payload
		const payload = JSON.parse(body);
		
		// Log the received message (you can customize this)
		console.log('Received webhook:', {
			timestamp: new Date().toISOString(),
			payload: payload
		});
		
		// Process the received message here
		// This is where you would handle the incoming message data
		// For example:
		// - Save to database
		// - Send automated responses
		// - Process message content

        const replay = await replayToWhatsapp(payload.message.text);
        console.log('Replay:', replay);

        const gowa = new GowaClient();
        await gowa.sendMessage({
            phone: payload.from,
            message: replay
        });
		
		return NextResponse.json(
			{ 
				success: true,
				message: 'Webhook processed successfully',
				timestamp: new Date().toISOString()
			},
			{ status: 200 }
		);
		
	} catch (error) {
		console.error('Webhook processing error:', error);
		
		if (error instanceof SyntaxError) {
			return NextResponse.json(
				{ error: 'Invalid JSON payload' },
				{ status: 400 }
			);
		}
		
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

// Handle GET requests for webhook verification (common for some webhook providers)
export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const challenge = searchParams.get('hub.challenge');
	const verifyToken = searchParams.get('hub.verify_token');
	
	// Verify the token if provided
	if (verifyToken && verifyToken !== WHATSAPP_WEBHOOK_SECRET) {
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