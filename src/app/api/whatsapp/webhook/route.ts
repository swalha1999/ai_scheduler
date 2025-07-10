import { replayToWhatsapp } from '@/core/agents/chat';
import dal from '@/data/access-layer-v2';
import { GowaClient } from '@/lib/GOWA';
import { NextRequest, NextResponse } from 'next/server';

const gowa = new GowaClient(
	undefined,
	process.env.GOWA_API_KEY || ''
);

export async function POST(request: NextRequest) {
	try {
		
		const payload = await gowa.parseMessage(request);
		// Log the received message (you can customize this)
		console.log('Received webhook:', {
			timestamp: new Date().toISOString(),
			payload: payload
		});
		
	
		// Extract message data from payload based on payload type
		let messageText = '';
		let fromPhone = '';
		let senderName = '';
		let shouldReply = false;

		// Handle different payload types
		if ('action' in payload.payload) {
			// This is either message_edited or message_revoked
			fromPhone = payload.payload.from;
			senderName = payload.payload.pushname;
			shouldReply = false; // Don't reply to edited or revoked messages
		} else {
			// This is a regular message
			fromPhone = payload.payload.from;
			senderName = payload.payload.pushname;
			messageText = payload.payload.message.text || '';
			shouldReply = !!messageText; // Only reply if there's text content
		}

		if (!fromPhone) {
			console.error('No phone number in payload');
			return NextResponse.json(
				{ error: 'No phone number in payload' },
				{ status: 400 }
			);
		}

		// Auto-create or find contact
		try {
			const contact = await dal.contacts.findOrCreateContact(
				fromPhone,
				'', // whatsappId not available in current payload
				senderName
			);
			
			console.log('Contact processed:', {
				id: contact.id,
				phone: contact.phone,
				name: contact.name,
			});

			// Check if contact is whitelisted
			// in the future we will handle this differently check if the contact is timeouted or blocked 
			const isWhitelisted = await dal.contacts.isWhitelisted(contact.id);
			
			if (!isWhitelisted) {
				console.log('Contact not whitelisted, skipping reply:', fromPhone);
				return NextResponse.json(
					{ 
						success: true,
						message: 'Message received but contact not whitelisted',
						contact: {
							id: contact.id,
							phone: contact.phone,
							name: contact.name,
						},
						isWhitelisted: false,
					},
					{ status: 200 }
				);
			}

			// Skip replying to non-text messages (edited, revoked, etc.)
			if (!shouldReply) {
				const messageType = 'action' in payload.payload ? payload.payload.action : 'no text';
				console.log('Skipping reply for message type:', messageType);
				return NextResponse.json(
					{ 
						success: true,
						message: 'Message received but no reply needed for this message type',
						contact: {
							id: contact.id,
							phone: contact.phone,
							name: contact.name,
						},
						isWhitelisted: true,
					},
					{ status: 200 }
				);
			}

			// Contact is whitelisted, process and reply
			const replay = await replayToWhatsapp(messageText);
			console.log('Replay:', replay);

			await gowa.sendMessage({
				phone: fromPhone,
				message: replay
			});

			console.log('Reply sent to whitelisted contact:', fromPhone);
		} catch (error) {
			console.error('Error processing contact or sending reply:', error);
			return NextResponse.json(
				{ error: 'Error processing message' },
				{ status: 500 }
			);
		}
		
		return NextResponse.json(
			{ 
				success: true,
				message: 'Webhook processed successfully',
				timestamp: new Date().toISOString(),
		
				replySent: true,
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
	return await gowa.handleWebhookVerification(request);
} 