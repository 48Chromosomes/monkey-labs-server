import { Request, Response } from 'express';
import { ChatCompletionRequestMessage } from 'openai';

import { STORY_PROMPT_SYSTEM_MESSAGE } from '@/consts/chronicles/prompts';
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
			model: 'gpt-3.5-turbo-16k',
			messages,
			temperature: 0.8,
		});

		const story: string | undefined =
			storyCompletion.data.choices[0].message?.content;

		res.status(200).json({
			story,
		});
	} catch (error: any) {
		console.log(error.response.data);
		res.status(500).json({ error: error.response.data });
	}
}
