import { createLoginGuard } from './loginGuard.js'
import { createAuthService } from './auth.service.js'
import { createAuthController } from './auth.controller.js'
import { authRoutes } from './auth.routes.js'

export function authModule(deps) {
    const loginGuard = createLoginGuard({
        maxAttempts: deps.config.loginMaxAttempts,
        lockSeconds: deps.config.loginLockSeconds
    })

    const service = createAuthService({ ...deps, loginGuard })
    const controller = createAuthController(service)

    return authRoutes(deps, controller)
}
