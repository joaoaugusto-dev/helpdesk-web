import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { ConfirmDialog } from "../components/ConfirmDialog"
import { Panel } from "../components/Panel"
import { Segmented } from "../components/Segmented"
import { PriorityBadge, PriorityBars, StatusBadge } from "../components/TicketBadges"
import {
    alertClass, dangerButtonClass, primaryButtonClass
} from "../components/formStyles"
import { statusDot } from "../data/ticketLabels"
import { authService } from "../services/authService"
import { ticketService } from "../services/ticketService"
import type { Ticket, TicketPriority, TicketStatus } from "../types/Ticket"

function BackLink(){

    return (
        <Link to="/chamados"
            className="inline-flex items-center gap-1 rounded text-sm font-medium text-muted
                transition-colors hover:text-ink">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
            </svg>
            Voltar para chamados
        </Link>
    )

}

// mesmo ponto colorido do card e do filtro da lista
function StatusDot({ status } : { status: TicketStatus }){

    return <span className={`size-2 rounded-full ${statusDot[status]}`} aria-hidden="true" />

}

function DetailsSkeleton(){

    return (
        <div className="mt-6 animate-pulse rounded-2xl border border-line bg-surface p-8" role="status"
            aria-label="Carregando chamado">
            <div className="h-8 w-1/2 rounded bg-line" />
            <div className="mt-5 h-5 w-3/4 rounded bg-line-soft" />
            <div className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
                <div className="h-10 w-32 rounded bg-line-soft" />
                <div className="h-10 w-32 rounded bg-line-soft" />
            </div>
        </div>
    )

}

export function TicketDetailsPage(){

    const {id} = useParams()
    const navigate = useNavigate()
    const isAdmin = authService.isAdmin()

    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [ownerName, setOwnerName] = useState<string>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // acoes do admin
    const [saving, setSaving] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)
    const [confirmingDelete, setConfirmingDelete] = useState(false)

    useEffect(() => {
        async function load(){
            try{
                const found = await ticketService.getById(Number(id))

                setTicket(found)

                if(found && isAdmin){
                    const owners = await ticketService.getOwnerNames().catch(() => ({} as Record<number, string>))

                    setOwnerName(owners[found.ownerId])
                }
            } catch (error) {
                setError(error instanceof Error ? error.message : "Não foi possível carregar o chamado")
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [id, isAdmin])

    // aplica na tela na hora e desfaz se a API recusar (o PUT envia o chamado completo)
    async function change(patch: Partial<Pick<Ticket, "status" | "priority">>){

        if(!ticket || saving){
            return
        }

        const previous = ticket

        setTicket({ ...ticket, ...patch })
        setSaving(true)
        setActionError(null)

        try{
            await ticketService.update({ ...ticket, ...patch })
        } catch (error) {
            setTicket(previous)
            setActionError(error instanceof Error ? error.message : "Não foi possível salvar a alteração.")
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(){

        if(!ticket || saving){
            return
        }

        setSaving(true)
        setActionError(null)

        try{
            await ticketService.remove(ticket.id)

            navigate("/chamados", { state: { notice: "Chamado excluído." } })
        } catch (error) {
            setActionError(error instanceof Error ? error.message : "Não foi possível excluir o chamado.")
            setConfirmingDelete(false)
            setSaving(false)
        }
    }

    if(loading){
        return (
            <div>
                <BackLink />
                <DetailsSkeleton />
            </div>
        )
    }

    if(error){
        return (
            <div>
                <BackLink />
                <div role="alert" className={`${alertClass} mt-6`}>{error}</div>
            </div>
        )
    }

    if(!ticket) {
        return(
            <div className="animate-enter rounded-2xl border border-line bg-surface px-6 py-16 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Chamado não encontrado
                </h1>

                <p className="mt-2 text-muted">
                    Esse chamado não existe ou não é seu.
                </p>

                <Link to="/chamados" className={`${primaryButtonClass} mt-6`}>
                    Ver todos os chamados
                </Link>
            </div>
        )
    }

    return(

        <div>

            <BackLink />

            <article className="mt-6 animate-enter rounded-2xl border border-line bg-surface p-6 sm:p-8">

                <div className="flex items-start justify-between gap-4">
                    <h1 className="min-w-0 break-words text-3xl font-semibold tracking-tight text-ink">
                        {ticket.title}
                    </h1>

                    <span className="shrink-0 pt-2 text-subtle">#{ticket.id}</span>
                </div>

                <p className="mt-4 max-w-prose break-words text-lg leading-relaxed text-muted">
                    {ticket.description}
                </p>

                {ownerName && (
                    <p className="mt-4 text-sm text-subtle">Aberto por <span className="font-medium text-muted">{ownerName}</span></p>
                )}

                <dl className="mt-8 flex items-start justify-between gap-6 border-t border-line pt-6">
                    <div>
                        <dt className="mb-2 text-sm text-muted">Status</dt>
                        <dd><StatusBadge status={ticket.status} /></dd>
                    </div>

                    <div className="text-right">
                        <dt className="mb-2 text-sm text-muted">Prioridade</dt>
                        <dd className="flex justify-end"><PriorityBadge priority={ticket.priority} /></dd>
                    </div>
                </dl>

            </article>

            <ConfirmDialog
                open={confirmingDelete}
                title="Excluir este chamado?"
                confirmLabel="Excluir chamado"
                busyLabel="Excluindo..."
                busy={saving}
                onConfirm={handleDelete}
                onCancel={() => setConfirmingDelete(false)}
            >
                <p>
                    <strong className="font-medium text-ink">{ticket.title}</strong> será removido da fila.
                    Essa ação não pode ser desfeita.
                </p>
            </ConfirmDialog>

                <Panel title={isAdmin ? "Gerenciar chamado" : "Seu chamado"} className="mt-6 animate-enter" style={{ animationDelay: "60ms" }}>

                    <div className={`grid gap-6 ${isAdmin ? "sm:grid-cols-2" : ""}`}>

                        {isAdmin && <Segmented<TicketStatus>
                            legend="Status"
                            legendClassName="mb-2 block text-sm font-medium"
                            name="status"
                            value={ticket.status}
                            onChange={(status) => change({ status })}
                            options={[
                                { value: "Aberto", label: "Aberto", icon: <StatusDot status="Aberto" /> },
                                { value: "Em andamento", label: "Andamento", icon: <StatusDot status="Em andamento" /> },
                                { value: "Concluido", label: "Concluído", icon: <StatusDot status="Concluido" /> },
                            ]}
                        />}

                        <Segmented<TicketPriority>
                            legend="Prioridade"
                            legendClassName="mb-2 block text-sm font-medium"
                            name="priority"
                            value={ticket.priority}
                            onChange={(priority) => change({ priority })}
                            options={[
                                { value: "Baixa", label: "Baixa", icon: <PriorityBars priority="Baixa" /> },
                                { value: "Media", label: "Média", icon: <PriorityBars priority="Media" /> },
                                { value: "Alta", label: "Alta", icon: <PriorityBars priority="Alta" /> },
                            ]}
                        />

                    </div>

                    {actionError && (
                        <div role="alert" className={`${alertClass} mt-6 animate-enter`}>
                            {actionError}
                        </div>
                    )}

                    <div className="mt-8 border-t border-line pt-6">

                        <button onClick={() => setConfirmingDelete(true)} className={`${dangerButtonClass} w-full`}>
                            Excluir chamado
                        </button>

                    </div>

                </Panel>

        </div>

    )

}
