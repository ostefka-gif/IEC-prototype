import express from 'express';
import { createServer as createViteServer } from 'vite';

async function createServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(vite.middlewares);

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on http://localhost:3000');
  });
}

createServer();
