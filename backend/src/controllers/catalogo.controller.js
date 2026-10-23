export function createController(service) {
  return {
    estado: async (req, res) => res.status(200).json(await service.estado({
      query: req.query,
      params: req.params,
      input: req.input,
      actor: req.user
    })),
    tienda: async (req, res) => res.status(200).json(await service.tienda({
      query: req.query,
      params: req.params,
      input: req.input,
      actor: req.user
    })),
    listarMotos: async (req, res) => res.status(200).json(await service.listarMotos({
      query: req.query,
      params: req.params,
      input: req.input,
      actor: req.user
    })),
    detalleMoto: async (req, res) => res.status(200).json(await service.detalleMoto({
      query: req.query,
      params: req.params,
      input: req.input,
      actor: req.user
    })),
    listarRepuestos: async (req, res) => res.status(200).json(await service.listarRepuestos({
      query: req.query,
      params: req.params,
      input: req.input,
      actor: req.user
    })),
    filtros: async (req, res) => res.status(200).json(await service.filtros({
      query: req.query,
      params: req.params,
      input: req.input,
      actor: req.user
    })),
    destacados: async (req, res) => res.status(200).json(await service.destacados({
      query: req.query,
      params: req.params,
      input: req.input,
      actor: req.user
    }))
  };
}
