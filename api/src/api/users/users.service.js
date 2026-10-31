import bcrypt from 'bcryptjs'

import { httpError } from '../../shared/errors.js'

const ROLES = ['usuario', 'admin']
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function publicUser({ id, name, email, role }) {
    return { id, name, email, role }
}

export function createUsersService({ db, config }) {
    return {
        list() {
            return db.users.map(publicUser)
        },

        create({ name, email, password, role = 'usuario' }) {
            const errors = []

            if (typeof name !== 'string' || !name.trim()) {
                errors.push('name é obrigatório')
            }

            if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
                errors.push('email inválido')
            }

            if (typeof password !== 'string' || password.length < 8) {
                errors.push('password deve ter ao menos 8 caracteres')
            }

            if (!ROLES.includes(role)) {
                errors.push(`role deve ser: ${ROLES.join(', ')}`)
            }

            if (errors.length) {
                throw httpError(400, errors.join('; '))
            }

            const normalizedEmail = email.trim().toLowerCase()

            if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
                throw httpError(409, 'Já existe um usuário com este e-mail')
            }

            const user = {
                id: db.nextId(db.users),
                name: name.trim(),
                email: normalizedEmail,
                passwordHash: bcrypt.hashSync(password, config.bcryptRounds),
                role
            }

            db.users.push(user)
            db.save()

            return publicUser(user)
        }
    }
}
