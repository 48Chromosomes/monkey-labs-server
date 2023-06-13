import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

import chatHandler from './chat';
import listIndexesHandler from './listIndexes';

import promptHandler from './chronicles/prompt';
import characterHandler from './chronicles/character';

const app = express();

app.use(express.json());
app.use(cors());

app.set('port', process.env.PORT);

app.get('/', (req: Request, res: Response) => {
	res.send('Hello');
});

app.post('/chat', chatHandler);
app.post('/list-indexes', listIndexesHandler);

// Chronicles
app.post('/chronicles/prompt', promptHandler);
app.get('/chronicles/character', characterHandler);

app.listen(app.get('port'), () => {
	console.log(`Server is running on port ${app.get('port')}`);
});
