import { Request, Response } from 'express';
import api from 'api';

const sdk = api('@leonardoai/v1.0#28807z41owlgnis8jg');

export default async function imageGenerationHandler(
	req: Request,
	res: Response,
) {
	try {
		sdk.auth(process.env.LEONARDO_API_KEY);

		const response = await sdk.createGeneration({
			prompt: req.body.prompt,
			modelId: 'a097c2df-8f0c-4029-ae0f-8fd349055e61',
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
