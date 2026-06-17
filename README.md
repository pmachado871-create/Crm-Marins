# CRM Pré-Campanha — Marcos Marins 2026

Sistema de gestão de contatos para a pré-campanha via WhatsApp em Nova Friburgo.

---

## Deploy no Vercel (recomendado — gratuito)

### 1. Instalar Node.js
Acesse https://nodejs.org e instale a versão LTS.

### 2. Instalar dependências
```bash
npm install
```

### 3. Testar localmente
```bash
npm run dev
```
Acesse http://localhost:5173 para confirmar que está funcionando.

### 4. Subir no GitHub
- Crie um repositório no github.com (pode ser privado)
- Faça upload da pasta inteira do projeto

### 5. Deploy no Vercel
- Acesse vercel.com e faça login com sua conta GitHub
- Clique em "Add New Project" → selecione o repositório
- Clique em "Deploy" — pronto, já tem um link .vercel.app

### 6. Domínio próprio (ex: crm.marcosmarins.com.br)
- No painel do Vercel, vá em Settings → Domains
- Adicione o domínio desejado
- Aponte o DNS do seu domínio para o Vercel (instruções fornecidas pelo próprio Vercel)

---

## Dados
Os dados ficam salvos no `localStorage` do navegador de cada usuário.
Para uso em equipe, recomenda-se futuramente migrar para Firebase (já planejado).

---

## Funcionalidades
- Gestão de contatos com importação via Excel/CSV
- Enquetes com controle de envio (enviado / não enviado)
- Classificação por bairro, fonte e status (Interagiu / Não interagiu)
- Agenda de metas por liderança
- Painel de indicadores em tempo real
- Botão de acesso direto ao WhatsApp de cada contato
