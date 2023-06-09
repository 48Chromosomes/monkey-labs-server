import { Request, Response } from 'express';
import { ChatCompletionRequestMessage } from 'openai';
import api from 'api';

import { openai } from '@/utilities/openai';

import { VISUAL_DESCRIPTION_PROMPT_SYSTEM_MESSAGE } from '@/consts/chronicles/prompts';

const sdk = api('@leonardoai/v1.0#28807z41owlgnis8jg');

export default async function imageGenerationHandler(
	req: Request,
	res: Response,
) {
	try {
		let description = req.body.prompt;

		if (req.body.chatLogs) {
			const processedMessages: ChatCompletionRequestMessage[] =
				req.body.chatLogs.map((log: any) => {
					const { content, role } = log;
					return { role, content: content.story };
				});

			description = await visualDescriptionCompletion(processedMessages);
		}

		sdk.auth(process.env.LEONARDO_API_KEY);

		const response = await sdk.createGeneration({
			prompt: description,
			modelId: 'ac614f96-1082-45bf-be9d-757f2d31c174',
			width: req.body.width,
			height: req.body.height,
			sd_version: 'v1_5',
			num_images: 1,
			guidance_scale: 15,
			public: false,
			promptMagic: true,
		});

		const { generationId } = response.data.sdGenerationJob;

		const url = await pollGeneration(generationId);

		res.status(200).json({ url });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ error: 'An error occurred while generating the image.' });
	}
}

const pollGeneration = async (id: string) => {
	const response = await sdk.getGenerationById({ id });

	if (
		!response.data.generations_by_pk ||
		response.data.generations_by_pk?.status !== 'COMPLETE'
	) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(pollGeneration(id));
			}, 2000);
		});
	}

	return response.data.generations_by_pk.generated_images[0].url;
};

const visualDescriptionCompletion = async (
	processedMessages: ChatCompletionRequestMessage[],
) => {
	const messages: ChatCompletionRequestMessage[] = [
		{
			role: 'system',
			content: VISUAL_DESCRIPTION_PROMPT_SYSTEM_MESSAGE,
		},
		processedMessages[processedMessages.length - 1],
	];

	try {
		const visualDescriptionCompletion = await openai.createChatCompletion({
			model: 'gpt-4',
			messages,
			temperature: 0.3,
			max_tokens: 200,
		});

		return visualDescriptionCompletion.data.choices[0].message?.content;
	} catch (error: any) {
		console.log(error.response.data);
		return;
	}
};
