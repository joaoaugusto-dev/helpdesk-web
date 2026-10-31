export type TicketStatus = 
    | "Aberto"
    | "Em andamento"
    | "Concluido"

export type TicketPriority =
    | "Baixa"
    | "Media"
    | "Alta"

export type TicketFilter = 
    | "Todos"
    | TicketStatus

export type TicketPriorityFilter =
    | "Todas"
    | TicketPriority

export type Ticket = {
    id: number
    title: string
    description: string
    status: TicketStatus
    priority: TicketPriority
}

export type CreateTicketInput = {
    title: string
    description: string
    status: TicketStatus
    priority: TicketPriority
}