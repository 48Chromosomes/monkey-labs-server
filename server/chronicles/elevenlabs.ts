import axios from 'axios';
import { Request, Response } from 'express';

export default async function elevenlabsHandler(req: Request, res: Response) {
	try {
		const voiceId = process.env.ELEVENLABS_VOICE_ID;
		const apiKey = process.env.ELEVENLABS_API_KEY;
		const textToConvert = req.body.text;

		if (!apiKey || typeof apiKey !== 'string') {
			res.status(400).send('Missing xi-api-key header');
			return;
		}

		const data = {
			text: textToConvert,
			model_id: 'eleven_monolingual_v1',
			voice_settings: {
				stability: 0.5,
				similarity_boost: 0.5,
			},
		};

		const headers = {
			accept: 'audio/mpeg',
			'xi-api-key': apiKey,
			'Content-Type': 'application/json',
		};

		const response = await axios({
			method: 'POST',
			url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=4`,
			data,
			headers,
			responseType: 'stream',
		});

		res.setHeader('Content-Type', 'audio/mpeg');
		response.data.pipe(res);
	} catch (error) {
		console.error('Error occurred while synthesizing speech: ', error);
		res.status(500).send('Error occurred while synthesizing speech');
	}
}
