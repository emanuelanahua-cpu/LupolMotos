import express from 'express';
import path from 'node:path';
import { root } from '../config/db.js';
import { obtenerImagen } from '../services/imagenes.service.js';
export function configureWeb(app, pool) {
  app.get('/uploads/:id', async (req, res) => {
    const image = await obtenerImagen(pool, req.params.id);
    res.set('Content-Type', image.mime).set('Cache-Control', 'public, max-age=31536000, immutable').send(image.contenido);
  });
  const dist = path.join(root, 'frontend/dist');
  app.use(express.static(dist, {
    index: false,
    dotfiles: 'deny'
  }));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || path.extname(req.path) || req.path.split('/').some(p => p.startsWith('.')) || req.path.startsWith('/uploads/')) return res.status(404).json({
      detail: 'Archivo no encontrado'
    });
    res.sendFile(path.join(dist, 'index.html'), e => e && next(e));
  });
}
