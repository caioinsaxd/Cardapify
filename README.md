# 🍔 Cardapify

Cardapify é um SaaS de cardápio digital com autoatendimento para restaurantes.

A plataforma permite que estabelecimentos criem e personalizem seus próprios cardápios e utilizem o sistema em dois modos:

-  **Totem físico** (App em React Native)
-  **QR Code na mesa** (Web)

O objetivo é oferecer uma solução moderna, simples e escalável para autoatendimento com pagamento online.

---

## 🚀 Status do Projeto

**Em desenvolvimento** — fase inicial de estruturação do backend.

---

## 🏗 Arquitetura

O sistema será dividido em:

| Módulo | Descrição |
|---|---|
| **Backend API** | Responsável por regras de negócio e banco de dados |
| **Admin Web** | Painel para gerenciamento do restaurante |
| **App Totem** | Aplicativo para autoatendimento |
| **QR Code Web** | Versão pública para pedidos via navegador |

### Arquitetura Multi-Tenant

Cada restaurante possui seus próprios dados isolados via `restaurantId`.

---

## 🛠 Tecnologias

### Backend
- **NestJS** (TypeScript)
- **Prisma ORM**
- **PostgreSQL**

### Admin Web
- Next.js;
- React;
- TypeScript;
- TailwindCSS

### App Totem
- React Native;
- Expo;

### Pagamentos
- Pix via gateway (ex: Mercado Pago / Stripe);

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js 18+
- PostgreSQL instalado e rodando

### 1. Backend

```bash
cd cardapify-backend

# Instalar dependências
npm install

# Configurar banco de dados (criar tabelas)
npm run db:push

# Popular banco com dados iniciais
npm run db:seed

# Rodar em modo desenvolvimento
npm run start:dev
```

O backend estará disponível em: `http://localhost:3001`

### 2. Frontend

```bash
cd cardapify-frontend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env.local

# Rodar em modo desenvolvimento
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

### 3. Login (Desenvolvimento)

1. Acesse `http://localhost:3000/login`
2. Clique em **"Entrar como Admin (Dev)"** para testar sem credenciais

### Dados de Login (produção)

- **Email:** `admin@cardapify.dev`
- **Senha:** `admin123`

---

## 📚 API Documentation

Quando o backend estiver rodando, acesse:
- Swagger: `http://localhost:3001/api/docs`
- Health Check: `http://localhost:3001/health`

---
