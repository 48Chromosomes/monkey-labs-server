import { ChatCompletionRequestMessageRoleEnum } from 'openai';

export type ChatLog = {
	role: ChatCompletionRequestMessageRoleEnum;
	content: string;
};
