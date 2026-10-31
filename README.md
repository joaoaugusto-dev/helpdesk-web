# HelpDesk Lite

Sistema de chamados em React + TypeScript, com login por JWT, perfis (usuário e administrador) e uma API local em Dart (JSON REST Server).

## O que tem

- **Login** com os dois perfis, olho da senha que acompanha o mouse e revelação letra a letra.
- **Chamados:** lista com filtros de status e prioridade (ordenada: aberto, em andamento, concluído; dentro de cada um, alta, média, baixa), detalhe, criação, edição de status/prioridade e exclusão com confirmação. Escrita só para administrador.
- **Modo claro e escuro**, com a troca animada a partir do botão.

## Como rodar

Precisa de Node 20+ e do [Dart SDK](https://dart.dev/get-dart).

**1. API** (porta 5050)

```bash
dart pub global activate json_rest_server
cd api-jrs
cp config.example.yaml config.yaml      # troque o jwtSecret por uma chave sua
cp database.example.json database.json
json_rest_server run                    # se não achar o comando, veja o PATH do Dart Pub
```

`config.yaml` e `database.json` ficam fora do Git de propósito. Detalhes e limitações da API em [`api-jrs/README.md`](api-jrs/README.md).

**2. Front**

```bash
npm install
npm run dev
```

A URL da API está em `.env` (`VITE_API_URL`).

## Contas de teste

Fictícias, só para ambiente local.

| Perfil | E-mail | Senha |
|---|---|---|
| Usuário | `usuario@helpdesk.local` | `Usuario@123` |
| Administrador | `admin@helpdesk.local` | `Admin@123` |

No login, escolha "Administrador" para entrar com a conta de admin.

## Estrutura

```
src/
  services/   api.ts (cliente HTTP), authService.ts, ticketService.ts
  components/ Navbar, Segmented, PasswordField, ConfirmDialog, ThemeToggle...
  pages/      Login, Home, Chamados, Detalhe, Novo chamado
  data/       rótulos e ordem dos chamados
api-jrs/      API local (config e banco de exemplo)
```
