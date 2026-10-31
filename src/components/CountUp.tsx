import { useEffect, useState } from "react"

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

// numero que sobe ate o valor junto com a barra que cresce (ease-out cubico, igual a curva do projeto)
export function CountUp({ value, duration = 500 } : { value: number, duration?: number }){

    const [current, setCurrent] = useState(0)

    useEffect(() => {
        if(reduceMotion()){
            return
        }

        const start = performance.now()
        let frame = requestAnimationFrame(function tick(now){
            const t = Math.min(1, (now - start) / duration)

            setCurrent(Math.round(value * (1 - (1 - t) ** 3)))

            if(t < 1){
                frame = requestAnimationFrame(tick)
            }
        })

        return () => cancelAnimationFrame(frame)
    }, [value, duration])

    return <>{reduceMotion() ? value : current}</>

}
