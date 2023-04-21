import { OpenAI } from 'langchain/llms';
import { exec } from 'child_process';
import watch from 'node-watch';
import * as fs from 'fs';

watch(
  './',
  {
    recursive: true,
  },
  (evt, name: string) => {
    console.log('%s changed.', name);

    if (name.includes('dist/')) return;

    exec(`npx tsc ${name} --incremental false --noEmit --skipLibCheck`, (error, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      if (stdout.length > 0) getErrorFix({ error: stdout, file: name });
    });
  },
);

export const getErrorFix = ({ error, file }: { error: any; file: any }) => {
  const model = new OpenAI({ temperature: 0 });

  fs.readFile(`./${file}`, 'utf8', async (err, data) => {
    const input = `You are a software developer. Your job is to review code and debug errors. The following is a code snippet that is causing an error and the error message. Refactor the code to fix the error. The output should be a JSON object containing the lines that should be changed with 'line_number', 'old_code', 'new_code', 'reason' where 'line_number' is the line number of the code you are talking about, 'old_code' is the origional code, 'new_code' is the new fixed code, and 'reason' is a short description of why you made thing change.

    =========
    ${data}
    =========
    
    =========
    ${error}
    =========
    `;

    console.log(`Executing...`);

    const resA = await model.call(input);

    console.log(resA);
  });
};
