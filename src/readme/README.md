# Opendoc

Crie squads de agentes de IA que trabalham juntos — direto do seu IDE.

## Como Usar

Abra esta pasta no seu IDE e digite:

```
/opendoc
```

Isso abre o menu principal. De lá você pode criar squads, executá-los e mais.

Você também pode ser direto — descreva o que quer em linguagem natural:

```
/opendoc crie um squad para escrever posts no LinkedIn sobre IA
/opendoc execute o squad meu-squad
```

## Criar um Squad

Digite `/opendoc` e escolha "Criar squad" no menu, ou seja direto:

```
/opendoc crie um squad para [o que você precisa]
```

O Arquiteto fará algumas perguntas, projetará o squad e configurará tudo automaticamente.

## Executar um Squad

Digite `/opendoc` e escolha "Executar squad" no menu, ou seja direto:

```
/opendoc execute o squad <nome-do-squad>
```

O squad executa automaticamente, pausando apenas nos checkpoints de decisão.

## Escritório Virtual

O Escritório Virtual é uma interface visual 2D que mostra seus agentes trabalhando em tempo real.

**Passo 1 — Gere o dashboard** (no seu IDE):

```
/opendoc dashboard
```

**Passo 2 — Sirva localmente** (no terminal):

```bash
npx serve squads/<nome-do-squad>/dashboard
```

**Passo 3 —** Abra `http://localhost:3000` no seu navegador.

---

# Opendoc (English)

Create AI squads that work together — right from your IDE.

## How to Use

Open this folder in your IDE and type:

```
/opendoc
```

This opens the main menu. From there you can create squads, run them, and more.

You can also be direct — describe what you want in plain language:

```
/opendoc create a squad for writing LinkedIn posts about AI
/opendoc run my-squad
```

## Create a Squad

Type `/opendoc` and choose "Create squad" from the menu, or be direct:

```
/opendoc create a squad for [what you need]
```

The Architect will ask a few questions, design the squad, and set everything up automatically.

## Run a Squad

Type `/opendoc` and choose "Run squad" from the menu, or be direct:

```
/opendoc run the <squad-name> squad
```

The squad runs automatically, pausing only at decision checkpoints.

## Virtual Office

The Virtual Office is a 2D visual interface that shows your agents working in real time.

**Step 1 — Generate the dashboard** (in your IDE):

```
/opendoc dashboard
```

**Step 2 — Serve it locally** (in terminal):

```bash
npx serve squads/<squad-name>/dashboard
```

**Step 3 —** Open `http://localhost:3000` in your browser.
