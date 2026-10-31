import { Router } from 'express'

import { authModule } from './auth/index.js'
import { ticketsModule } from './tickets/index.js'
import { usersModule } from './users/index.js'

// Cada modulo (auth, tickets, users) tem suas rotas, controller e service.
export function apiRouter(deps) {
    const router = Router()

    router.use(authModule(deps))
    router.use(ticketsModule(deps))
    router.use(usersModule(deps))

    return router
}
