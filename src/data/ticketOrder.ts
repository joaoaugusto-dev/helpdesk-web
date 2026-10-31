import type { Ticket, TicketStatus } from "../types/Ticket"
import { priorityLevel } from "./ticketLabels"

const statusRank: Record<TicketStatus, number> = {
    "Aberto": 0,
    "Em andamento": 1,
    "Concluido": 2,
}

// fila: primeiro por status (aberto > em andamento > concluido) e, dentro dele, por prioridade (alta > media > baixa).
// Empate desempata pelo id, para a ordem nunca mudar de lugar entre recargas.
export function compareTickets(a: Ticket, b: Ticket){

    return statusRank[a.status] - statusRank[b.status]
        || priorityLevel[b.priority] - priorityLevel[a.priority]
        || a.id - b.id

}
