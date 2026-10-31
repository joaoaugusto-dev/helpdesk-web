import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function loadConfig(overrides = {}) {
    const env = process.env

    let jwtSecret = env.JWT_SECRET

    if (!jwtSecret) {
        // Sem segredo configurado: gera um aleatorio (os tokens deixam de valer ao reiniciar)
        jwtSecret = crypto.randomBytes(32).toString('hex')
        console.warn('[aviso] JWT_SECRET nao definido; usando segredo temporario.')
    }

    return {
        host: env.HOST ?? '127.0.0.1',
        port: Number(env.PORT ?? 5050),
        databaseFile: env.DATABASE_FILE ?? path.join(root, 'data', 'database.json'),
        // pasta do front ja compilado; quando definida, o proprio servidor entrega o site (um so processo, mesma origem)
        staticDir: env.STATIC_DIR,
        corsOrigin: env.CORS_ORIGIN ?? 'http://localhost:5173',
        jwtSecret,
        jwtExpiresInSeconds: Number(env.JWT_EXPIRES_IN ?? 3600),
        bcryptRounds: Number(env.BCRYPT_ROUNDS ?? 10),
        // Bloqueio de login: tentativas erradas seguidas antes de bloquear e duracao do bloqueio
        loginMaxAttempts: Number(env.LOGIN_MAX_ATTEMPTS ?? 5),
        loginLockSeconds: Number(env.LOGIN_LOCK_SECONDS ?? 300),
        ...overrides
    }
}
