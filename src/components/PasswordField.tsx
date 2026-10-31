import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { PasswordEye } from "./PasswordEye"

type PasswordFieldProps = {
    id: string
    value: string
    onChange: (value: string) => void
    invalid?: boolean
    describedBy?: string
    // classes visuais do input, compartilhadas com os outros campos do formulario
    className: string
}

const STAGGER_MS = 45
const MAX_STAGGER_TOTAL_MS = 600
const DURATION_MS = 300

/*
 * O <input> nativo continua sendo a fonte da verdade (foco, caret, selecao, gerenciador de senhas).
 * Enquanto a senha esta visivel ou animando, o texto dele fica transparente e uma camada por cima
 * troca "•" por letra, caractere a caractere, com atraso crescente.
 *
 * A fonte e monoespacada de proposito: assim "•" e a letra ocupam a mesma largura, a camada fica
 * alinhada com o caret e nao ha "salto" quando o input volta a ser type="password".
 */
export function PasswordField({ id, value, onChange, invalid, describedBy, className } : PasswordFieldProps){

    const [revealed, setRevealed] = useState(false)
    const [animating, setAnimating] = useState(false)
    const [capsLock, setCapsLock] = useState(false)

    const inputRef = useRef<HTMLInputElement>(null)
    const trackRef = useRef<HTMLSpanElement>(null)
    const timer = useRef<number | undefined>(undefined)

    const overlayActive = revealed || animating
    const step = Math.min(STAGGER_MS, MAX_STAGGER_TOTAL_MS / Math.max(value.length, 1))

    function syncScroll(){
        // campos longos rolam na horizontal: a camada acompanha
        if(inputRef.current && trackRef.current){
            trackRef.current.style.transform = `translateX(${-inputRef.current.scrollLeft}px)`
        }
    }

    useEffect(syncScroll, [value, overlayActive])

    useEffect(() => () => window.clearTimeout(timer.current), [])

    function toggle(){
        setRevealed((current) => !current)
        setAnimating(true)

        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(
            () => setAnimating(false),
            value.length * step + DURATION_MS + 50
        )
    }

    function handleKey(event: KeyboardEvent<HTMLInputElement>){
        setCapsLock(event.getModifierState("CapsLock"))
    }

    const transition = `transition-[opacity,scale,translate,filter] duration-300 ease-out`

    return (
        <div className="relative">

            <input
                ref={inputRef}
                id={id}
                type={overlayActive ? "text" : "password"}
                autoComplete="current-password"
                spellCheck={false}
                placeholder="Sua senha"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={handleKey}
                onKeyUp={handleKey}
                onBlur={() => setCapsLock(false)}
                onScroll={syncScroll}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={`${className} font-mono text-base placeholder:font-sans
                    ${capsLock ? "pr-36" : "pr-14"}
                    ${overlayActive ? "pw-overlay-on text-transparent! caret-ink" : ""}`}
            />

            {/* camada animada: so visual (aria-hidden), o leitor de tela le o input.
                Fica sempre montada: os caracteres precisam existir no estado "ponto" antes da troca
                para a transicao rodar (se montasse ja revelada, nao haveria o que animar). */}
            <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 left-[17px] right-14
                    flex items-center overflow-hidden font-mono text-base text-ink
                    ${overlayActive ? "" : "invisible"}`}
            >
                <span ref={trackRef} className="whitespace-pre">
                    {[...value].map((char, index) => {
                        const delay = { transitionDelay: `${index * step}ms` }

                        return (
                            // mesma celula para o ponto e a letra: a largura vem da letra monoespacada
                            <span key={index} className="inline-grid">
                                {/* circulo CSS em vez do glifo "•": o bullet da fonte e bem menor que o ponto nativo do input */}
                                <span
                                    style={delay}
                                    className={`col-start-1 row-start-1 size-1 -translate-y-0.5 place-self-center rounded-full bg-ink
                                        ${transition}
                                        ${revealed ? "scale-50 opacity-0" : "scale-100 opacity-100"}`}
                                />
                                <span
                                    style={delay}
                                    className={`col-start-1 row-start-1 ${transition}
                                        ${revealed
                                            ? "translate-y-0 opacity-100 blur-0"
                                            : "translate-y-1 opacity-0 blur-[3px]"}`}
                                >
                                    {char}
                                </span>
                            </span>
                        )
                    })}
                </span>
            </span>

            {/* selo sobreposto ao campo: nao ocupa espaco, entao o layout nao se mexe quando o campo perde o foco */}
            <span aria-live="polite" className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2">
                {capsLock && (
                    <span className="animate-pop block rounded-lg bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-400/20 dark:text-amber-200">
                        Caps Lock ativado
                    </span>
                )}
            </span>

            <div className="absolute inset-y-1 right-1 grid place-items-center">
                <PasswordEye revealed={revealed} onToggle={toggle} controls={id} />
            </div>

        </div>
    )

}
