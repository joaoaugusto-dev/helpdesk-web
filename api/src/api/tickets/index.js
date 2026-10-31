import { createTicketsService } from './tickets.service.js'
import { createTicketsController } from './tickets.controller.js'
import { ticketsRoutes } from './tickets.routes.js'

export function ticketsModule(deps) {
    const service = createTicketsService(deps)
    const controller = createTicketsController(service)

    return ticketsRoutes(deps, controller)
}
