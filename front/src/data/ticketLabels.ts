import type { TicketPriority, TicketStatus } from "../types/Ticket"

// os valores da API/tipos nao tem acento ("Media", "Concluido"); aqui ficam os textos exibidos

export const statusDot: Record<TicketStatus, string> = {
    "Aberto": "bg-amber-400",
    "Em andamento": "bg-sky-400",
    "Concluido": "bg-emerald-400",
}

export const statusLabel: Record<TicketStatus, string> = {
    "Aberto": "Aberto",
    "Em andamento": "Em andamento",
    "Concluido": "Concluído",
}

// nome curto: usado quando o rotulo "Prioridade" ja aparece acima do valor
export const priorityName: Record<TicketPriority, string> = {
    "Alta": "Alta",
    "Media": "Média",
    "Baixa": "Baixa",
}

export const priorityLabel: Record<TicketPriority, string> = {
    "Alta": "Prioridade alta",
    "Media": "Prioridade média",
    "Baixa": "Prioridade baixa",
}

// nivel 1..3: quantas barras ficam preenchidas no indicador
export const priorityLevel: Record<TicketPriority, number> = {
    "Baixa": 1,
    "Media": 2,
    "Alta": 3,
}
