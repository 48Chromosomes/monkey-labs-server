import { OpenAI } from 'langchain/llms';
import { initializeAgentExecutor } from 'langchain/agents';
import { SerpAPI } from 'langchain/tools';
import { PromptTemplate } from 'langchain/prompts';
import prompts from 'prompts';
import fs from 'fs';

export const run = async () => {
  const model = new OpenAI({ temperature: 0 });
  const tools = [];

  //const executor = await initializeAgentExecutor(tools, model, 'zero-shot-react-description', true);
  //console.log('Loaded agent.');

  /* const promptAnswers = await prompts([
    {
      type: 'text',
      name: 'prompt',
      message: `Propmt: `,
    },
  ]);
  const { prompt } = promptAnswers; */

  fs.readFile('./components/Console/Listener/Listener.tsx', 'utf8', async (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const input = `You are a software developer. Your job is to review code and find ways for the code to be improved and optimised. The following is a typescript code snippet. Respond with a list of specific examples of changes you would make to improve this code in JSON format. The JSON output should have the fields 'old_code', 'new_code', 'reason'. The 'old_code' field should contain the code that you would like to change, the 'new_code' field should contain the code that you would like to replace it with, and 'reason' should include a brief description of why that line should be changed.

    =========
    ${data}
    =========`;

    console.log(`Executing...`);

    const resA = await model.call(input);

    //const result = await executor.call({ input });

    console.log(resA);
  });
};

(async () => {
  await run();
})();
