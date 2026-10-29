// Reduce la foto antes de enviarla a la API; se usa en motos y en el carrusel.
export async function reducirFoto(file) {
  const url = await new Promise((ok, fail) => {
    const reader = new FileReader();
    reader.onload = () => ok(reader.result);
    reader.onerror = fail;
    reader.readAsDataURL(file);
  });
  const im = await new Promise((ok, fail) => {
    const image = new Image();
    image.onload = () => ok(image);
    image.onerror = fail;
    image.src = url;
  });
  const scale = Math.min(1, 1200 / Math.max(im.width, im.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(im.width * scale));
  canvas.height = Math.max(1, Math.round(im.height * scale));
  canvas.getContext('2d').drawImage(im, 0, 0, canvas.width, canvas.height);
  const webp = canvas.toDataURL('image/webp', 0.85);
  if (webp.startsWith('data:image/webp')) return webp;
  const fallback = document.createElement('canvas');
  fallback.width = canvas.width;
  fallback.height = canvas.height;
  const context = fallback.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, fallback.width, fallback.height);
  context.drawImage(canvas, 0, 0);
  return fallback.toDataURL('image/jpeg', 0.85);
}
