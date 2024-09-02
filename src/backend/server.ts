import express, { json, Request, Response } from 'express';
import { echo } from './echo.ts';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import HTTPError from 'http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');

app.get('/', sui.serve, sui.setup(YAML.parse(file)))

// app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
// app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req: Request, res: Response) => {
    const data = req.query.echo as string;
    return res.json(echo(data));
  });