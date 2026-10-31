import type { AuthUser } from "../types/Auth"
import type { CreateTicketInput, Ticket } from "../types/Ticket";
import { ApiError, apiRequest } from "./api"

export function getAll() : Promise<Ticket[]>{

    return apiRequest<Ticket[]>("/tickets")

}

// 404 (inexistente ou de outra pessoa) vira null
export async function getById(id: number) : Promise<Ticket | null>{

    try{
        return await apiRequest<Ticket>(`/tickets/${id}`)
    } catch(error){
        if(error instanceof ApiError && error.status === 404){
            return null
        }

        throw error
    }

}

// o dono vem do token: o servidor ignora ownerId e usuario comum sempre abre como "Aberto"
export function create(input: CreateTicketInput) : Promise<Ticket>{

    return apiRequest<Ticket>(
        "/tickets",
        { method: "POST", body: JSON.stringify(input) }
    )

}

// PUT exige o chamado completo; so o admin altera o status
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

// somente admin: id -> nome de quem abriu cada chamado
export async function getOwnerNames() : Promise<Record<number, string>>{

    const users = await apiRequest<AuthUser[]>("/users")

    return Object.fromEntries(users.map((user) => [user.id, user.name]))

}

export const ticketService = {
    getOwnerNames,
    getAll,
    getById,
    create,
    update,
    remove
}
