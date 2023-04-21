import { PromptTemplate } from 'langchain/prompts';

export type AllowedRoles = 'ASSISTANT' | 'SOFTWARE_ENGINEER' | 'TWEETER' | '-';
export type AllowedVectorStores = 'Pinecone' | 'HNSWLib';

export type Role = {
  id: AllowedRoles;
  label: string;
  description?: string;
  temperature: number;
  prompt: string;
};

export type Prompts = {
  [key: string]: PromptTemplate;
};

export type ChatLog = {
  role: 'apiMessage' | 'userMessage';
  content: string;
  silent?: boolean;
  sourceDocs?: Document[];
};
