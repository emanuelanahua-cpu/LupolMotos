export const createController = (s) => ({
  crear: async (req, res) => res.status(201).json(await s.crear(req.input)),
  cambiar: async (req, res) =>
    res.json(await s.cambiar(req.params.id, req.input, req.user)),
  pedidos: async (req, res) => res.json(await s.pedidos()),
  clientes: async (req, res) => res.json(await s.clientes()),
  editarCliente: async (req, res) =>
    res.json(await s.editarCliente(req.params.id, req.input)),
  ventas: async (req, res) => res.json(await s.ventas()),
  inventario: async (req, res) => res.json(await s.inventario()),
  ajustar: async (req, res) =>
    res.json(await s.ajustar(req.params.id, req.input, req.user)),
});
