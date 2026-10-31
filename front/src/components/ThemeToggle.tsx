import { useState, type MouseEvent } from "react"
import { flushSync } from "react-dom"

const isDark = () => document.documentElement.classList.contains("dark")

// alterna claro/escuro: grava a escolha e troca a classe no <html> (o script do index.html aplica antes da pintura)
export function ThemeToggle({ onDark = false } : { onDark?: boolean }){

    const [dark, setDark] = useState(isDark)

    function toggle(event: MouseEvent<HTMLButtonElement>){
        const next = !dark
        const root = document.documentElement

        try{
            localStorage.setItem("theme", next ? "dark" : "light")
        } catch {
            // modo privado: o tema vale so para esta sessao
        }

        // classe no <html> e estado do icone mudam juntos, dentro do mesmo "quadro" da transicao
        const apply = () => {
            root.classList.toggle("dark", next)
            flushSync(() => setDark(next))
        }

        if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
            apply()
            return
        }

        // sem View Transitions (ex.: Firefox): as cores do app inteiro fazem uma transicao suave
        if(!("startViewTransition" in document)){
            root.classList.add("theme-fade")
            apply()
            setTimeout(() => root.classList.remove("theme-fade"), 600)
            return
        }

        // o tema novo se expande em circulo a partir do botao ate cobrir a tela
        const { left, top, width, height } = event.currentTarget.getBoundingClientRect()
        const x = left + width / 2
        const y = top + height / 2
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

        document.startViewTransition(apply).ready.then(() => {
            root.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                { duration: 700, easing: "cubic-bezier(0.23, 1, 0.32, 1)", pseudoElement: "::view-transition-new(root)" }
            )
        })
    }

    // sol e lua ocupam o mesmo lugar: o que sai gira e some, o que entra gira e aparece
    const icon = "absolute transition-[opacity,rotate,scale] duration-300 ease-out"

    return (
        <button
            type="button"
            onClick={toggle}
            role="switch"
            aria-checked={dark}
            aria-label="Modo escuro"
            className={`relative grid size-9 shrink-0 place-items-center rounded-xl border transition-[background-color,scale] duration-160 active:scale-[0.92]
                ${onDark
                    ? "border-white/15 bg-white/10 text-slate-200 hover:bg-white/15"
                    : "border-line-strong bg-surface text-ink-2 hover:bg-ink/5"}`}
        >
            <svg viewBox="0 0 24 24" className={`${icon} size-[18px] ${dark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            <svg viewBox="0 0 24 24" className={`${icon} size-[18px] ${dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"}`}
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
        </button>
    )

}
