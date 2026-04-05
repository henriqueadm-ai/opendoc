# Conectese

Crie times de agentes de IA que trabalham juntos — direto do seu IDE.

## Como Usar

Abra esta pasta no seu IDE e digite:

```
/conectese
```

Isso abre o menu principal. De lá você pode criar times, executá-los e mais.

Você também pode ser direto — descreva o que quer em linguagem natural:

```
/conectese crie um time para escrever posts no LinkedIn sobre IA
/conectese execute o time meu-time
```

## Criar um Time

Digite `/conectese` e escolha "Criar time" no menu, ou seja direto:

```
/conectese crie um time para [o que você precisa]
```

O Arquiteto fará algumas perguntas, projetará o time e configurará tudo automaticamente.

## Executar um Time

Digite `/conectese` e escolha "Executar time" no menu, ou seja direto:

```
/conectese execute o time <nome-do-time>
```

O time executa automaticamente, pausando apenas nos checkpoints de decisão.

## Escritório Virtual

O Escritório Virtual é uma interface visual 2D que mostra seus agentes trabalhando em tempo real.

**Passo 1 — Gere o dashboard** (no seu IDE):

```
/conectese dashboard
```

**Passo 2 — Sirva localmente** (no terminal):

```bash
npx serve teams/<nome-do-time>/dashboard
```

**Passo 3 —** Abra `http://localhost:3000` no seu navegador.

---

# Conectese (English)

Create AI teams that work together — right from your IDE.

## How to Use

Open this folder in your IDE and type:

```
/conectese
```

This opens the main menu. From there you can create teams, run them, and more.

You can also be direct — describe what you want in plain language:

```
/conectese create a team for writing LinkedIn posts about AI
/conectese run my-team
```

## Create a Team

Type `/conectese` and choose "Create team" from the menu, or be direct:

```
/conectese create a team for [what you need]
```

The Architect will ask a few questions, design the team, and set everything up automatically.

## Run a Team

Type `/conectese` and choose "Run team" from the menu, or be direct:

```
/conectese run the <team-name> team
```

The team runs automatically, pausing only at decision checkpoints.

## Virtual Office

The Virtual Office is a 2D visual interface that shows your agents working in real time.

**Step 1 — Generate the dashboard** (in your IDE):

```
/conectese dashboard
```

**Step 2 — Serve it locally** (in terminal):

```bash
npx serve teams/<team-name>/dashboard
```

**Step 3 —** Open `http://localhost:3000` in your browser.
