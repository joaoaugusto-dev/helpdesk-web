import { useRef, useState, type SyntheticEvent } from "react"
import { Navigate, useLocation, useNavigate } from "react-router"

import { BrandMark } from "../components/BrandMark"
import { LoginShowcase } from "../components/LoginShowcase"
import { Segmented } from "../components/Segmented"
import { inputClass, labelClass } from "../components/formStyles"
import { PasswordField } from "../components/PasswordField"
import { ThemeToggle } from "../components/ThemeToggle"
import { authService } from "../services/authService"

type Status = "idle" | "loading" | "success"

// contas do README da API (somente ambiente local de desenvolvimento)
const testAccounts = {
    usuario: { email: "usuario@helpdesk.local", password: "Usuario@123" },
    admin: { email: "admin@helpdesk.local", password: "Admin@123" },
}

export function LoginPage(){

    const navigate = useNavigate()
    const location = useLocation()
    const destination: string = location.state?.from?.pathname ?? "/"

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [admin, setAdmin] = useState(false)

    const [status, setStatus] = useState<Status>("idle")
    const [error, setError] = useState<string | null>(null)
    const formRef = useRef<HTMLFormElement>(null)

    // so redireciona quem ja chegou logado; durante o login a animacao de sucesso precisa terminar
    if(status === "idle" && authService.getToken()){
        return <Navigate to={destination} replace />
    }

    function fail(message: string){
        setError(message)
        setStatus("idle")

        // WAAPI: treme sem remontar o form, entao o foco do teclado nao se perde
        if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
            formRef.current?.animate(
                [
                    { transform: "translateX(0)" },
                    { transform: "translateX(-8px)" },
                    { transform: "translateX(7px)" },
                    { transform: "translateX(-4px)" },
                    { transform: "translateX(2px)" },
                    { transform: "translateX(0)" },
                ],
                { duration: 420, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
            )
        }
    }

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>){
        event.preventDefault()

        if(status !== "idle"){
            return
        }

        if(!email.trim() || !password){
            fail("Informe e-mail e senha para entrar.")
            return
        }

        setError(null)
        setStatus("loading")

        try{

            await authService.login({ email: email.trim(), password, admin })

            setStatus("success")
            // deixa o check de sucesso aparecer antes de trocar de pagina
            setTimeout(() => navigate(destination, { replace: true }), 550)

        } catch(error) {

            fail(
                error instanceof TypeError
                    ? "Não foi possível conectar à API. Confira se ela está rodando."
                    : error instanceof Error
                        ? error.message
                        : "Não foi possível entrar."
            )

        }
    }

    function fillTestAccount(){
        const account = admin ? testAccounts.admin : testAccounts.usuario

        setEmail(account.email)
        setPassword(account.password)
        setError(null)
    }

    const busy = status !== "idle"
    const emailInvalid = error !== null && !email.trim()
    const passwordInvalid = error !== null && (!password || error.startsWith("E-mail ou senha"))

    return (
        <div className="grid min-h-screen bg-page font-sans text-ink lg:grid-cols-[1.1fr_1fr]">

            <LoginShowcase />

            <main className="relative isolate flex items-start overflow-hidden px-6 py-12 sm:px-12 lg:pt-[22vh]">
                <div className="absolute right-6 top-6"><ThemeToggle /></div>


                <div className="mx-auto w-full max-w-sm animate-rise">

                    <div className="mb-10 flex items-center gap-3 lg:hidden">
                        <BrandMark />
                        <span className="text-lg font-semibold tracking-tight">HelpDesk Lite</span>
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>

                    <p className="mt-2 text-muted">
                        Use a conta que você recebeu da sua equipe.
                    </p>

                    <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        noValidate
                        className="mt-8 space-y-5"
                    >

                        <Segmented
                            legend="Tipo de acesso"
                            name="role"
                            value={admin}
                            onChange={setAdmin}
                            options={[
                                { value: false, label: "Usuário" },
                                { value: true, label: "Administrador" },
                            ]}
                        />

                        <div>
                            <label htmlFor="email" className={labelClass}>
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="username"
                                autoFocus
                                placeholder="voce@empresa.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                aria-invalid={emailInvalid}
                                aria-describedby={error ? "login-error" : undefined}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className={labelClass}>
                                Senha
                            </label>

                            <PasswordField
                                id="password"
                                value={password}
                                onChange={setPassword}
                                invalid={passwordInvalid}
                                describedBy={error ? "login-error" : undefined}
                                className={inputClass}
                            />

                        </div>

                        {error && (
                            <p
                                id="login-error"
                                role="alert"
                                className="animate-rise rounded-xl border border-red-200 bg-red-50
                                    px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            aria-disabled={busy}
                            className={`relative flex h-12 w-full items-center justify-center gap-2 rounded-xl
                                font-medium text-white transition-[background-color,scale] duration-160
                                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600
                                active:scale-[0.97]
                                ${status === "success" ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-700"}
                                aria-disabled:cursor-default`}
                        >
                            {status === "loading" && (
                                <>
                                    <svg className="size-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                                        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                    Entrando...
                                </>
                            )}

                            {status === "success" && (
                                <>
                                    <svg className="size-5 animate-pop" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="m5 12.5 4.5 4.5L19 7.5" />
                                    </svg>
                                    Tudo certo
                                </>
                            )}

                            {status === "idle" && "Entrar"}
                        </button>

                    </form>

                    {import.meta.env.DEV && (
                        <button
                            type="button"
                            onClick={fillTestAccount}
                            className="mt-6 text-sm text-muted underline-offset-4 transition-colors
                                hover:text-blue-600 dark:hover:text-blue-400 hover:underline
                                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            Preencher com a conta de teste
                        </button>
                    )}

                </div>

            </main>

        </div>
    )

}
