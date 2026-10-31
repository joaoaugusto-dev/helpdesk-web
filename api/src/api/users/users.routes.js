import { Router } from 'express'

import { authenticate, requireAdmin } from '../../shared/middleware.js'

export function usersRoutes({ db, config }, controller) {
    const router = Router()

    // Gerenciamento de usuarios: somente administradores
    router.use('/users', authenticate({ db, config }), requireAdmin)

    router.get('/users', controller.list)
    router.post('/users', controller.create)

    return router
}
