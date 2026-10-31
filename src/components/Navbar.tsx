import { useLayoutEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'

import { authService } from '../services/authService'
import { BrandMark } from './BrandMark'
import { ThemeToggle } from './ThemeToggle'

const links = [
    { to: "/", label: "Início", end: true, adminOnly: false },
    { to: "/chamados", label: "Chamados", end: false, adminOnly: false },
    { to: "/chamado/novo", label: "Novo chamado", end: false, adminOnly: true },
]

const itemClass = "whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium"

export function Navbar(){

    const navigate = useNavigate()
    const { pathname } = useLocation()
    const user = authService.getUser()
    const visibleLinks = links.filter((link) => !link.adminOnly || authService.isAdmin())

    const navRef = useRef<HTMLElement>(null)
    const highlightRef = useRef<HTMLDivElement>(null)

    function handleLogout(){
        authService.logout()
        navigate("/login", { replace: true })
    }

    /*
     * Indicador da aba ativa (receita "tab indicator"): uma copia da lista, estilizada como ativa,
     * recortada com clip-path para mostrar so o item atual. Ao trocar de rota o recorte desliza,
     * e texto e fundo mudam juntos porque e um unico elemento sendo revelado.
     * Mexe direto no DOM (sem state): nao precisa re-renderizar o menu.
     */
    useLayoutEffect(() => {
        const nav = navRef.current
        const highlight = highlightRef.current

        if(!nav || !highlight){
            return
        }

        function place(){
            const active = nav!.querySelector<HTMLElement>('a[aria-current="page"]')

            if(!active){
                // rota fora do menu (ex.: detalhe de um chamado): o recorte some sem se mover
                highlight!.style.opacity = "0"
                return
            }

            const left = active.offsetLeft - highlight!.offsetLeft
            const right = highlight!.offsetWidth - left - active.offsetWidth

            highlight!.style.clipPath = `inset(0 ${right}px 0 ${left}px round 12px)`
            highlight!.style.opacity = "1"
        }

        place()

        // so depois da primeira posicao as transicoes ligam (senao o recorte "voa" do zero ao montar)
        const frame = requestAnimationFrame(() => highlight.setAttribute("data-ready", ""))

        // fontes carregando ou janela mudando de tamanho mexem nas larguras
        const observer = new ResizeObserver(place)
        observer.observe(nav)

        return () => {
            cancelAnimationFrame(frame)
            observer.disconnect()
        }
    }, [pathname, visibleLinks.length])

    return (
        <header className='bg-slate-900 text-white sm:sticky sm:top-0 sm:z-20'>

            {/* no celular os links descem para uma segunda linha com rolagem horizontal */}
            <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-between
                gap-x-6 gap-y-3 px-6 py-3'>

                <Link to="/" className='flex items-center gap-3 rounded-xl'>
                    <BrandMark className='size-8' />
                    <span className='text-lg font-semibold tracking-tight'>
                        HelpDesk Lite
                    </span>
                </Link>

                <nav ref={navRef} aria-label="Principal"
                    className='relative order-last -mx-2 w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:order-none sm:mx-0 sm:w-auto'>

                    <div className='flex gap-1'>
                        {visibleLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                className={`${itemClass} text-slate-300 transition-colors duration-150 hover:text-white`}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* copia "ativa" por cima, so visual: nao captura clique nem aparece para leitor de tela */}
                    <div
                        ref={highlightRef}
                        aria-hidden="true"
                        className='pointer-events-none absolute left-0 top-0 flex w-max gap-1 opacity-0
                            data-[ready]:transition-[clip-path,opacity] data-[ready]:duration-250
                            data-[ready]:ease-in-out'
                    >
                        {visibleLinks.map((link) => (
                            <span key={link.to} className={`${itemClass} bg-slate-800 text-white`}>
                                {link.label}
                            </span>
                        ))}
                    </div>

                </nav>

                <div className='flex items-center gap-2 text-sm'>

                    <ThemeToggle onDark />

                    {user && (
                        <span className='hidden max-w-40 truncate text-slate-300 sm:block'>
                            {user.name}
                        </span>
                    )}

                    <button
                        onClick={handleLogout}
                        className='rounded-xl px-3 py-2 font-medium text-slate-300 transition-[color,background-color,scale]
                            duration-160 hover:bg-white/5 hover:text-white active:scale-[0.97]'
                    >
                        Sair
                    </button>

                </div>

            </div>

        </header>
    )

}
