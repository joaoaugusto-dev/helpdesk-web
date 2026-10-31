import { createUsersService } from './users.service.js'
import { createUsersController } from './users.controller.js'
import { usersRoutes } from './users.routes.js'

export function usersModule(deps) {
    const service = createUsersService(deps)
    const controller = createUsersController(service)

    return usersRoutes(deps, controller)
}
