# 🚗 Sistema de Controle de Veículos

> Gerenciamento de veículos de colaboradores que tem acesso ao estacionamento interno do estádio ARENA BRB.

## 📋 **O que é?**

Sistema web responsivo para controle de veículos autorizados em estacionamentos corporativos. Permite gerenciar proprietários, seus veículos e locais autorizados de estacionamento.

**🌐 [Ver Demo ao Vivo](https://blue-forest-0c585dc10.azurestaticapps.net)**

---

## ✨ **Principais Funcionalidades**

- ✅ **Gerenciar Proprietários** - Cadastro com nome, telefone, empresa, cargo e setor
- ✅ **Gerenciar Veículos** - Placa, marca, modelo, tipo e local autorizado
- ✅ **Múltiplos Veículos** - Um proprietário pode ter vários veículos
- ✅ **Tipos de Veículos** - Carro, Moto, Caminhão, Van, Ônibus
- ✅ **12 Locais de Estacionamento** - VIP, Imprensa, Staff, Garagens, etc.
- ✅ **Busca Avançada** - Por placa, proprietário, marca, tipo ou local
- ✅ **Exportação** - CSV (Excel) e JSON
- ✅ **100% Responsivo** - Funciona em desktop, tablet e celular

---

## 🛠️ **Tecnologias**

- **React 18** - Interface interativa
- **Vite 6** - Build ultrarrápido
- **Tailwind CSS** - Estilização moderna
- **Lucide React** - Ícones
- **Azure Static Web Apps** - Hospedagem
- **GitHub Actions** - Deploy automático
- **Supabase** - Backend

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

### **3. Executar**
```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## 💡 **Como Usar**

### **Cadastrar Proprietário**
1. Clique em **"Proprietários"**
2. **"Novo Proprietário"** → Preencha o nome
3. **"Cadastrar"**

### **Cadastrar Veículo**
1. **"Novo Veículo"** → Preencha placa, marca e selecione proprietário
2. Escolha tipo e local autorizado
3. **"Cadastrar"**

### **Buscar**
- Digite na busca ou use filtros (Tipo/Marca/Local)

### **Exportar**
- Clique em **"Exportar CSV"** ou **"Exportar JSON"**

---

## 📁 **Estrutura**

```
controle-veiculos-estadio/
├── src/
│   ├── components/
│   │   └── VehicleRegistry.jsx    # Componente principal
│   ├── App.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── README.md
```

---

## 🌐 **Deploy**

Deploy automático no Azure via GitHub Actions:

```bash
git add .
git commit -m "Descrição"
git push origin main
```

Aguarde 3-5 minutos → Site atualizado automaticamente!

---

## 🗺️ **Roadmap**

**Agora (v1.0)** ✅
- CRUD completo
- Busca e filtros
- Exportação
- Deploy Azure

**Próximo (v1.1)** 🚧
- Animações suaves
- Notificações toast
- Dark mode

**Futuro (v2.0)** 📅
- Banco de dados
- Login Microsoft 365
- Dashboard
- QR Codes
- Relatórios PDF

---

## 📄 **Licença**

MIT License - uso livre

---

## 👤 **Autor**

**Joel Costa**
- GitHub: [@jjoelcosta](https://github.com/jjoelcosta)
- Email: contato@exemplo.com

---

<div align="center">

**⭐ Deixe uma estrela se gostou! **

Feito com ❤️ e ☕

</div>