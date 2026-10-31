import jwt from 'jsonwebtoken'

import { httpError } from './errors.js'

// Exige "Authorization: Bearer <token>" valido e carrega o usuario em req.user
export function authenticate({ db, config }) {
    return (req, _res, next) => {
        const header = req.headers.authorization ?? ''
        const [scheme, token] = header.split(' ')

        if (scheme !== 'Bearer' || !token) {
            return next(httpError(401, 'Token de acesso não informado'))
        }

        try {
            const payload = jwt.verify(token, config.jwtSecret)
            const user = db.users.find((u) => u.id === Number(payload.sub))

            if (!user) {
                return next(httpError(401, 'Token inválido'))
            }

            req.user = user
            next()
        } catch {
            next(httpError(401, 'Token inválido ou expirado'))
        }
    }
}

export function requireAdmin(req, _res, next) {
    if (req.user?.role !== 'admin') {
        return next(httpError(403, 'Acesso restrito a administradores'))
    }

    next()
}

export function notFound(_req, _res, next) {
    next(httpError(404, 'Rota não encontrada'))
}

export function errorHandler(err, _req, res, _next) {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON inválido' })
    }

    const status = err.status ?? 500

    if (status === 500) {
        console.error(err)
    }

    res.status(status).json({
        error: status === 500 ? 'Erro interno do servidor' : err.message,
        ...err.extra
    })
}
