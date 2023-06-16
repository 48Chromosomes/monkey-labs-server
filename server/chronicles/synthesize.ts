import textToSpeech, { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { Request, Response } from 'express';

const client: TextToSpeechClient = new textToSpeech.TextToSpeechClient({
	projectId: 'thewizard-380520',
});

export default async function synthesizeHandler(req: Request, res: Response) {
	try {
		// @ts-ignore
		const [response] = await client.synthesizeSpeech({
			input: { text: req.body.text },
			voice: {
				languageCode: 'en-GB',
				name: 'en-GB-News-K',
			},
			audioConfig: {
				audioEncoding: 'MP3',
				pitch: 1,
				speakingRate: 1,
			},
		});

		res.set('Content-Type', 'audio/mpeg');

		res.send(response.audioContent);
	} catch (error) {
		console.error('Error occurred while synthesizing speech: ', error);
		res.status(500).send('Error occurred while synthesizing speech');
	}
}
