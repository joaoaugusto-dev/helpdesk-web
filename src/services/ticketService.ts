import type { CreateTicketInput, Ticket } from "../types/Ticket";
import { apiRequest } from "./api"

export function getAll() : Promise<Ticket[]>{

    return apiRequest<Ticket[]>("/tickets")

}

// o JRS responde 200 com {} quando o id nao existe (nao 404): isso vira null aqui
export async function getById(id: number) : Promise<Ticket | null>{

    const ticket = await apiRequest<Partial<Ticket>>(`/tickets/${id}`)

    return ticket.id === undefined ? null : ticket as Ticket

}

// somente admin (enableAdm): usuario comum recebe 403
export function create(input: CreateTicketInput) : Promise<Ticket>{

    return apiRequest<Ticket>(
        "/tickets",
        { method: "POST", body: JSON.stringify(input) }
    )

}

// PUT substitui o registro inteiro, entao sempre vai o chamado completo
export function update(ticket: Ticket) : Promise<Ticket>{

    return apiRequest<Ticket>(
        `/tickets/${ticket.id}`,
        { method: "PUT", body: JSON.stringify(ticket) }
    )

}

export function remove(id: number) : Promise<Ticket>{

    return apiRequest<Ticket>(
        `/tickets/${id}`,
        { method: "DELETE" }
    )

}

export const ticketService = {
    getAll,
    getById,
    create,
    update,
    remove
}
