import { httpError } from '../../shared/errors.js'
import { parseTicketFilters, validateTicketBody } from './tickets.validation.js'

export function createTicketsService({ db }) {
    // Administrador enxerga tudo; usuario so enxerga os chamados que abriu.
    // Chamados de outras pessoas respondem 404, como se nao existissem.
    const canSee = (user, ticket) => user.role === 'admin' || ticket.ownerId === user.id

    function findVisible(user, id) {
        const ticket = db.tickets.find((t) => t.id === Number(id))

        if (!ticket || !canSee(user, ticket)) {
            throw httpError(404, 'Chamado não encontrado')
        }

        return ticket
    }

    function assertValid(body, options) {
        const errors = validateTicketBody(body, options)

        if (errors.length) {
            throw httpError(400, errors.join('; '))
        }
    }

    return {
        list(user, query) {
            const { status, priority } = parseTicketFilters(query)

            return db.tickets.filter((t) =>
                canSee(user, t)
                && (!status || status.includes(t.status))
                && (!priority || priority.includes(t.priority))
            )
        },

        get(user, id) {
            return findVisible(user, id)
        },

        create(user, body) {
            assertValid(body, { partial: false })

            const ticket = {
                id: db.nextId(db.tickets),
                title: body.title.trim(),
                description: body.description.trim(),
                // Usuario comum sempre abre o chamado como "Aberto"; so o admin escolhe o status
                status: user.role === 'admin' && body.status ? body.status : 'Aberto',
                priority: body.priority,
                ownerId: user.id
            }

            db.tickets.push(ticket)
            db.save()

            return ticket
        },

        // PUT exige o chamado completo; PATCH aceita campos parciais
        update(user, id, body, { partial }) {
            const ticket = findVisible(user, id)

            assertValid(body, { partial })

            const isAdmin = user.role === 'admin'

            if (!isAdmin && body.status !== undefined && body.status !== ticket.status) {
                throw httpError(403, 'Apenas administradores alteram o status')
            }

            for (const field of ['title', 'description']) {
                if (body[field] !== undefined) {
                    ticket[field] = body[field].trim()
                }
            }

            if (body.priority !== undefined) {
                ticket.priority = body.priority
            }

            if (isAdmin && body.status !== undefined) {
                ticket.status = body.status
            }

            db.save()

            return ticket
        },

        // Usuario exclui os proprios chamados; administrador exclui qualquer um
        remove(user, id) {
            const ticket = findVisible(user, id)

            db.tickets.splice(db.tickets.indexOf(ticket), 1)
            db.save()

            return ticket
        }
    }
}
