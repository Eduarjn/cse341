// app.js
import { readFileSync } from 'node:fs';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import router from './src/router.js';

// OpenAPI document for /api-docs (read once at startup)
const swaggerDocument = JSON.parse(readFileSync(new URL('./swagger.json', import.meta.url), 'utf8'));

const app = express();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(router);

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Server is running' });
});

// Errors thrown before a controller runs (for example, a body that is not valid JSON)
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }
  console.error(`${req.method} ${req.path} failed:`, error.message);
  return res.status(500).json({ message: 'Internal server error' });
});

export default app;
