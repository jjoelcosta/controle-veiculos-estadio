# 🏟️ Arena BRB / Arena 360 — Gestão Integrada de Segurança

Plataforma completa de gestão operacional para a equipe de segurança do Estádio Arena BRB (Mané Garrincha), cobrindo controle de acesso veicular, empréstimos de acervo, gestão de eventos e administração de pessoal operacional.

---

## 📋 O que é?

Sistema web responsivo desenvolvido para centralizar e digitalizar as operações de segurança da Arena BRB. Substitui planilhas e processos manuais por uma interface integrada que cobre desde o controle de veículos no estacionamento até relatórios anuais de gastos com pessoal e gestão de férias CLT.

**🌐 [Ver Sistema ao Vivo](sua-url-azure.com)**

---

## ✨ Módulos Implementados

### 🏠 **Dashboard Executivo** (Página Inicial)
Painel de controle com visão consolidada de todos os módulos:

- **Cards de métricas:** Veículos, Terceiros, Empréstimos ativos, Próximos eventos (15 dias), Pessoal ativo, Gastos do mês
- **Alertas críticos:** Empréstimos atrasados, Férias vencendo (≤90 dias), Funcionários afastados
- **Timeline de eventos:** Próximos 15 dias com código de cores por urgência
- **Gastos mensais:** Total + breakdown (Pessoal vs Aluguel) com gráficos de progresso
- **Acesso rápido:** Botões para principais ações (Buscar Veículo, Novo Empréstimo, etc.)

---

### 🔵 **Veículos** (`/vehicles`)
Controle de veículos autorizados no estacionamento interno do estádio.

- Cadastro completo: placa, marca, modelo, tipo, cor e local autorizado
- **12 locais de estacionamento:** VIP, Imprensa, Staff, Garagens A/B/C, Área Externa, etc.
- **Tipos suportados:** Carro, Moto, Caminhão, Van, Ônibus
- Soft delete com restauração de registros
- Vinculação automática com proprietários
- Busca avançada por placa, marca, modelo, proprietário, empresa ou setor

---

### ⚫ **Proprietários** (`/owners`)
Gestão dos responsáveis pelos veículos cadastrados.

- Cadastro com nome, telefone, empresa, cargo e setor
- Um proprietário pode ter múltiplos veículos vinculados
- **Validação:** não permite excluir proprietário com veículos ativos
- Histórico completo de veículos por proprietário
- Detalhamento com lista de todos os veículos vinculados

---

### 🟠 **Veículos de Terceiros** (`/thirdparty`)
Controle de veículos externos que acessam o estádio.

- Dados do motorista, empresa e tipo de serviço
- Registro de telefone e empresa prestadora
- Busca por placa, motorista, empresa ou marca
- Soft delete para auditoria

---

### 🟡 **Empréstimos de Acervo** (`/loans`)
Controle de equipamentos emprestados a empresas e colaboradores.

**Funcionalidades principais:**
- Gestão de estoque com quantidades disponíveis e totais
- Emissão de **PDF de empréstimo** e **PDF de devolução** com numeração sequencial
- Controle de status: Emprestado, Devolvido, Atrasado, Perdido/Danificado
- Registro de devolução parcial ou total com:
  - Nota de condição por item (OK, Danificado, Perdido)
  - Taxa de dano/perda
  - Forma de pagamento (Dinheiro, PIX, Cartão, Boleto, Transferência, A Pagar)
  - Data de pagamento
  - Observações por item

**Relatórios anuais:**
- Itens mais emprestados (ranking por quantidade)
- Empresas que mais pegam emprestado
- Tempo médio de empréstimo por empresa
- Evolução mensal de empréstimos
- **Exportação:** PDF (6 páginas) + Excel (6 abas)

---

### 🟣 **Pessoal Operacional** (`/staff`)
Gestão da equipe de segurança com duas categorias:

#### **👮 Operacional (Plantão 12x36)**
Funcionários que trabalham em escala de plantão:
- **Cargos:** Agente de Portaria, Auxiliar de Segurança, Segurança Motorizado, Técnico de Monitoramento
- **Postos:** Portaria A/L/M, Guarita Sul, CCO, Ronda Motorizada, Área Leste, etc.
- **Escalas:** Diurno/Noturno + Dias Pares/Ímpares
- **Gestão de férias CLT:** Períodos aquisitivos, alertas de vencimento (90 dias), controle de gozo
- **Trocas de plantão:** Registro de trocas entre funcionários com aprovação
- **Afastamentos:** Controle de licenças médicas, férias, afastamentos

#### **💼 Administrativo (Horário Comercial)**
Equipe de gestão em horário comercial (segunda a sexta):
- **Cargos:** Gerente, Supervisor, Coordenador do CCO, Analistas, Assistente Administrativo, Jovem Aprendiz
- **Horários:** 06h-16h, 08h-18h, 09h-19h, 10h-20h, 11h-21h, 09h-15h
- **Gestão de férias:** Mesmas regras CLT do operacional
- **Banco de horas:** Registro de horas extras trabalhadas em eventos

---

### 💚 **Gestão de Eventos** (`/events`)
Controle financeiro e operacional dos eventos realizados no estádio.

**Eventos:**
- Cadastro com nome, categoria, status e datas
- **Categorias:** Corporativo, Corrida, Evento Esportivo, Feira, Jogo, Luta, Outro, Religioso, Show, Treinamento
- Timeline de gastos por dia (antes, durante e após o evento)
- Visualização por tipo (pessoal vs aluguel)

**Gastos por Evento:**
- **Categoria Pessoal:** Carregador, Segurança, Ascensorista, Segurança Motorizado
- **Categoria Aluguel:** Fechamento Cego, Gradis
- **Cálculo automático:** plantões × pessoas × valor unitário

**Banco de Horas:**
- Registro de horas por funcionário por evento
- Totais mensais e anuais por colaborador
- Integração com equipe administrativa

**Equipe de Segurança:**
- Cadastro de funcionários com cargo, telefone e e-mail
- Vinculação com banco de horas

**Cobertura de Férias:**
- Registro de seguranças terceirizados contratados por diária
- Cálculo automático de plantões pela escala 12x36
- Campo editável para ajuste manual dos dias a pagar
- Preview em tempo real do total da cobertura

**Relatórios de Eventos:**
- Por evento, por mês, por tipo de pessoal/aluguel e banco de horas
- **Exportação:** PDF (5 páginas) + Excel (6 abas)

---

### 📊 **Relatórios Gerais** (`/reports`)
Visão consolidada de todos os módulos.

**Conteúdo:**
- Resumo executivo com totais de todos os módulos
- Detalhamento de veículos autorizados
- Lista de proprietários
- Veículos terceiros
- Empréstimos de acervo (com totalizador de taxas)
- Eventos (com breakdown de gastos)
- Pessoal operacional (com status e alertas de férias)

**Exportação:**
- **PDF:** 6 páginas completas
- **Excel:** 7 abas (Resumo + 6 módulos detalhados)

---

### 🔐 **Administração de Usuários** (`/admin`) — **Exclusivo para Admins**
Sistema de controle de acesso com dois níveis de permissão:

**Níveis de acesso:**
- **👑 Administrador:** Acesso total (criar, editar, deletar)
- **👤 Operador:** Pode criar, editar e visualizar, mas **não pode deletar**

**Funcionalidades:**
- Criação de novos usuários com email + senha
- Alteração de permissões (admin ↔ operador)
- Ativação/desativação de contas
- Proteção: DELETE bloqueado no frontend + RLS no banco
- Mensagem clara quando operador tenta excluir: "⛔ Sem permissão para excluir. Apenas administradores."

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 18 + Vite 6 |
| **Estilização** | Tailwind CSS |
| **Ícones** | Lucide React |
| **Backend/DB** | Supabase (PostgreSQL) |
| **Autenticação** | Supabase Auth |
| **Segurança DB** | Row Level Security (RLS) + Funções SECURITY DEFINER |
| **PDF** | jsPDF + jspdf-autotable |
| **Excel** | SheetJS (xlsx) |
| **Hospedagem** | Azure Static Web Apps |
| **CI/CD** | GitHub Actions |

---

## 🗄️ Banco de Dados

### **Tabelas principais**
```sql
-- Veículos e Proprietários
vehicles              → veículos cadastrados
owners                → proprietários
third_party_vehicles  → veículos terceiros

-- Empréstimos
loans                 → empréstimos
loan_items            → catálogo de itens do acervo
loan_items_detail     → itens por empréstimo
document_control      → controle de numeração de PDFs

-- Eventos
events                → eventos do estádio
event_expenses        → gastos por evento
security_team         → equipe de segurança (banco de horas)
hour_bank             → registro de horas extras
vacation_expenses     → coberturas de férias

-- Pessoal Operacional
staff                 → funcionários (operacional + administrativo)
staff_vacations       → períodos aquisitivos e gozo de férias CLT
staff_shift_swaps     → trocas de plantão
staff_absences        → afastamentos (licenças, médico, etc.)

-- Segurança
user_roles            → controle de permissões (admin/operador)
audit_logs            → log de auditoria (read-only)
```

### **Views (Security Invoker)**
```sql
v_event_totals        → totais por evento
v_monthly_expenses    → gastos mensais
v_hour_bank_summary   → resumo do banco de horas
v_monthly_hours       → horas mensais por funcionário
```

### **Funções SQL**
```sql
-- Soft Delete
soft_delete_vehicle(uuid)   → exclusão lógica de veículo
restore_vehicle(uuid)       → restauração de veículo
soft_delete_owner(uuid)     → exclusão lógica de proprietário
restore_owner(uuid)         → restauração de proprietário

-- Permissões
is_admin()                  → verifica se usuário é admin
get_user_role()             → retorna role do usuário

-- Auditoria e Timestamps
log_audit()                 → trigger de auditoria
update_updated_at_column()  → trigger de timestamp
```

### **Row Level Security (RLS)**
Todas as tabelas possuem políticas RLS baseadas em roles:

- **SELECT/INSERT/UPDATE:** Todos os usuários autenticados
- **DELETE:** Apenas administradores (`is_admin()`)
- **audit_logs:** Read-only para todos, insert apenas via triggers

---

## 🚀 Começar em 4 passos

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

Acesse: **http://localhost:5173**

---

## 📁 Estrutura do Projeto
```
src/
├── components/
│   ├── VehicleRegistry.jsx         # Orquestrador principal (navegação + CRUD)
│   ├── Dashboard.jsx               # Dashboard executivo (página inicial)
│   ├── vehicle/
│   │   ├── VehicleList.jsx         # Lista + menu lateral + busca
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
│   ├── staff/
│   │   ├── StaffList.jsx           # Lista com abas (Operacional/Administrativo)
│   │   ├── StaffForm.jsx           # Formulário de cadastro (adaptativo)
│   │   └── StaffDetail.jsx         # Detalhe + abas (Dados, Férias, Trocas, Afastamentos)
│   ├── events/
│   │   ├── EventList.jsx           # Lista de eventos (tabela/cards)
│   │   ├── EventForm.jsx           # Formulário de evento
│   │   ├── EventDetail.jsx         # Detalhe + timeline de gastos
│   │   ├── TeamManager.jsx         # Gestão da equipe
│   │   ├── HourBank.jsx            # Banco de horas
│   │   ├── EventReports.jsx        # Relatórios de gastos
│   │   └── VacationList.jsx        # Coberturas de férias
│   ├── admin/
│   │   └── UserManagement.jsx      # Gestão de usuários e permissões
│   ├── reports/
│   │   └── Reports.jsx             # Relatórios gerais (PDF + Excel)
│   └── ui/
│       ├── Modal.jsx               # Modal de confirmação
│       ├── Toast.jsx               # Notificações
│       ├── Header.jsx              # Cabeçalho
│       └── LoadingButton.jsx       # Botão com loading
├── utils/
│   ├── storage.js                  # Todas as operações Supabase (CRUD + Roles)
│   ├── loanPDF.js                  # Geração de PDFs de empréstimo
│   └── vehicleTypes.js             # Configuração de tipos de veículo
├── lib/
│   └── supabase.js                 # Cliente Supabase
├── context/
│   └── AuthContext.jsx             # Contexto de autenticação
├── App.jsx
└── index.css
```

---

## 📱 Responsividade

O sistema é **100% responsivo** com breakpoints adaptados para cada módulo:

| Tela | Comportamento |
|------|---------------|
| **Mobile** (< 1024px) | Cards empilhados, campos de data compactos, botões full-width, menu lateral compacto |
| **Desktop** (≥ 1024px) | Tabelas com colunas, menu lateral expandido, layout em grid, sidebar fixa |

---

## 🔒 Segurança

### **Autenticação**
- Login obrigatório via Supabase Auth
- Proteção de senha com validação de senhas vazadas (HaveIBeenPwned)
- Sessão persistente com refresh token

### **Autorização (RLS + Roles)**
- Policies RLS em todas as tabelas
- Funções `SECURITY DEFINER` para verificação de permissões
- Operadores bloqueados de DELETE no backend (não só no frontend)
- Audit logs protegidos (insert apenas via triggers)

### **Proteção de Dados**
- Ambiente isolado (.env não commitado)
- `anon_key` pública + RLS (sem service_role key no frontend)
- Soft delete para auditoria (nada é deletado permanentemente)

---

## 🌐 Deploy

Deploy automático no Azure via GitHub Actions:
```bash
git add .
git commit -m "Descrição da mudança"
git push origin main
```

Aguarde **3-5 minutos** → Site atualizado automaticamente.

**URL de produção:** [sua-url-azure.com]

---

## 📝 Roadmap

- [ ] Relatórios de férias CLT com vencimentos próximos
- [ ] Integração com leitor de QR Code para acesso veicular
- [ ] Dashboard de KPIs de segurança (tempo médio de resposta, incidentes, etc.)
- [ ] Notificações push para alertas críticos
- [ ] App mobile nativo (React Native)

---

## 📄 Licença

**MIT License** — uso livre para fins comerciais e não-comerciais.

---

## 👤 Autor

**Joel Costa** — Analista de Segurança, Arena BRB  
💼 GitHub: [@jjoelcosta](https://github.com/jjoelcosta)


**Última atualização:** Fevereiro 2026