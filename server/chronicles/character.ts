import { Request, Response } from 'express';

import { openai } from '@/utilities/openai';
import { GENERATE_CHARACTER } from '@/consts/chronicles/prompts';

export default async function characterHandler(req: Request, res: Response) {
	const completion = await openai.createCompletion({
		model: 'gpt-3.5-turbo-instruct',
		prompt: GENERATE_CHARACTER,
		max_tokens: 2000,
		temperature: 0.8,
	});

	const character = completion.data.choices[0].text;

	const completion2 = await openai.createCompletion({
		model: 'gpt-3.5-turbo-instruct',
		prompt: `Transform this JSON object into a valid JSON object with no errors: ${character}`,
		max_tokens: 2000,
		temperature: 0,
	});

	res.status(200).json(completion2.data.choices[0].text);
}
