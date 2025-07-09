interface DiscordNotification {
	embed: DiscordEmbed;
}

interface DiscordEmbed {
	title: string;
	description: string;
	fields: {
		name: string;
		value: string;
	}[];
}
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export const sendDiscordNotification = async (embed: DiscordEmbed) => {
	if (!DISCORD_WEBHOOK_URL) {
		throw new Error('DISCORD_WEBHOOK_URL is not set');
	}

	await fetch(DISCORD_WEBHOOK_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ embeds: [embed] }),
	});
};

export const sendErrorNotification = async (title: string, error_message: string) => {
	const embed: DiscordEmbed = {
		title: title,
		description: error_message,
		fields: [],
	};

	await sendDiscordNotification(embed);
};
