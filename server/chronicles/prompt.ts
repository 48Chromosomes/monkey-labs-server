import { Request, Response } from 'express';
import { ChatCompletionRequestMessage } from 'openai';

import {
	STORY_PROMPT_SYSTEM_MESSAGE,
	ROLL_PROMPT_SYSTEM_MESSAGE,
} from '@/consts/chronicles/prompts';
import { openai } from '@/utilities/openai';

export default async function promptHandler(req: Request, res: Response) {
	const processedMessages: ChatCompletionRequestMessage[] =
		req.body.chatLogs.map((log: any) => {
			const { content, role } = log;
			return { role, content: content.story };
		});

	const messages: ChatCompletionRequestMessage[] = [
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
			messages,
			temperature: 0.8,
		});

		const story: string | undefined =
			storyCompletion.data.choices[0].message?.content;

		const rollCompletionResponse = await rollCompletion(story as string);

		res.status(200).json({
			story,
			roll_dice: rollCompletionResponse?.toLowerCase().includes('true'),
		});
	} catch (error: any) {
		console.log(error.response.data);
		res.status(500).json({ error: error.response.data });
	}
}

const rollCompletion = async (story: string) => {
	try {
		const rollCompletion = await openai.createCompletion({
			model: 'text-davinci-003',
			prompt: await ROLL_PROMPT_SYSTEM_MESSAGE.format({ story }),
			temperature: 0,
			max_tokens: 200,
		});

		return rollCompletion.data.choices[0].text;
	} catch (error: any) {
		console.log(error.response.data);
		return;
	}
};
