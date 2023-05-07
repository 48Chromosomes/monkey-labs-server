import { Request, Response } from 'express';
import ejs from 'extract-json-string';

import { openai } from '@/utilities/openai';
import { PROMPTS } from '@/consts/dnd/prompts';

export default async function characterHandler({ res }: { res: Response }) {
  const completion = await openai.createCompletion({
    model: 'gpt-4',
    prompt: PROMPTS.GENERATE_CHARACTER,
    max_tokens: 2000,
    temperature: 0,
  });

  console.log(completion.data.choices);

  /* const response = completion.data.choices[0] || { content: '' };

  response.content = JSON.stringify(ejs.extract(response.content)[0], undefined, 2);

  res.status(200).json(response); */
}
