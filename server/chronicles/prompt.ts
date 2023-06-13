import { Request, Response } from 'express';

import { STORY_PROMPT_SYSTEM_MESSAGE } from '@/consts/chronicles/prompts';
import { openai } from '@/utilities/openai';

export default async function promptHandler(req: Request, res: Response) {
	const messages = [
		{
			role: 'system',
			content: `${STORY_PROMPT_SYSTEM_MESSAGE} ${req.body.character}`,
		},
		...req.body.chatLogs,
		{ role: 'user', content: req.body.prompt },
	];

	const completion = await openai.createChatCompletion({
		model: 'gpt-4',
		messages,
		max_tokens: 2000,
		temperature: 0,
	});

	res.status(200).json(completion.data.choices[0].message?.content);
}
