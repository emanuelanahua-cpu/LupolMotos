export function createController(service) {
  return {
    publico: async (req, res) => res.status(200).json(await service.listarPublico()),
    admin: async (req, res) => res.status(200).json(await service.listarAdmin()),
    guardar: async (req, res) => res.status(200).json(await service.guardar({ input: req.input }))
  };
}
