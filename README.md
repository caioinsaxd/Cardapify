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
