import { Request, Response } from 'express';
import { google } from 'googleapis';

const youtube = google.youtube({
	version: 'v3',
	auth: process.env.YOUTUBE_API_KEY,
});

export default async function youTubeChatHandler(req: Request, res: Response) {
	const messages = await getRecentChatMessages({ videoId: req.body.videoId });
	res.status(200).json({ messages });
}

async function getRecentChatMessages({ videoId }: { videoId: string }) {
	const liveChatId = await getLiveChatId({ videoId });

	const messages = await getChatMessages(liveChatId as string);

	const currentTime = Date.now();

	const recentChats = messages?.filter((message: any) => {
		const messageTime = Date.parse(message.timestamp);
		return currentTime - messageTime <= 60000;
	});

	return recentChats;
}

async function getLiveChatId({ videoId }: { videoId: string }) {
	const response = await youtube.videos.list({
		id: [videoId],
		part: ['liveStreamingDetails'],
	});

	if (
		response.data.items &&
		response.data.items[0] &&
		response.data.items[0].liveStreamingDetails
	) {
		return response.data.items[0].liveStreamingDetails.activeLiveChatId;
	} else {
		throw new Error('Live chat ID not found');
	}
}

async function getChatMessages(liveChatId: string) {
	const response = await youtube.liveChatMessages.list({
		liveChatId: liveChatId,
		part: ['snippet', 'authorDetails'],
	});

	return response.data.items?.map((item: any) => {
		return {
			message: item.snippet.displayMessage,
			username: item.authorDetails.displayName,
			timestamp: item.snippet.publishedAt,
			includesTaggedUser:
				item.snippet.displayMessage.includes('@48 Chronicles'),
		};
	});
}
