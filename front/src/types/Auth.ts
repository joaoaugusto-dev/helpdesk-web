export type UserRole = "usuario" | "admin"

export type AuthUser = {
    id: number
    name: string
    email: string
    role: UserRole
}

export type LoginInput = {
    email: string
    password: string
    admin: boolean
}

export type LoginResponse = {
    access_token: string
    type: string
}
