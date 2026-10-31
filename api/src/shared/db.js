import fs from 'node:fs'
import path from 'node:path'
import bcrypt from 'bcryptjs'

// Persistencia simples em arquivo JSON. Todas as operacoes sao sincronas,
// entao nao ha escritas concorrentes dentro do mesmo processo.

function seedData(rounds) {
    const hash = (password) => bcrypt.hashSync(password, rounds)

    return {
        users: [
            { id: 1, name: 'Administrador HelpDesk', email: 'admin@helpdesk.local', passwordHash: hash('Admin@123'), role: 'admin' },
            { id: 2, name: 'Usuario Exemplo', email: 'usuario@helpdesk.local', passwordHash: hash('Usuario@123'), role: 'usuario' },
            { id: 3, name: 'Outro Usuario', email: 'outro@helpdesk.local', passwordHash: hash('Outro@123'), role: 'usuario' }
        ],
        tickets: [
            { id: 1, title: 'Problema no login', description: 'Usuário não consegue acessar o sistema', status: 'Aberto', priority: 'Alta', ownerId: 2 },
            { id: 2, title: 'Atualização de cadastro', description: 'Cliente solicitou alteração do endereço', status: 'Em andamento', priority: 'Media', ownerId: 2 },
            { id: 3, title: 'Troca de senha', description: 'Senha do usuário foi redefinida', status: 'Concluido', priority: 'Baixa', ownerId: 2 },
            { id: 4, title: 'Erro ao gerar relatório', description: 'O relatório financeiro não está sendo gerado', status: 'Aberto', priority: 'Alta', ownerId: 3 },
            { id: 5, title: 'Atualização de informações', description: 'Solicitação de atualização dos dados cadastrais', status: 'Em andamento', priority: 'Baixa', ownerId: 3 }
        ]
    }
}

export function createDb(file, bcryptRounds = 10) {
    let data

    if (fs.existsSync(file)) {
        data = JSON.parse(fs.readFileSync(file, 'utf-8'))
    } else {
        data = seedData(bcryptRounds)
        save()
    }

    function save() {
        fs.mkdirSync(path.dirname(file), { recursive: true })
        const tmp = `${file}.tmp`
        fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8')
        fs.renameSync(tmp, file)
    }

    function nextId(list) {
        return list.reduce((max, item) => Math.max(max, item.id), 0) + 1
    }

    return {
        get users() { return data.users },
        get tickets() { return data.tickets },
        nextId,
        save
    }
}
