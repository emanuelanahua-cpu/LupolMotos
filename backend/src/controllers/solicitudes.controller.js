export function createController(service) {
  return {
    cotizar: async (req, res) => res.status(200).json(await service.cotizar({
      query: req.query,
      params: req.params,
      input: req.input,
      actor: req.user
    })),
    reservar: async (req, res) => res.status(200).json(await service.reservar({
      query: req.query,
      params: req.params,
      input: req.input,
      actor: req.user
    })),
    contactar: async (req, res) => res.status(200).json(await service.contactar({
      query: req.query,
      params: req.params,
      input: req.input,
      actor: req.user
    })),
    listar: async (req, res) => res.status(200).json(await service.listar({
      query: req.query,
      params: req.params,
      input: req.input,
      actor: req.user
    }))
  };
}
