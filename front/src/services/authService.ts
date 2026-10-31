import type { AuthUser, LoginInput, LoginResponse } from "../types/Auth"

const API_URL = import.meta.env.VITE_API_URL

const TOKEN_KEY = "access_token"
const USER_KEY = "auth_user"

// le o "exp" (segundos) do payload do JWT; token ilegivel conta como vencido
function isExpired(token: string){
    try{
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))

        return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()
    } catch {
        return true
    }
}

// devolve null (e limpa a sessao) quando o token venceu: assim as rotas protegidas reagem sozinhas
export function getToken(){
    const token = localStorage.getItem(TOKEN_KEY)

    if(token && isExpired(token)){
        logout()
        return null
    }

    return token
}

export function isAdmin(){
    return getUser()?.role === "admin"
}

export function getUser() : AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)

    if(!raw){
        return null
    }

    try{
        return JSON.parse(raw) as AuthUser
    } catch {
        return null
    }
}

export function logout(){
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

export async function login({email, password, admin} : LoginInput) : Promise<AuthUser>{

    const response = await fetch(
        `${API_URL}/auth`,
        {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            // admin: true so e aceito para contas de administrador
            body: JSON.stringify({ email, password, ...(admin && { admin: true }) })
        }
    )

    if(response.status === 401){
        throw new Error("E-mail ou senha incorretos.")
    }

    // 5 senhas erradas bloqueiam o e-mail por alguns minutos
    if(response.status === 429){
        throw new Error("Muitas tentativas. Tente novamente em alguns minutos.")
    }

    if(!response.ok){
        throw new Error(`Erro ao entrar: ${response.status}`)
    }

    const { access_token }: LoginResponse = await response.json()

    const meResponse = await fetch(
        `${API_URL}/me`,
        { headers: { "Authorization" : `Bearer ${access_token}` } }
    )

    if(!meResponse.ok){
        throw new Error(`Erro ao carregar o perfil: ${meResponse.status}`)
    }

    const user: AuthUser = await meResponse.json()

    localStorage.setItem(TOKEN_KEY, access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))

    return user

}

export const authService = {
    login,
    logout,
    getToken,
    getUser,
    isAdmin
}
