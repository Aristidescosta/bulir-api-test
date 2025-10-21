// seeds/001_seed_services.ts
import type { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { ETableNames } from '../ETableNames';
import { EServiceCategory, EServiceStatus } from '../../../types/service';

export async function seed(knex: Knex): Promise<void> {


  const providers = await knex(ETableNames.user)
    .where('type', 'PROVIDER')
    .limit(5);

  if (providers.length === 0) {
    console.log('Nenhum provedor encontrado. Execute os seeds de usuários primeiro.');
    return;
  }

  await knex(ETableNames.service).insert([
    {
      id: uuidv4(),
      provider_id: providers[0].id,
      name: 'Corte de Cabelo Feminino',
      description: 'Corte e modelagem profissional para cabelos femininos com lavagem incluída',
      category: EServiceCategory.BEAUTY,
      duration: 60,
      price: 45.00,
      status: EServiceStatus.ACTIVE,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: uuidv4(),
      provider_id: providers[0].id,
      name: 'Manicure e Pedicure',
      description: 'Serviço completo de manicure e pedicure com esmaltação',
      category: EServiceCategory.BEAUTY,
      duration: 90,
      price: 35.00,
      status: EServiceStatus.ACTIVE,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },

    {
      id: uuidv4(),
      provider_id: providers[1].id,
      name: 'Massagem Relaxante',
      description: 'Sessão de massagem relaxante de 60 minutos para alívio do estresse',
      category: EServiceCategory.HEALTH,
      duration: 60,
      price: 80.00,
      status: EServiceStatus.ACTIVE,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: uuidv4(),
      provider_id: providers[1].id,
      name: 'Consulta de Nutrição',
      description: 'Avaliação nutricional completa e plano alimentar personalizado',
      category: EServiceCategory.HEALTH,
      duration: 45,
      price: 120.00,
      status: EServiceStatus.ACTIVE,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },

    // Serviços de EDUCAÇÃO (EDUCATION)
    {
      id: uuidv4(),
      provider_id: providers[2].id,
      name: 'Aula de Inglês Básico',
      description: 'Aula particular de inglês para iniciantes - 1 hora',
      category: EServiceCategory.EDUCATION,
      duration: 60,
      price: 50.00,
      status: EServiceStatus.ACTIVE,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: uuidv4(),
      provider_id: providers[2].id,
      name: 'Reforço Escolar - Matemática',
      description: 'Aula de reforço em matemática para ensino fundamental',
      category: EServiceCategory['EDUCATION'],
      duration: 90,
      price: 70.00,
      status: EServiceStatus.ACTIVE,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },

    // Serviços de TECNOLOGIA (TECHNOLOGY)
    {
      id: uuidv4(),
      provider_id: providers[3].id,
      name: 'Formatação de Computador',
      description: 'Formatação e instalação do sistema operacional com backup de dados',
      category: EServiceCategory['TECHNOLOGY'],
      duration: 120,
      price: 100.00,
      status: EServiceStatus.ACTIVE,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: uuidv4(),
      provider_id: providers[3].id,
      name: 'Desenvolvimento Website',
      description: 'Criação de website responsivo com 5 páginas',
      category: EServiceCategory['TECHNOLOGY'],
      duration: 480,
      price: 1500.00,
      status: EServiceStatus.ACTIVE,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },

    // Serviços de CONSULTORIA (CONSULTING)
    {
      id: uuidv4(),
      provider_id: providers[4].id,
      name: 'Consultoria Empresarial',
      description: 'Análise e planejamento estratégico para pequenas empresas',
      category: EServiceCategory['CONSULTING'],
      duration: 120,
      price: 300.00,
      status: EServiceStatus.ACTIVE,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },

    // Serviços de MANUTENÇÃO (MAINTENANCE)
    {
      id: uuidv4(),
      provider_id: providers[0].id,
      name: 'Instalação de Ar Condicionado',
      description: 'Instalação profissional de ar condicionado split',
      category: EServiceCategory['MAINTENANCE'],
      duration: 180,
      price: 200.00,
      status: EServiceStatus.ACTIVE,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },

    // Serviços de EVENTOS (EVENTS)
    {
      id: uuidv4(),
      provider_id: providers[1].id,
      name: 'Fotografia para Eventos',
      description: 'Cobertura fotográfica para eventos de até 4 horas',
      category: EServiceCategory['EVENTS'],
      duration: 240,
      price: 500.00,
      status: EServiceStatus.ACTIVE,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },

    // Serviços OUTROS (OTHER)
    {
      id: uuidv4(),
      provider_id: providers[2].id,
      name: 'Organização Residencial',
      description: 'Serviço de organização e arrumação de residências',
      category: EServiceCategory['OTHER'],
      duration: 240,
      price: 150.00,
      status: EServiceStatus.ACTIVE,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },

    // Alguns serviços INACTIVE para teste
    {
      id: uuidv4(),
      provider_id: providers[3].id,
      name: 'Serviço Temporariamente Indisponível',
      description: 'Este serviço está temporariamente fora do ar',
      category: EServiceCategory['TECHNOLOGY'],
      duration: 60,
      price: 75.00,
      status: EServiceStatus['INACTIVE'],
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);

  console.log(`# Inserted seeds into ${ETableNames.service}`);
}