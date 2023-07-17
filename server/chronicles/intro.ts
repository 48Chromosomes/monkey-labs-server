import { Request, Response } from 'express';
import { ChatCompletionRequestMessage } from 'openai';

import {
	STORY_PROMPT_SYSTEM_MESSAGE,
	INTRO_SYSTEM_MESSAGE,
} from '@/consts/chronicles/prompts';
import { openai } from '@/utilities/openai';

export default async function introHandler(req: Request, res: Response) {
	const messages: ChatCompletionRequestMessage[] = [
		{
			role: 'system',
			content: await STORY_PROMPT_SYSTEM_MESSAGE.format({
				character: JSON.stringify(req.body.character),
			}),
		},
		{
			role: 'user',
			content: INTRO_SYSTEM_MESSAGE,
		},
	];

	try {
		const introCompletion = await openai.createChatCompletion({
			model: 'gpt-3.5-turbo-16k',
			messages,
			temperature: 0.8,
		});

		res.status(200).json({
			intro: introCompletion.data.choices[0].message?.content,
		});
	} catch (error: any) {
		console.log(error.response.data);
		res.status(500).json({ error: error.response.data });
	}
}
