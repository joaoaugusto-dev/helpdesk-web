export function createTicketsController(ticketsService) {
    return {
        list(req, res) {
            res.json(ticketsService.list(req.user, req.query))
        },

        get(req, res) {
            res.json(ticketsService.get(req.user, req.params.id))
        },

        create(req, res) {
            res.status(201).json(ticketsService.create(req.user, req.body ?? {}))
        },

        replace(req, res) {
            res.json(ticketsService.update(req.user, req.params.id, req.body ?? {}, { partial: false }))
        },

        patch(req, res) {
            res.json(ticketsService.update(req.user, req.params.id, req.body ?? {}, { partial: true }))
        },

        remove(req, res) {
            res.json(ticketsService.remove(req.user, req.params.id))
        }
    }
}
