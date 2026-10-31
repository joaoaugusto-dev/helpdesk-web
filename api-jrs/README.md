# HelpDesk API com JSON REST Server (JRS)

## Objetivo da aula

Configurar uma API REST local e persistente em JSON com autenticação JWT e dois tipos de acesso, **sem conectar ainda o React**. Os dados iniciais são os cinco objetos do arquivo `ticket.ts`, com campos preservados: `id`, `title`, `description`, `status`, `priority`.

Esta é uma **simulação didática local**, não um backend seguro para produção. Consulte a seção de limitações.

## 1. Teoria

- **API REST:** endpoints HTTP acessíveis em `/tickets`, `/tickets/:id`, `/auth` e `/me`.
- **Persistência:** em vez de deixar o mock dentro de `src/data/ticket.ts`, o servidor lê `database.json` e salva alterações no mesmo arquivo.
- **JWT:** `POST /auth` confirma credenciais e fornece um `access_token`. As consultas protegidas precisam de `Authorization: Bearer TOKEN`.
- **Perfis:** login comum procura em `users`; login com `admin: true` procura em `adm_users`. `enableAdm: true` restringe POST/PUT/DELETE a administradores (com ressalvas na seção de segurança).
- **Compatibilidade:** os chamados mantêm exatamente os textos do mock, inclusive `Media` e `Concluido`, sem acentos, para futura compatibilidade com os tipos TypeScript atuais.

## 2. Arquivos

```text
helpdesk-jrs/
├── config.yaml
├── database.json
├── config.example.yaml
├── database.example.json
├── postman/
│   └── HelpDesk-JRS.postman_collection.json
├── .gitignore
└── README.md
```

`config.yaml`: host, porta, JWT e permissões.

`database.json`: cinco chamados iniciais e dois usuários de teste. As alterações da API serão gravadas nesse arquivo.

`postman/...json`: coleção importável com login, consultas e CRUD.

Os arquivos `*.example.*` são apenas modelos compartilháveis (ainda incluem senhas **fictícias**, nunca dados reais). `config.yaml` e `database.json` estão ignorados no Git para reduzir risco de publicação acidental.

## 3. Instalação

Instale o Dart SDK: https://dart.dev/get-dart (Flutter instalado já inclui Dart). Reinicie o terminal e confira:

```bash
dart --version
```

Instale/ative o JRS:

```bash
dart pub global activate json_rest_server
```

Se o terminal não encontrar `json_rest_server`, adicione ao PATH a pasta de executáveis globais do Dart Pub. Consulte as instruções que o próprio comando `activate` imprime. O comando também possui o alias `jrs`.

**Não execute `json_rest_server create` sobre esta pasta:** os arquivos já foram criados.

## 4. Executar API

Abra a pasta `helpdesk-jrs` no terminal:

```bash
cd helpdesk-jrs
json_rest_server run
```

A API fica em `http://127.0.0.1:8080`.

O servidor continua ativo enquanto o processo estiver aberto; para parar, `Ctrl+C`.

Não utilize `npm run dev` para esta API: esse comando continua sendo do projeto React, e o JRS é executado pelo Dart. As duas aplicações são independentes.

## 5. Contas de teste

| Papel | E-mail | Senha | Como autenticar |
|---|---|---|---|
| Usuário | `usuario@helpdesk.local` | `Usuario@123` | POST `/auth` com email e password |
| Admin | `admin@helpdesk.local` | `Admin@123` | POST `/auth` com email, password e `admin: true` |

As senhas são exclusivamente fictícias e gravadas em texto puro; **não reutilize senhas reais**.

## 6. Testar no Postman

1. Abra Postman > Import > selecione `postman/HelpDesk-JRS.postman_collection.json`.
2. Abra `01 - Autenticação` e execute primeiro o login do usuário e depois o do administrador. Os scripts de teste armazenam `userToken` e `adminToken` como variáveis da coleção.
3. Execute os GETs de `02 - Consultas de chamados` (a primeira requisição, sem JWT, deve retornar 403).
4. Execute a pasta `03 - Permissões e CRUD administrativo` **na ordem**. POST administrativo armazena `newTicketId`, PUT atualiza e DELETE exclui esse chamado criado no teste.
5. Consulte `database.json` depois de POST/PUT para verificar a persistência.

A pasta `04 - Auditoria didática` contém duas verificações que **falharão intencionalmente** na versão do JRS aqui analisada. Elas ensinam por que um servidor mock não deve ser tratado como API de produção.

## 7. Exemplos de chamadas

Login usuário:

```http
POST http://127.0.0.1:8080/auth
Content-Type: application/json

{"email":"usuario@helpdesk.local","password":"Usuario@123"}
```

Login admin:

```http
POST http://127.0.0.1:8080/auth
Content-Type: application/json

{"email":"admin@helpdesk.local","password":"Admin@123","admin":true}
```

Consulta autenticada:

```http
GET http://127.0.0.1:8080/tickets
Authorization: Bearer SEU_ACCESS_TOKEN
```

Criação autenticada como admin:

```http
POST http://127.0.0.1:8080/tickets
Authorization: Bearer TOKEN_DO_ADMIN
Content-Type: application/json

{"title":"Impressora não funciona","description":"Falha ao imprimir","status":"Aberto","priority":"Alta"}
```

Outras rotas:
- `GET /tickets/1`
- `GET /tickets?status=Aberto`
- `GET /tickets?page=1&limit=2`
- `PUT /tickets/ID`
- `PATCH /tickets/ID`
- `DELETE /tickets/ID`
- `GET /me`

JRS costuma responder 200 em operações CRUD bem-sucedidas e 403 quando `unauthorizedStatusCode: 403` rejeita o acesso.

## 8. Segurança: restrições reais do JRS 3.2.1

O servidor gerado serve para ensino e teste **local apenas**:

1. A autenticação usa senhas sem hash no `database.json`.
2. As coleções de usuários são endpoints genéricos: um usuário autenticado pode executar `GET /users` e `GET /adm_users`, podendo obter senhas em texto puro. `/me` remove a senha, mas os GETs de coleções não.
3. No código-fonte da versão examinada, `enableAdm` bloqueia usuários comuns em **POST, PUT e DELETE**, mas **não aplica essa checagem em PATCH**. Um usuário com JWT válido pode conseguir alterar tickets via `PATCH`.
4. `urlUserPermission` libera uma rota para múltiplos métodos de escrita, e não permite definir com segurança “usuário cria apenas o próprio chamado”. Não inclui filtro de proprietário nem validação de campos.
5. A permissão de administradores vale também para coleções de usuários, sem política fina de autorização.
6. CORS não equivale a autenticação ou autorização.

Por isso a API está vinculada a `127.0.0.1`. **Não publique na internet, não utilize dados pessoais, não coloque a configuração real e o banco no Git e não use para a implantação final em nuvem.** Para um helpdesk real, será necessário um backend com hash de senhas, regras explícitas por endpoint e propriedade do chamado, validação e banco de dados adequado.

## 9. Integração com o React

O `helpdesk-web` consome esta API (URL em `VITE_API_URL`, porta `5050`). Camadas no front:

| Arquivo | Papel |
|---|---|
| `services/api.ts` | cliente HTTP único: monta o header `Authorization` e traduz as respostas em erros |
| `services/authService.ts` | `POST /auth` e `GET /me`; guarda o JWT; descarta token vencido (`exp`) |
| `services/ticketService.ts` | `getAll`, `getById`, `create`, `update` (PUT), `remove` |

Comportamentos da API que o front precisa conhecer:

- **403 serve para tudo:** token ausente, token vencido e falta de permissão. O front distingue pelo `exp` do JWT: sem token válido a sessão expirou (volta ao login); com token válido é falta de permissão.
- **`GET /tickets/ID` inexistente responde `200` com `{}`**, não 404. O `getById` converte isso em `null`.
- **Escrita só para admin** (`enableAdm`): criar, editar e excluir chamados exigem login com `admin: true`. O usuário comum só consulta, então o front esconde essas ações para ele.
- **`PUT` substitui o registro inteiro:** por isso o front envia o chamado completo.
- `GET /tickets` **não é mais público**: `urlSkip` está vazio, então toda rota exige JWT, exceto `/auth`.

O mock `src/data/ticket.ts` foi removido depois da integração, como previsto.

## 10. Solução de problemas

- `dart` não encontrado: instale o SDK, reinicie o terminal e ajuste PATH.
- `json_rest_server` não encontrado: confira a instalação global e PATH do Pub.
- Porta 8080 ocupada: ajuste `port` no YAML e `baseUrl` no Postman.
- Login 403: confirme e-mail/senha e `admin: true` para `adm_users`.
- GET 403: primeiro faça login e confira a variável de token no Postman.
- Alteração não aparece no arquivo: execute a API a partir da pasta com `config.yaml` e `database.json`. 
- Repetir testes CRUD: a pasta 03 cria e apaga um chamado; ela pode ser executada novamente, desde que os logins sejam repetidos após expiração do token (padrão 1 hora).
- Dados são restaurados manualmente substituindo `database.json` pelo conteúdo do `database.example.json` **com o servidor desligado**.

## Referências

- https://pub.dev/packages/json_rest_server
- https://github.com/rodrigorahman/json_rest_server
