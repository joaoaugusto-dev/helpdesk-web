# HelpDesk API (Node.js)

Backend do HelpDesk Lite em Node.js + Express, para o `front/`. Usa os mesmos endereços (`/auth`, `/me`, `/tickets`) e a porta `5050`.

## Regras de negócio

| Regra | Como funciona |
|---|---|
| Senhas | Guardadas com hash (bcrypt); nunca são devolvidas pela API. |
| Login | `POST /auth` com `email` e `password`. `admin: true` é opcional e só é aceito para contas de administrador. |
| Chamados por dono | Cada chamado guarda o `ownerId`. O usuário vê só os que abriu; o admin vê todos. Chamado de outra pessoa responde 404. |
| Criar chamado | Usuário e admin podem. Para o usuário o status sempre começa como `Aberto`. |
| Editar chamado | Dono ou admin (PUT/PATCH). Só o admin altera o `status`. |
| Excluir chamado | Usuário exclui os próprios; admin exclui qualquer um. |
| Criar usuário | Só o admin (`POST /users`). E-mail único, senha com 8+ caracteres, perfil `usuario` ou `admin`. |
| Bloqueio de login | 5 senhas erradas seguidas bloqueiam aquele e-mail por 5 minutos (HTTP 429, mesmo com a senha certa). Vale para usuário e admin, e para e-mails inexistentes, para não revelar quais contas existem. |

## Endpoints

| Método | Rota | Acesso |
|---|---|---|
| POST | `/auth` | público |
| GET | `/me` | autenticado |
| GET | `/tickets`, `/tickets/:id` | autenticado (filtrado por dono); `/tickets` aceita filtros |
| POST | `/tickets` | autenticado |
| PUT / PATCH | `/tickets/:id` | dono ou admin |
| DELETE | `/tickets/:id` | dono ou admin |
| GET / POST | `/users` | admin |

Autenticação: `Authorization: Bearer <access_token>`. Códigos: 400 dados inválidos, 401 sem login ou credenciais inválidas, 403 sem permissão, 404 não encontrado, 409 e-mail repetido, 429 login bloqueado.

## Filtros de chamados

`GET /tickets` aceita os filtros `status` e `priority`, que podem ser combinados. Eles se aplicam só aos chamados que a pessoa já pode ver.

```http
GET /tickets?status=Aberto
GET /tickets?priority=Alta
GET /tickets?status=Em andamento&priority=Baixa
GET /tickets?priority=Alta,Media
```

Valores aceitos: `status` = `Aberto`, `Em andamento`, `Concluido`; `priority` = `Baixa`, `Media`, `Alta` (exatamente assim, sem acento). Vários valores separados por vírgula funcionam como "um ou outro". Valor inválido retorna 400.

## Como executar

```bash
cd api
npm install
npm start
```

O servidor sobe em `http://127.0.0.1:5050`. 

Na primeira execução é criado `data/database.json` com os dados de exemplo. Para voltar ao estado inicial, apague esse arquivo e reinicie.

Configuração opcional: copie `.env.example` para `.env` e ajuste (principalmente `JWT_SECRET`). Sem `.env`, o servidor usa um segredo temporário, e os logins deixam de valer ao reiniciar.

### Contas de exemplo

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | `admin@helpdesk.local` | `Admin@123` |
| Usuário | `usuario@helpdesk.local` | `Usuario@123` |
| Usuário | `outro@helpdesk.local` | `Outro@123` |

Os chamados de exemplo 1 a 3 pertencem a `usuario` e os 4 e 5 a `outro`.

## Testes

Automáticos (26 testes, usam um banco temporário):

```bash
npm test
```

No Insomnia: importe a coleção de testes do Insomnia, apague `data/database.json` e reinicie o servidor antes de rodar a suíte *Backend - regras de negócio* na aba *Test*.

## Estrutura

O código é organizado por módulos. Cada módulo de `src/api/` tem suas rotas, seu controller (recebe a requisição e devolve a resposta) e seu service (regras de negócio).

```text
src/
├── server.js                 # inicia o servidor
├── app.js                    # monta o Express
├── config.js                 # configuração (variáveis de ambiente)
├── api/
│   ├── index.js              # junta os módulos
│   ├── auth/                 # login, /me e bloqueio por tentativas
│   │   ├── auth.routes.js
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── loginGuard.js
│   │   └── index.js
│   ├── tickets/              # chamados, propriedade e filtros
│   │   ├── tickets.routes.js
│   │   ├── tickets.controller.js
│   │   ├── tickets.service.js
│   │   ├── tickets.validation.js
│   │   └── index.js
│   └── users/                # gerenciamento de usuários (admin)
│       ├── users.routes.js
│       ├── users.controller.js
│       ├── users.service.js
│       └── index.js
└── shared/
    ├── db.js                 # persistência em arquivo JSON
    ├── errors.js             # erros HTTP
    └── middleware.js         # autenticação, permissões e tratamento de erros
test/api.test.js              # testes automáticos
```

## Limitações

Persistência em arquivo JSON e bloqueio de login em memória (reiniciar o servidor zera o bloqueio) são suficientes para estudo, mas não para produção. Lá o ideal é banco de dados, HTTPS e limite de requisições por IP.
