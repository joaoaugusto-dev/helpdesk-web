import { getToken, logout } from "./authService"

const API_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
    status: number

    constructor(status: number, message: string){
        super(message)
        this.status = status
    }
}

// cliente HTTP unico da aplicacao: monta o header com o JWT e traduz as respostas da API em erros
export async function apiRequest<T>(path: string, init: RequestInit = {}) : Promise<T>{

    const token = getToken()

    const response = await fetch(
        `${API_URL}${path}`,
        {
            ...init,
            headers: {
                "Content-Type" : "application/json",
                ...(token && { "Authorization" : `Bearer ${token}` })
            }
        }
    )

    // 401 = token ausente, vencido ou invalido: a sessao acabou
    if(response.status === 401){
        logout()
        window.location.assign("/login")
        throw new ApiError(401, "Sua sessão expirou. Entre novamente.")
    }

    if(response.status === 403){
        throw new ApiError(403, "Você não tem permissão para esta ação.")
    }

    if(!response.ok){
        throw new ApiError(response.status, `Erro na API: ${response.status}`)
    }

    return response.json() as Promise<T>

}
