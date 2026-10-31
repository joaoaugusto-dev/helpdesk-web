import { Router } from 'express'

import { authenticate } from '../../shared/middleware.js'

export function authRoutes({ db, config }, controller) {
    const router = Router()

    router.post('/auth', controller.login)
    router.get('/me', authenticate({ db, config }), controller.me)

    return router
}
