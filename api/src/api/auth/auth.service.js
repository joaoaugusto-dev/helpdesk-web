import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { httpError } from '../../shared/errors.js'

export function createAuthService({ db, config, loginGuard }) {
    // Usado quando o e-mail nao existe, para a resposta demorar o mesmo tempo
    const dummyHash = bcrypt.hashSync('senha-inexistente', config.bcryptRounds)

    return {
        login({ email, password, admin }) {
            if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
                throw httpError(400, 'Informe e-mail e senha')
            }

            const locked = loginGuard.remainingLockSeconds(email)

            if (locked > 0) {
                throw httpError(
                    429,
                    `Muitas tentativas. Tente novamente em ${Math.ceil(locked / 60)} minuto(s).`,
                    { retryAfterSeconds: locked }
                )
            }

            const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
            const passwordOk = bcrypt.compareSync(password, user?.passwordHash ?? dummyHash)

            // admin:true so e aceito para contas de administrador
            const profileOk = admin !== true || user?.role === 'admin'

            if (!user || !passwordOk || !profileOk) {
                loginGuard.registerFailure(email)
                throw httpError(401, 'E-mail ou senha inválidos')
            }

            loginGuard.registerSuccess(email)

            const accessToken = jwt.sign(
                { role: user.role },
                config.jwtSecret,
                { subject: String(user.id), expiresIn: config.jwtExpiresInSeconds }
            )

            return { access_token: accessToken, type: 'Bearer' }
        },

        profile({ id, name, email, role }) {
            return { id, name, email, role }
        }
    }
}
