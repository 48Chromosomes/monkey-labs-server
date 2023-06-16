import { Request, Response } from 'express';

import {
	STORY_PROMPT_SYSTEM_MESSAGE,
	ROLL_PROMPT_SYSTEM_MESSAGE,
	VISUAL_DESCRIPTION_PROMPT_SYSTEM_MESSAGE,
} from '@/consts/chronicles/prompts';
import { openai } from '@/utilities/openai';

export default async function promptHandler(req: Request, res: Response) {
	const processedMessages = req.body.chatLogs.map((log: any) => {
		const { content, role } = log;
		return { role, content: content.story };
	});

	const messages = [
		{
			role: 'system',
			content: await STORY_PROMPT_SYSTEM_MESSAGE.format({
				character: JSON.stringify(req.body.character),
			}),
		},
		...processedMessages,
	];

	try {
		const storyCompletion = await openai.createChatCompletion({
			model: 'gpt-4',
			//model: 'gpt-3.5-turbo',
			messages,
			temperature: 0.8,
		});

		const story = storyCompletion.data.choices[0].message?.content;

		const [rollCompletionResponse, visualDescriptionCompletionResponse] =
			await Promise.all([
				rollCompletion(story as string),
				visualDescriptionCompletion(story as string),
			]);

		res.status(200).json({
			story,
			roll_dice: rollCompletionResponse,
			visual_description: visualDescriptionCompletionResponse,
		});
	} catch (error: any) {
		console.log(error.response.data);
		res.status(500).json({ error: error.response.data });
	}
}

const rollCompletion = async (story: string) => {
	const rollCompletion = await openai.createCompletion({
		model: 'text-davinci-003',
		prompt: await ROLL_PROMPT_SYSTEM_MESSAGE.format({ story }),
		temperature: 0,
		max_tokens: 200,
	});

	return rollCompletion.data.choices[0].text;
};

const visualDescriptionCompletion = async (story: string) => {
	const visualDescriptionCompletion = await openai.createCompletion({
		model: 'text-davinci-003',
		prompt: await VISUAL_DESCRIPTION_PROMPT_SYSTEM_MESSAGE.format({ story }),
		temperature: 0.5,
		max_tokens: 20,
	});

	return visualDescriptionCompletion.data.choices[0].text;
};
