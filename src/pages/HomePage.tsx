import { useEffect, useState } from "react"
import { Link } from "react-router"

import { CountUp } from "../components/CountUp"
import { Header } from "../components/Header"
import { Panel } from "../components/Panel"
import { alertClass, primaryButtonClass, secondaryButtonClass } from "../components/formStyles"
import { statusDot, statusLabel } from "../data/ticketLabels"
import { authService } from "../services/authService"
import { ticketService } from "../services/ticketService"
import type { Ticket, TicketStatus } from "../types/Ticket"

const statuses: TicketStatus[] = ["Aberto", "Em andamento", "Concluido"]

const roleLabel = { usuario: "Usuário", admin: "Administrador" }

export function HomePage(){

    const user = authService.getUser()

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load(){
            try{
                setTickets(await ticketService.getAll())
            } catch {
                setError("Não foi possível carregar a fila de chamados")
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    return (
        <>
            <Header
                title={user ? `Olá, ${user.name.split(" ")[0]}` : "HelpDesk Lite"}
                subtitle="Veja como está a fila de chamados hoje."
                action={
                    authService.isAdmin()
                        ? <Link to="/chamado/novo" className={primaryButtonClass}>Novo chamado</Link>
                        : <Link to="/chamados" className={secondaryButtonClass}>Ver chamados</Link>
                }
            />

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">

                <Panel title="Fila por status" className="animate-enter">

                    {error && (
                        <p role="alert" className={alertClass}>{error}</p>
                    )}

                    {loading && (
                        <div className="animate-pulse space-y-6" role="status" aria-label="Carregando a fila">
                            {statuses.map((status) => (
                                <div key={status}>
                                    <div className="h-4 w-1/3 rounded bg-line" />
                                    <div className="mt-3 h-1.5 rounded-full bg-line-soft" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <ul className="space-y-6">
                                {statuses.map((status, index) => {

                                    const count = tickets.filter((ticket) => ticket.status === status).length
                                    const share = tickets.length ? (count / tickets.length) * 100 : 0

                                    return (
                                        <li key={status}>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <span className={`size-2 rounded-full ${statusDot[status]}`} aria-hidden="true" />
                                                    {statusLabel[status]}
                                                </span>
                                                <span className="font-semibold tabular-nums"><CountUp value={count} /></span>
                                            </div>

                                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line-soft">
                                                {/* a barra cresce uma vez, quando os dados chegam; scaleX = so transform, sem layout */}
                                                <div
                                                    className={`h-full origin-left animate-grow rounded-full ${statusDot[status]}`}
                                                    style={{ width: `${share}%`, animationDelay: `${index * 60}ms` }}
                                                />
                                            </div>
                                        </li>
                                    )

                                })}
                            </ul>

                            <div className="mt-8 flex items-center justify-between border-t border-line pt-5 text-sm">
                                <span className="text-muted">
                                    {tickets.length} {tickets.length === 1 ? "chamado" : "chamados"} no total
                                </span>

                                <Link to="/chamados"
                                    className="rounded font-medium text-blue-600 dark:text-blue-400 underline-offset-4 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">
                                    Ver todos os chamados
                                </Link>
                            </div>
                        </>
                    )}

                </Panel>

                {user && (
                    <Panel title="Sua conta" className="animate-enter" style={{ animationDelay: "60ms" }}>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-muted">Nome</dt>
                                <dd className="mt-1 break-words font-medium">{user.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted">E-mail</dt>
                                <dd className="mt-1 break-all font-medium">{user.email}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted">Perfil</dt>
                                <dd className="mt-1 font-medium">{roleLabel[user.role]}</dd>
                            </div>
                        </dl>
                    </Panel>
                )}

            </div>
        </>
    )

}
