# 💇 Bulir API

## 📋 Sobre o Projeto
API para um sistema de agendamento de serviços que conecta clientes e provedores de serviços, com funcionalidades completas de autenticação, agendamentos, transações financeiras e gestão de usuários.

## 🛠️ Tecnologias Utilizadas
- **Node.js + TypeScript**
- **Express.js** - Framework web
- **Knex.js** - Query builder para SQL
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Criptografia de senhas
- **Yarn** - Gerenciador de pacotes

## 📥 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Yarn
- Git

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd bulir-api-test
```

### 2. Instale as dependências
```bash
yarn install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3333
NODE_ENV=development
JWT_SECRET=SUA-CHAVE-SECRETA
JWT_REFRESH_SECRET=SUA-CHAVE-SECRETA
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=1h
```

## 🗄️ Configuração do Banco de Dados

### Executar Migrations
```bash
yarn knex:migrate
```

### Popular com Dados de Teste
```bash
yarn knex:seed
```

**Ordem de execução dos seeds:**
1. `0000_cleanup.ts` - Limpeza do banco  
2. `0001_users.ts` - Usuários (clientes e provedores)  
3. `0002_seed_services.ts` - Serviços disponíveis  
4. `0003_seed_bookings.ts` - Reservas  
5. `0004_seed_transactions.ts` - Transações financeiras  

## 🏃‍♂️ Executando a Aplicação

### Modo Desenvolvimento
```bash
yarn dev
```
A API estará disponível em: [http://localhost:3333](http://localhost:3333)

### Modo Produção
```bash
yarn build
yarn start
```

## 📚 Comandos Disponíveis

| Comando | Descrição |
|----------|------------|
| `yarn dev` | Executa em modo desenvolvimento |
| `yarn build` | Compila o TypeScript |
| `yarn start` | Executa em produção |
| `yarn knex:migrate` | Executa migrations |
| `yarn knex:rollback` | Reverte última migration |
| `yarn knex:rollback-all` | Reverte todas as migrations |
| `yarn knex:seed` | Executa todos os seeds |
| `yarn test` | Executa testes |

## 👤 Credenciais de Teste

**Cliente:**  
Email: `joao.silva@email.com`  
Senha: `senha123`  

**Provedor:**  
Email: `beatriz.beleza@email.com`  
Senha: `senha123`  

## 🗂️ Estrutura de Dados

### Tabelas Principais
- `users` - Clientes e provedores  
- `services` - Serviços oferecidos  
- `bookings` - Agendamentos  
- `transaction` - Transações financeiras  
- `refresh_tokens` - Tokens de autenticação  

### Categorias de Serviços
- BEAUTY - Beleza e estética  
- HEALTH - Saúde e bem-estar  
- EDUCATION - Educação e aulas  
- TECHNOLOGY - Tecnologia e TI  
- CONSULTING - Consultoria  
- MAINTENANCE - Manutenção  
- EVENTS - Eventos  
- OTHER - Outros serviços  

## 🔧 Scripts de Desenvolvimento

### Reset Completo do Banco
```bash
yarn knex:rollback-all
yarn knex:migrate
yarn knex:seed
```

### Executar Seeds Específicos
```bash
yarn knex:seed --specific=0001_users.ts
```

## 🐛 Solução de Problemas

**Porta 3333 em uso**
```bash
lsof -ti:3333
kill -9 $(lsof -ti:3333)
```

**Problemas com dependências**
```bash
yarn cache clean
yarn install
```

**Erros no banco de dados**
```bash
yarn knex:rollback-all
yarn knex:migrate
yarn knex:seed
```

## 📊 Dados de Exemplo Incluídos
Os seeds criam um ambiente completo para testes:

✅ 12 usuários (5 clientes + 7 provedores)  
✅ 13 serviços em todas as categorias  
✅ 5 reservas com diferentes status  
✅ Histórico completo de transações financeiras  
✅ Saldo inicial para todos os usuários  

## 🚨 Notas Importantes
⚠️ Use **Yarn** - Necessário devido a questões de compatibilidade  
⚠️ **SQLite** - Configurado para desenvolvimento  
⚠️ **Hot Reload** - Ativo no modo dev  
⚠️ **Dados de teste** - Incluem informações realistas para demonstração  

## 📞 Suporte
Em caso de problemas com a execução da aplicação, verifique:
- Versão do Node.js (18+)
- Arquivo `.env` configurado corretamente
- Dependências instaladas com Yarn
- Banco de dados migrado e populado

---
Desenvolvido com ❤️ para o sistema **Bulir**
