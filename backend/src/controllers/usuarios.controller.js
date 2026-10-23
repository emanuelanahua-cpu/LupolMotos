export function createController(service) {
  return {
    listar: async (req, res) => res.status(200).json(await service.listar({
      query: req.query,
      params: req.params,
      input: req.input,
      actor: req.user
    })),
    crear: async (req, res) => res.status(201).json(await service.crear({
      query: req.query,
      params: req.params,
      input: req.input,
      actor: req.user
    })),
    eliminar: async (req, res) => res.status(200).json(await service.eliminar({
      query: req.query,
      params: req.params,
      input: req.input,
      actor: req.user
    }))
  };
}
