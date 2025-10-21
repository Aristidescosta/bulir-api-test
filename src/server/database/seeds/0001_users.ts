import { Knex } from 'knex';
import { ETableNames } from '../ETableNames';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { EUserStatus, EUserType } from '../../../types/user';

export async function seed(knex: Knex): Promise<void> {
  console.log('👥 Inserindo usuários...');

  // Hash da senha padrão
  const passwordHash = await bcrypt.hash('senha123', 10);

  const users = [
    // ========== CLIENTES ==========
    {
      id: uuidv4(),
      name: 'João Silva',
      email: 'joao.silva@email.com',
      nif: '00000000001',
      password_hash: passwordHash,
      phone: '923456789',
      type: EUserType.CUSTOMER,
      balance: 50000.0,
      status: EUserStatus.ACTIVE,
    },
    {
      id: uuidv4(),
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      nif: '00000000002',
      password_hash: passwordHash,
      phone: '924567890',
      type: EUserType.CUSTOMER,
      balance: 75000.0,
      status: EUserStatus.ACTIVE,
    },
    {
      id: uuidv4(),
      name: 'Pedro Costa',
      email: 'pedro.costa@email.com',
      nif: '00000000003',
      password_hash: passwordHash,
      phone: '925678901',
      type: EUserType.CUSTOMER,
      balance: 30000.0,
      status: EUserStatus.ACTIVE,
    },
    {
      id: uuidv4(),
      name: 'Ana Ferreira',
      email: 'ana.ferreira@email.com',
      nif: '00000000004',
      password_hash: passwordHash,
      phone: '926789012',
      type: EUserType.CUSTOMER,
      balance: 100000.0,
      status: EUserStatus.ACTIVE,
    },
    {
      id: uuidv4(),
      name: 'Carlos Mendes',
      email: 'carlos.mendes@email.com',
      nif: '00000000005',
      password_hash: passwordHash,
      phone: '927890123',
      type: EUserType.CUSTOMER,
      balance: 45000.0,
      status: EUserStatus.ACTIVE,
    },

    // ========== PROVEDORES ==========
    {
      id: uuidv4(),
      name: 'Beatriz Beleza & Estética',
      email: 'beatriz.beleza@email.com',
      nif: '00000000101',
      password_hash: passwordHash,
      phone: '928901234',
      type: EUserType.PROVIDER,
      balance: 200000.0,
      status: EUserStatus.ACTIVE,
    },
    {
      id: uuidv4(),
      name: 'Dr. Ricardo Saúde',
      email: 'ricardo.saude@email.com',
      nif: '00000000102',
      password_hash: passwordHash,
      phone: '929012345',
      type: EUserType.PROVIDER,
      balance: 250000.0,
      status: EUserStatus.ACTIVE,
    },
    {
      id: uuidv4(),
      name: 'Professora Juliana',
      email: 'juliana.educacao@email.com',
      nif: '00000000103',
      password_hash: passwordHash,
      phone: '930123456',
      type: EUserType.PROVIDER,
      balance: 120000.0,
      status: EUserStatus.ACTIVE,
    },
    {
      id: uuidv4(),
      name: 'TechFix Solutions',
      email: 'techfix@email.com',
      nif: '00000000104',
      password_hash: passwordHash,
      phone: '931234567',
      type: EUserType.PROVIDER,
      balance: 180000.0,
      status: EUserStatus.ACTIVE,
    },
    {
      id: uuidv4(),
      name: 'Consultoria BusinessPro',
      email: 'businesspro@email.com',
      nif: '00000000105',
      password_hash: passwordHash,
      phone: '932345678',
      type: EUserType.PROVIDER,
      balance: 300000.0,
      status: EUserStatus.ACTIVE,
    },
    {
      id: uuidv4(),
      name: 'Manutenção Total',
      email: 'manutencao.total@email.com',
      nif: '00000000106',
      password_hash: passwordHash,
      phone: '933456789',
      type: EUserType.PROVIDER,
      balance: 150000.0,
      status: EUserStatus.ACTIVE,
    },
    {
      id: uuidv4(),
      name: 'Eventos Premium',
      email: 'eventos.premium@email.com',
      nif: '00000000107',
      password_hash: passwordHash,
      phone: '934567890',
      type: EUserType.PROVIDER,
      balance: 220000.0,
      status: EUserStatus.ACTIVE,
    },
  ];

  await knex(ETableNames.user).insert(users);

  console.log(`✅ ${users.length} usuários inseridos!`);
  console.log('\n🔑 Credenciais de acesso:');
  console.log('   Email: joao.silva@email.com | Senha: senha123 (Cliente)');
  console.log('   Email: beatriz.beleza@email.com | Senha: senha123 (Provedor)');
}
