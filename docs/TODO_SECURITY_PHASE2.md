# 🔒 TODO: Hardening de Segurança - FASE 2

> **Nota:** Implementar após conclusão da FASE 1 (UX/UI + Features Básicas)

---

## 🛡️ RLS Refinements

### **Roles e Permissões**
- [ ] Criar tabela `user_roles` (admin, user, viewer)
- [ ] Implementar verificação de role nas políticas
- [ ] Políticas específicas por role:
  - [ ] Admin: CRUD completo
  - [ ] User: CRUD de veículos/owners
  - [ ] Viewer: Apenas leitura

### **SECURITY DEFINER**
- [ ] Isolar funções críticas com SECURITY DEFINER
- [ ] Criar funções protegidas para:
  - [ ] Soft delete
  - [ ] Restore de registros
  - [ ] Alteração de roles
- [ ] Limitar acesso direto às tabelas

### **Políticas Avançadas**
- [ ] Implementar filtro por departamento/setor
- [ ] Restringir visualização de dados sensíveis
- [ ] Adicionar políticas de tempo (horário de acesso)

---

## 📊 Audit Logs Forense

### **Logs Imutáveis**
- [ ] Criar trigger para garantir imutabilidade
- [ ] Bloquear UPDATE/DELETE em audit_logs via trigger
- [ ] Implementar snapshot de dados completos

### **Rastreamento Avançado**
- [ ] IP Address tracking
  - [ ] Capturar IP real (considerar proxies)
  - [ ] Armazenar geolocalização aproximada
- [ ] User Agent tracking
  - [ ] Browser, OS, Device
  - [ ] Identificar sessões suspeitas
- [ ] Session tracking
  - [ ] Vincular ações à sessão específica
  - [ ] Detectar sessões simultâneas

### **Retention Policy**
- [ ] Definir período de retenção (sugestão: 2 anos)
- [ ] Implementar arquivamento automático
- [ ] Criar backup de logs críticos
- [ ] Política de LGPD para dados pessoais

---

## 👨‍💼 Admin Features

### **Dashboard de Logs Avançado**
- [ ] Filtros por:
  - [ ] Usuário
  - [ ] Tipo de ação
  - [ ] Período
  - [ ] Tabela afetada
  - [ ] IP/Localização
- [ ] Visualização de diff (antes/depois)
- [ ] Exportação de relatórios de auditoria
- [ ] Alertas de ações suspeitas

### **Gestão de Itens Deletados**
- [ ] Tela de "Lixeira"
- [ ] Restaurar registros soft-deleted
- [ ] Excluir permanentemente (hard delete com confirmação)
- [ ] Histórico de restaurações

### **Gestão de Usuários**
- [ ] CRUD de usuários (apenas admin)
- [ ] Alterar roles
- [ ] Suspender/ativar contas
- [ ] Forçar logout
- [ ] Resetar senha
- [ ] Ver sessões ativas

---

## 🔐 Autenticação Avançada

### **Multi-Factor Authentication (MFA)**
- [ ] Implementar TOTP (Google Authenticator)
- [ ] SMS como segundo fator (opcional)
- [ ] Recovery codes

### **Políticas de Senha**
- [ ] Força mínima de senha
- [ ] Expiração de senha (90 dias)
- [ ] Histórico de senhas (não reutilizar últimas 5)
- [ ] Bloqueio após tentativas falhas

### **Sessões**
- [ ] Timeout de inatividade (30 min)
- [ ] Logout automático
- [ ] Sessão única (force logout outras sessões)
- [ ] Refresh token rotation

---

## 📈 Performance e Escalabilidade

### **Otimizações de Query**
- [ ] Implementar paginação real (não carregar tudo)
- [ ] Cache de queries frequentes
- [ ] Índices adicionais baseados em uso real

### **Rate Limiting**
- [ ] Limitar requisições por usuário
- [ ] Proteger contra DDoS
- [ ] Throttle de exports/relatórios

---

## 🧪 Testes de Segurança

### **Penetration Testing**
- [ ] SQL Injection
- [ ] XSS (Cross-Site Scripting)
- [ ] CSRF (Cross-Site Request Forgery)
- [ ] Escalação de privilégios
- [ ] Bypass de autenticação

### **Testes Automatizados**
- [ ] Unit tests para RLS policies
- [ ] Integration tests para audit logs
- [ ] Security regression tests

---

## 📋 Compliance

### **LGPD**
- [ ] Consentimento de coleta de dados
- [ ] Direito ao esquecimento (anonimização)
- [ ] Portabilidade de dados
- [ ] Relatório de dados pessoais coletados

### **Documentação**
- [ ] Política de Privacidade
- [ ] Termos de Uso
- [ ] Manual de Segurança para Admins
- [ ] Procedimento de Incident Response

---

## 🔄 Migration Path (de FASE 1 para FASE 2)

1. **Backup completo** do banco antes de qualquer alteração
2. **Testar em ambiente de staging** primeiro
3. **Implementar gradualmente** (uma seção por vez)
4. **Monitorar logs** após cada mudança
5. **Rollback plan** para cada feature

---

## 📅 Timeline Estimado

| Fase | Duração | Prioridade |
|------|---------|------------|
| RLS Refinements | 2-3 dias | Alta |
| Audit Logs Forense | 1-2 dias | Alta |
| Admin Features | 3-4 dias | Média |
| Autenticação Avançada | 2-3 dias | Média |
| Performance | 1-2 dias | Baixa |
| Testes + Compliance | 2-3 dias | Alta |

**Total estimado:** 2-3 semanas de desenvolvimento

---

## ⚠️ AVISOS IMPORTANTES

- **NÃO implementar FASE 2 até FASE 1 estar 100% completa e testada**
- **Fazer backup antes de qualquer alteração em produção**
- **Testar cada feature individualmente antes de combinar**
- **Documentar cada mudança para auditoria futura**
- **Validar com equipe de TI/Segurança antes de deploy em produção**

---

*Última atualização: Janeiro 2025*