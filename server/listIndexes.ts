import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

import { initPinecone } from '@/utilities/pinecone/pinecone-client';

export default async function listIndexesHandler(req: Request, res: Response) {
  if (req.body.currentVectorStore === 'Pinecone') {
    const pinecone = await initPinecone();

    const indexesList = await pinecone.listIndexes();

    res.status(200).json(indexesList);
  } else if (req.body.currentVectorStore === 'HNSWLib') {
    fs.readdir(path.join(process.cwd(), '/vectors'), (err, files) => {
      const indexesList: string[] = [];

      // Filter out hidden files
      files = files.filter((item) => !/(^|\/)\.[^\/\.]/g.test(item));

      files.forEach((file) => indexesList.push(file.split('.')[0]));

      res.status(200).json(indexesList);
    });
  } else {
    res.status(400).json({ message: 'Invalid vector store' });
  }
}
