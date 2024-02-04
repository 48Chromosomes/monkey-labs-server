import { Request, Response } from 'express';
import { ChatCompletionRequestMessage } from 'openai';
import api from 'api';

import { openai } from '@/utilities/openai';
import { GPT_MODEL } from '@/consts/chronicles';

import { VISUAL_DESCRIPTION_PROMPT_SYSTEM_MESSAGE } from '@/consts/chronicles/prompts';

const sdk = api('@leonardoai/v1.0#l1va2x2lo861fet');

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

			description = await visualDescriptionCompletion(
				processedMessages,
				req.body.character,
			);
		}

		sdk.auth(process.env.LEONARDO_API_KEY);

		const response = await sdk.createGeneration({
			prompt: `${description}, ultra detailed, 8k resolution`,
			modelId: '2067ae52-33fd-4a82-bb92-c2c55e7d2786', // AlbedoBase XL
			width: req.body.width,
			height: req.body.height,
			sd_version: 'v2',
			num_images: 1,
			guidance_scale: 15,
			public: false,
			promptMagic: true,
			negative_prompt: 'dice D20 roll crown',
			nsfw: true,
			alchemy: true,
			//presetStyle: 'ILLUSTRATION',
			//highResolution: true,
			//expandedDomain: true,
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
	character: any,
) => {
	const messages: ChatCompletionRequestMessage[] = [
		{
			role: 'system',
			content: await VISUAL_DESCRIPTION_PROMPT_SYSTEM_MESSAGE.format({
				character: JSON.stringify(character),
			}),
		},
		processedMessages[processedMessages.length - 1],
	];

	try {
		const visualDescriptionCompletion = await openai.createChatCompletion({
			model: GPT_MODEL,
			messages,
			temperature: 0.5,
			max_tokens: 100,
		});

		return visualDescriptionCompletion.data.choices[0].message?.content;
	} catch (error: any) {
		console.log(error.response.data);
		return;
	}
};
