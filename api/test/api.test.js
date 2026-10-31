import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { createApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'

let server
let baseUrl
let dir

before(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'helpdesk-test-'))

    const config = loadConfig({
        databaseFile: path.join(dir, 'database.json'),
        jwtSecret: 'segredo-de-teste',
        bcryptRounds: 4,
        loginMaxAttempts: 3,
        loginLockSeconds: 300
    })

    server = createApp(config).listen(0, '127.0.0.1')
    await new Promise((resolve) => server.once('listening', resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => {
    server.close()
    fs.rmSync(dir, { recursive: true, force: true })
})

async function call(method, url, { token, body } = {}) {
    const response = await fetch(baseUrl + url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined
    })

    const text = await response.text()

    return { status: response.status, body: text ? JSON.parse(text) : null }
}

async function login(email, password) {
    const { status, body } = await call('POST', '/auth', { body: { email, password } })
    assert.equal(status, 200)
    return body.access_token
}

const newTicket = { title: 'Impressora', description: 'Não imprime', priority: 'Alta' }

describe('autenticação', () => {
    test('login válido retorna token e /me identifica o usuário', async () => {
        const token = await login('usuario@helpdesk.local', 'Usuario@123')
        const me = await call('GET', '/me', { token })

        assert.equal(me.status, 200)
        assert.equal(me.body.role, 'usuario')
        assert.equal(me.body.passwordHash, undefined)
    })

    test('aceita admin:true somente para administradores', async () => {
        const admin = await call('POST', '/auth', {
            body: { email: 'admin@helpdesk.local', password: 'Admin@123', admin: true }
        })
        const user = await call('POST', '/auth', {
            body: { email: 'usuario@helpdesk.local', password: 'Usuario@123', admin: true }
        })

        assert.equal(admin.status, 200)
        assert.equal(user.status, 401)
    })

    test('rotas protegidas exigem token', async () => {
        assert.equal((await call('GET', '/tickets')).status, 401)
        assert.equal((await call('GET', '/me')).status, 401)
        assert.equal((await call('GET', '/tickets', { token: 'invalido' })).status, 401)
    })

    test('credenciais inválidas retornam 401', async () => {
        const wrong = await call('POST', '/auth', {
            body: { email: 'admin@helpdesk.local', password: 'errada' }
        })

        assert.equal(wrong.status, 401)
    })
})

describe('chamados e propriedade', () => {
    test('usuário vê somente os próprios chamados', async () => {
        const token = await login('usuario@helpdesk.local', 'Usuario@123')
        const { body } = await call('GET', '/tickets', { token })

        assert.ok(body.length > 0)
        assert.ok(body.every((t) => t.ownerId === 2))
    })

    test('admin vê todos os chamados', async () => {
        const token = await login('admin@helpdesk.local', 'Admin@123')
        const { body } = await call('GET', '/tickets', { token })
        const owners = new Set(body.map((t) => t.ownerId))

        assert.ok(owners.size > 1)
    })

    test('usuário não acessa chamado de outra pessoa', async () => {
        const token = await login('usuario@helpdesk.local', 'Usuario@123')

        assert.equal((await call('GET', '/tickets/4', { token })).status, 404)
        assert.equal((await call('DELETE', '/tickets/4', { token })).status, 404)
    })

    test('usuário cria chamado (sempre Aberto, dono é ele)', async () => {
        const token = await login('usuario@helpdesk.local', 'Usuario@123')
        const created = await call('POST', '/tickets', {
            token,
            body: { ...newTicket, status: 'Concluido' }
        })

        assert.equal(created.status, 201)
        assert.equal(created.body.status, 'Aberto')
        assert.equal(created.body.ownerId, 2)
    })

    test('valida os campos do chamado', async () => {
        const token = await login('usuario@helpdesk.local', 'Usuario@123')
        const invalid = await call('POST', '/tickets', {
            token,
            body: { title: ' ', description: 'x', priority: 'Urgente' }
        })

        assert.equal(invalid.status, 400)
    })

    test('usuário não altera o status, mas edita os demais campos', async () => {
        const token = await login('usuario@helpdesk.local', 'Usuario@123')
        const created = await call('POST', '/tickets', { token, body: newTicket })
        const id = created.body.id

        const status = await call('PATCH', `/tickets/${id}`, { token, body: { status: 'Concluido' } })
        const title = await call('PATCH', `/tickets/${id}`, { token, body: { title: 'Novo título' } })

        assert.equal(status.status, 403)
        assert.equal(title.status, 200)
        assert.equal(title.body.title, 'Novo título')
    })

    test('admin altera o status de qualquer chamado', async () => {
        const token = await login('admin@helpdesk.local', 'Admin@123')
        const { status, body } = await call('PATCH', '/tickets/4', { token, body: { status: 'Concluido' } })

        assert.equal(status, 200)
        assert.equal(body.status, 'Concluido')
    })
})

describe('exclusão de chamados', () => {
    test('usuário exclui o próprio chamado', async () => {
        const token = await login('usuario@helpdesk.local', 'Usuario@123')
        const created = await call('POST', '/tickets', { token, body: newTicket })

        assert.equal((await call('DELETE', `/tickets/${created.body.id}`, { token })).status, 200)
        assert.equal((await call('GET', `/tickets/${created.body.id}`, { token })).status, 404)
    })

    test('admin exclui o chamado de qualquer usuário', async () => {
        const user = await login('usuario@helpdesk.local', 'Usuario@123')
        const admin = await login('admin@helpdesk.local', 'Admin@123')
        const created = await call('POST', '/tickets', { token: user, body: newTicket })

        assert.equal((await call('DELETE', `/tickets/${created.body.id}`, { token: admin })).status, 200)
    })

    test('excluir chamado inexistente retorna 404', async () => {
        const token = await login('admin@helpdesk.local', 'Admin@123')

        assert.equal((await call('DELETE', '/tickets/9999', { token })).status, 404)
    })
})

describe('usuários', () => {
    const newUser = { name: 'Maria', email: 'maria@helpdesk.local', password: 'Maria@1234' }

    test('usuário comum não gerencia usuários', async () => {
        const token = await login('usuario@helpdesk.local', 'Usuario@123')

        assert.equal((await call('GET', '/users', { token })).status, 403)
        assert.equal((await call('POST', '/users', { token, body: newUser })).status, 403)
    })

    test('admin cria usuário, que consegue entrar; senha não é exposta', async () => {
        const admin = await login('admin@helpdesk.local', 'Admin@123')
        const created = await call('POST', '/users', { token: admin, body: newUser })

        assert.equal(created.status, 201)
        assert.equal(created.body.role, 'usuario')
        assert.equal(created.body.passwordHash, undefined)

        const token = await login(newUser.email, newUser.password)
        const me = await call('GET', '/me', { token })

        assert.equal(me.body.email, newUser.email)

        const list = await call('GET', '/users', { token: admin })

        assert.ok(list.body.every((u) => u.passwordHash === undefined))
    })

    test('rejeita e-mail repetido, senha curta e perfil inválido', async () => {
        const admin = await login('admin@helpdesk.local', 'Admin@123')

        assert.equal((await call('POST', '/users', { token: admin, body: newUser })).status, 409)
        assert.equal((await call('POST', '/users', {
            token: admin, body: { ...newUser, email: 'x@helpdesk.local', password: '123' }
        })).status, 400)
        assert.equal((await call('POST', '/users', {
            token: admin, body: { ...newUser, email: 'y@helpdesk.local', role: 'root' }
        })).status, 400)
    })
})

describe('filtros de chamados', () => {
    test('filtra por status', async () => {
        const token = await login('admin@helpdesk.local', 'Admin@123')
        const { status, body } = await call('GET', '/tickets?status=Aberto', { token })

        assert.equal(status, 200)
        assert.ok(body.length > 0)
        assert.ok(body.every((t) => t.status === 'Aberto'))
    })

    test('filtra por prioridade', async () => {
        const token = await login('admin@helpdesk.local', 'Admin@123')
        const { body } = await call('GET', '/tickets?priority=Alta', { token })

        assert.ok(body.length > 0)
        assert.ok(body.every((t) => t.priority === 'Alta'))
    })

    test('combina status e prioridade', async () => {
        const token = await login('admin@helpdesk.local', 'Admin@123')
        const { body } = await call('GET', '/tickets?status=Em andamento&priority=Baixa', { token })

        assert.ok(body.length > 0)
        assert.ok(body.every((t) => t.status === 'Em andamento' && t.priority === 'Baixa'))
    })

    test('aceita vários valores separados por vírgula', async () => {
        const token = await login('admin@helpdesk.local', 'Admin@123')
        const { body } = await call('GET', '/tickets?priority=Alta,Baixa', { token })

        assert.ok(body.length > 0)
        assert.ok(body.every((t) => ['Alta', 'Baixa'].includes(t.priority)))
    })

    test('usuário filtra apenas dentro dos próprios chamados', async () => {
        const token = await login('usuario@helpdesk.local', 'Usuario@123')
        const { body } = await call('GET', '/tickets?status=Aberto', { token })

        assert.ok(body.every((t) => t.ownerId === 2 && t.status === 'Aberto'))
    })

    test('valor de filtro inválido retorna 400', async () => {
        const token = await login('admin@helpdesk.local', 'Admin@123')

        assert.equal((await call('GET', '/tickets?status=Fechado', { token })).status, 400)
        assert.equal((await call('GET', '/tickets?priority=Urgente', { token })).status, 400)
    })
})

describe('bloqueio por tentativas', () => {
    test('bloqueia o usuário após 3 erros, mesmo com a senha correta', async () => {
        const wrong = { email: 'outro@helpdesk.local', password: 'errada' }

        for (let i = 0; i < 3; i++) {
            assert.equal((await call('POST', '/auth', { body: wrong })).status, 401)
        }

        const locked = await call('POST', '/auth', {
            body: { email: 'outro@helpdesk.local', password: 'Outro@123' }
        })

        assert.equal(locked.status, 429)
        assert.ok(locked.body.retryAfterSeconds > 0)
    })

    test('bloqueia também o administrador', async () => {
        for (let i = 0; i < 3; i++) {
            await call('POST', '/auth', { body: { email: 'admin@helpdesk.local', password: 'errada' } })
        }

        const locked = await call('POST', '/auth', {
            body: { email: 'admin@helpdesk.local', password: 'Admin@123' }
        })

        assert.equal(locked.status, 429)
    })

    test('o bloqueio de uma conta não afeta as outras', async () => {
        const { status } = await call('POST', '/auth', {
            body: { email: 'usuario@helpdesk.local', password: 'Usuario@123' }
        })

        assert.equal(status, 200)
    })
})
