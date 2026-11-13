import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { root } from '../config/db.js';
import { obtenerImagen } from '../services/imagenes.service.js';
export function configureWeb(app, pool) {
  app.get('/uploads/:id', async (req, res) => {
    const image = await obtenerImagen(pool, req.params.id);
    res.set('Content-Type', image.mime).set('Cache-Control', 'public, max-age=31536000, immutable').send(image.contenido);
  });
  const dist = path.join(root, 'frontend/dist');
  const carpetasMotos = new Map();
  for (const grupo of ['gasolina', 'electricas']) {
    try {
      for (const entrada of fs.readdirSync(path.join(dist, 'multimedia', grupo), { withFileTypes: true })) {
        if (entrada.isDirectory()) carpetasMotos.set(entrada.name, grupo);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  // Los enlaces antiguos siguen funcionando tras mover las fotos de carpeta.
  app.use('/multimedia', (req, res, next) => {
    const [carpeta, ...resto] = req.path.split('/').filter(Boolean);
    const grupo = carpetasMotos.get(carpeta);
    if (!grupo || !resto.length || !['GET', 'HEAD'].includes(req.method)) return next();
    res.redirect(308, `/multimedia/${grupo}/${carpeta}/${resto.join('/')}`);
  });
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
