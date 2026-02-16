# 🏟️ Arena 360 — Sistema de Gestão de Segurança

> Plataforma completa de gestão operacional para a equipe de segurança do Estádio Arena BRB (Mané Garrincha), cobrindo controle de acesso veicular, empréstimos de acervo, gestão de eventos e administração de pessoal.

## 📋 **O que é?**

Sistema web responsivo desenvolvido para centralizar e digitalizar as operações de segurança da Arena BRB. Substitui planilhas e processos manuais por uma interface integrada que cobre desde o controle de veículos no estacionamento até relatórios anuais de gastos com pessoal.

**🌐 [Ver Sistema](https://blue-forest-0c585dc10.azurestaticapps.net)**

---

## ✨ **Módulos Implementados**

### 🔵 **Veículos** (`/vehicles`)
Controle de veículos autorizados no estacionamento interno do estádio.
- Cadastro completo: placa, marca, modelo, tipo, cor e local autorizado
- 12 locais de estacionamento: VIP, Imprensa, Staff, Garagens, etc.
- Tipos suportados: Carro, Moto, Caminhão, Van, Ônibus
- Soft delete com restauração de registros
- Vinculação com proprietários

### ⚫ **Proprietários** (`/owners`)
Gestão dos responsáveis pelos veículos cadastrados.
- Cadastro com nome, telefone, empresa, cargo e setor
- Um proprietário pode ter múltiplos veículos vinculados
- Validação: não permite excluir proprietário com veículos ativos
- Histórico completo de veículos por proprietário

### 🟠 **Veículos de Terceiros** (`/thirdparty`)
Controle de veículos externos que acessam o estádio.
- Dados do motorista, empresa e tipo de serviço
- Registro de telefone e empresa prestadora
- Busca por placa, motorista, empresa ou marca

### 🟡 **Empréstimos de Acervo** (`/loans`)
Controle de equipamentos emprestados a empresas e colaboradores.
- Gestão de estoque com quantidades disponíveis e totais
- Emissão de PDF de empréstimo e PDF de devolução
- Controle de status: Emprestado, Devolvido, Atrasado, Perdido/Danificado
- Registro de devolução parcial ou total com nota de condição
- **Relatórios anuais** com:
  - Itens mais emprestados (ranking por quantidade)
  - Empresas que mais pegam emprestado
  - Tempo médio de empréstimo por empresa
  - Evolução mensal
  - Exportação PDF e Excel (6 abas)

### 💚 **Gestão de Eventos** (`/events`)
Controle financeiro e operacional dos eventos realizados no estádio.

**Eventos**
- Cadastro com nome, categoria, status e datas
- Categorias: Corporativo, Corrida, Evento Esportivo, Feira, Jogo, Luta, Outro, Religioso, Show, Treinamento
- Timeline de gastos por dia (antes, durante e após o evento)
- Visualização por tipo (pessoal vs aluguel)

**Gastos por Evento**
- Categoria Pessoal: Carregador, Segurança, Ascensorista, Segurança Motorizado
- Categoria Aluguel: Fechamento Cego, Gradis
- Cálculo automático: plantões × pessoas × valor unitário

**Banco de Horas**
- Registro de horas por funcionário por evento
- Totais mensais e anuais por colaborador

**Equipe de Segurança**
- Cadastro de funcionários com cargo, telefone e e-mail
- Vinculação com banco de horas

**Cobertura de Férias**
- Registro de seguranças terceirizados contratados por diária
- Cálculo automático de plantões pela escala 12x36
- Campo editável para ajuste manual dos dias a pagar
- Preview em tempo real do total da cobertura

**Relatórios de Eventos**
- Por evento, por mês, por tipo de pessoal/aluguel e banco de horas
- Exportação PDF (5 páginas) e Excel (6 abas)

### 🟣 **Relatórios Gerais** (`/reports`)
Visão consolidada de veículos, proprietários, terceiros e empréstimos.

---

## 🛠️ **Tecnologias**

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite 6 |
| Estilização | Tailwind CSS |
| Ícones | Lucide React |
| Backend/DB | Supabase (PostgreSQL) |
| Segurança DB | Row Level Security (RLS) + Security Invoker Views |
| PDF | jsPDF + jspdf-autotable |
| Excel | SheetJS (xlsx) |
| Hospedagem | Azure Static Web Apps |
| CI/CD | GitHub Actions |

---

## 🗄️ **Banco de Dados**

### Tabelas principais
```
vehicles              → veículos cadastrados
owners                → proprietários
third_party_vehicles  → veículos terceiros
loans                 → empréstimos
loan_items            → catálogo de itens do acervo
loan_items_detail     → itens por empréstimo
events                → eventos do estádio
event_expenses        → gastos por evento
security_team         → equipe de segurança
hour_bank             → banco de horas
vacation_expenses     → coberturas de férias
audit_logs            → log de auditoria
document_control      → controle de documentos
```

### Views (Security Invoker)
```
v_event_totals        → totais por evento
v_monthly_expenses    → gastos mensais
v_hour_bank_summary   → resumo do banco de horas
v_monthly_hours       → horas mensais por funcionário
```

### Funções SQL
```
soft_delete_vehicle(uuid)   → exclusão lógica de veículo
restore_vehicle(uuid)       → restauração de veículo
soft_delete_owner(uuid)     → exclusão lógica de proprietário
restore_owner(uuid)         → restauração de proprietário
log_audit()                 → trigger de auditoria
update_updated_at_column()  → trigger de timestamp
```

---

## 🚀 **Começar em 3 passos**

### **1. Clonar**
```bash
git clone https://github.com/jjoelcosta/controle-veiculos-estadio.git
cd controle-veiculos-estadio
```

### **2. Instalar**
```bash
npm install
```

### **3. Configurar ambiente**
Crie `.env.local` na raiz:
```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

### **4. Executar**
```bash
npm run dev
```
Acesse: `http://localhost:5173`

---

## 📁 **Estrutura do Projeto**

```
src/
├── components/
│   ├── VehicleRegistry.jsx         # Orquestrador principal (navegação + CRUD)
│   ├── vehicle/
│   │   ├── VehicleList.jsx         # Lista + menu lateral + dashboard
│   │   ├── VehicleDetail.jsx       # Detalhe do veículo
│   │   └── VehicleEditModal.jsx    # Modal de edição
│   ├── owner/
│   │   ├── OwnerList.jsx           # Lista de proprietários (tabela)
│   │   └── OwnerDetail.jsx         # Detalhe com veículos vinculados
│   ├── thirdparty/
│   │   └── ThirdPartyVehicleList.jsx
│   ├── loan/
│   │   ├── LoanList.jsx            # Lista de empréstimos (tabela/cards)
│   │   ├── LoanForm.jsx            # Formulário de novo empréstimo
│   │   ├── LoanDetail.jsx          # Detalhe + ações
│   │   ├── LoanReturnForm.jsx      # Formulário de devolução
│   │   ├── LoanEditForm.jsx        # Edição de empréstimo
│   │   ├── LoanInventory.jsx       # Gestão de estoque
│   │   └── LoanReports.jsx         # Relatórios anuais de acervo
│   ├── events/
│   │   ├── EventList.jsx           # Lista de eventos (tabela/cards)
│   │   ├── EventForm.jsx           # Formulário de evento
│   │   ├── EventDetail.jsx         # Detalhe + timeline de gastos
│   │   ├── TeamManager.jsx         # Gestão da equipe
│   │   ├── HourBank.jsx            # Banco de horas
│   │   ├── EventReports.jsx        # Relatórios de gastos
│   │   └── VacationList.jsx        # Coberturas de férias
│   ├── reports/
│   │   └── Reports.jsx             # Relatórios gerais
│   └── ui/
│       ├── Modal.jsx               # Modal de confirmação
│       ├── Toast.jsx               # Notificações
│       └── LoadingButton.jsx       # Botão com estado de loading
├── utils/
│   ├── storage.js                  # Todas as operações Supabase (CRUD)
│   ├── loanPDF.js                  # Geração de PDFs de empréstimo
│   └── vehicleTypes.js             # Configuração de tipos de veículo
├── App.jsx
└── index.css
```

---

## 📱 **Responsividade**

O sistema é 100% responsivo com breakpoints adaptados para cada módulo:

| Tela | Comportamento |
|------|--------------|
| Mobile (< 1024px) | Cards empilhados, campos de data compactos, botões full-width |
| Desktop (≥ 1024px) | Tabelas com colunas, menu lateral expandido, layout em grid |

---

## 🌐 **Deploy**

Deploy automático no Azure via GitHub Actions:

```bash
git add .
git commit -m "Descrição da mudança"
git push origin main
```

Aguarde 3-5 minutos → Site atualizado automaticamente.

---

## 📄 **Licença**

MIT License — uso livre

---

## 👤 **Autor**

**Joel Costa** — Analista de Segurança, Arena BRB
- GitHub: [@jjoelcosta](https://github.com/jjoelcosta)
