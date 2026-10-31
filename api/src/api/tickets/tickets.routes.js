import { Router } from 'express'

import { authenticate } from '../../shared/middleware.js'

export function ticketsRoutes({ db, config }, controller) {
    const router = Router()

    router.use('/tickets', authenticate({ db, config }))

    router.get('/tickets', controller.list)
    router.get('/tickets/:id', controller.get)
    router.post('/tickets', controller.create)
    router.put('/tickets/:id', controller.replace)
    router.patch('/tickets/:id', controller.patch)
    router.delete('/tickets/:id', controller.remove)

    return router
}
