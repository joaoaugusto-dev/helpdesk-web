import { httpError } from '../../shared/errors.js'

export const STATUSES = ['Aberto', 'Em andamento', 'Concluido']
export const PRIORITIES = ['Baixa', 'Media', 'Alta']

// Valida o corpo de POST/PUT (completo) ou PATCH (parcial). Retorna a lista de erros.
export function validateTicketBody(body, { partial }) {
    const errors = []
    const has = (field) => body[field] !== undefined

    for (const field of ['title', 'description']) {
        if (!partial || has(field)) {
            if (typeof body[field] !== 'string' || !body[field].trim()) {
                errors.push(`${field} é obrigatório`)
            }
        }
    }

    if (!partial || has('priority')) {
        if (!PRIORITIES.includes(body.priority)) {
            errors.push(`priority deve ser: ${PRIORITIES.join(', ')}`)
        }
    }

    if (has('status') && !STATUSES.includes(body.status)) {
        errors.push(`status deve ser: ${STATUSES.join(', ')}`)
    }

    return errors
}

// Aceita ?status=Aberto, ?status=Aberto,Concluido ou ?status=Aberto&status=Concluido
function parseList(value, allowed, field) {
    if (value === undefined) {
        return null
    }

    const values = [value].flat().flatMap((v) => String(v).split(',')).map((v) => v.trim()).filter(Boolean)

    const invalid = values.filter((v) => !allowed.includes(v))

    if (!values.length || invalid.length) {
        throw httpError(400, `${field} deve ser: ${allowed.join(', ')}`)
    }

    return values
}

export function parseTicketFilters(query) {
    return {
        status: parseList(query.status, STATUSES, 'status'),
        priority: parseList(query.priority, PRIORITIES, 'priority')
    }
}
