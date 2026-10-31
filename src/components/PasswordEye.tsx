import { useEffect, useId, useRef } from "react"

type PasswordEyeProps = {
    revealed: boolean
    onToggle: () => void
    controls: string
}

const EYE_PATH = "M2 12C5 6.8 8.4 4.8 12 4.8S19 6.8 22 12C19 17.2 15.6 19.2 12 19.2S5 17.2 2 12Z"

// move a pupila (em unidades do viewBox) na direcao do ponto x,y
function aim(button: HTMLElement | null, pupil: SVGGElement | null, x: number, y: number){
    if(!button || !pupil){
        return
    }

    const rect = button.getBoundingClientRect()
    const dx = x - (rect.left + rect.width / 2)
    const dy = y - (rect.top + rect.height / 2)
    const dist = Math.hypot(dx, dy) || 1

    // alcance maximo a partir de 140px de distancia
    const pull = Math.min(1, dist / 140)

    pupil.style.transform = `translate(${(dx / dist) * pull * 3.2}px, ${(dy / dist) * pull * 2}px)`
}

export function PasswordEye({ revealed, onToggle, controls } : PasswordEyeProps){

    const clipId = useId()
    const buttonRef = useRef<HTMLButtonElement>(null)
    const pupilRef = useRef<SVGGElement>(null)

    useEffect(() => {
        if(!revealed){
            return
        }

        function onMove(event: PointerEvent){
            aim(buttonRef.current, pupilRef.current, event.clientX, event.clientY)
        }

        window.addEventListener("pointermove", onMove)

        return () => window.removeEventListener("pointermove", onMove)
    }, [revealed])

    return (
        <button
            ref={buttonRef}
            type="button"
            onClick={(event) => {
                // o olho ja abre olhando para onde o clique aconteceu
                aim(buttonRef.current, pupilRef.current, event.clientX, event.clientY)
                onToggle()
            }}
            aria-label={revealed ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={revealed}
            aria-controls={controls}
            className={`grid size-10 place-items-center rounded-xl
                transition-[color,background-color,scale] duration-200
                hover:bg-line-soft active:scale-90
                focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-blue-600
                ${revealed ? "text-blue-600 dark:text-blue-400" : "text-subtle hover:text-ink"}`}
        >
            <svg
                viewBox="0 0 24 24"
                className="size-7 overflow-visible"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <defs>
                    <clipPath id={clipId}>
                        <path d={EYE_PATH} />
                    </clipPath>
                </defs>

                <path d={EYE_PATH} />

                {/* pupila: a pálpebra a recorta quando o olhar vai para o canto.
                    Dois grupos: o de fora abre/fecha (scale), o de dentro olha (translate) */}
                <g clipPath={`url(#${clipId})`}>
                    <g
                        className={`origin-center [transform-box:fill-box]
                            transition-[scale,opacity] duration-300 ease-out
                            ${revealed ? "scale-100 opacity-100" : "scale-y-[0.08] scale-x-75 opacity-0"}`}
                    >
                        <g ref={pupilRef} className="transition-transform duration-100 ease-out">
                            <circle cx="12" cy="12" r="3" />
                        </g>
                    </g>
                </g>

                {/* barra do eye-slash: e desenhada/apagada */}
                <path
                    d="M4 4L20 20"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset={revealed ? 1 : 0}
                    className={`transition-[stroke-dashoffset] duration-300 ease-out
                        ${revealed ? "delay-0" : "delay-100"}`}
                />
            </svg>
        </button>
    )

}
