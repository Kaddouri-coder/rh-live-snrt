import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './backend/routes/apiRouter';
import { testConnection } from './backend/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Vérifie la connexion à PostgreSQL (snrt_db) au démarrage
  await testConnection();

  app.use(express.json());

  // Mount modular backend API router
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', app: 'mPlanner V2 - Fullstack App' });
  });

  // Serve Frontend via Vite middleware in Dev or Static files in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`mPlanner V2 backend & frontend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
