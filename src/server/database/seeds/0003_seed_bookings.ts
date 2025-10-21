import type { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { ETableNames } from '../ETableNames';

export async function seed(knex: Knex): Promise<void> {
  console.log('📅 Inserindo reservas...');

  // Buscar um conjunto de clientes e provedores existentes
  const customers = await knex(ETableNames.user)
    .where('type', 'CUSTOMER')
    .limit(5);

  const providers = await knex(ETableNames.user)
    .where('type', 'PROVIDER')
    .limit(5);

  const services = await knex(ETableNames.service).select('id', 'provider_id', 'price').limit(10);

  if (!customers.length || !providers.length || !services.length) {
    console.log('⚠️ Dados insuficientes: verifique se os seeds de usuários e serviços foram executados.');
    return;
  }

  // Gera algumas reservas simuladas
  const now = new Date();

  const bookings = [
    {
      id: uuidv4(),
      service_id: services[0].id,
      customer_id: customers[0].id,
      provider_id: services[0].provider_id,
      booking_date: '2025-10-20',
      start_time: '10:00',
      end_time: '11:00',
      status: 'CONFIRMED',
      total_price: services[0].price,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      service_id: services[1].id,
      customer_id: customers[1].id,
      provider_id: services[1].provider_id,
      booking_date: '2025-10-21',
      start_time: '14:00',
      end_time: '15:00',
      status: 'PENDING',
      total_price: services[1].price,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      service_id: services[2].id,
      customer_id: customers[2].id,
      provider_id: services[2].provider_id,
      booking_date: '2025-10-22',
      start_time: '09:00',
      end_time: '10:00',
      status: 'COMPLETED',
      total_price: services[2].price,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      service_id: services[3].id,
      customer_id: customers[3].id,
      provider_id: services[3].provider_id,
      booking_date: '2025-10-22',
      start_time: '16:00',
      end_time: '17:30',
      status: 'CANCELLED',
      total_price: services[3].price,
      cancellation_reason: 'Cliente não pôde comparecer',
      cancelled_by: 'CUSTOMER',
      cancelled_at: now,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      service_id: services[4].id,
      customer_id: customers[4].id,
      provider_id: services[4].provider_id,
      booking_date: '2025-10-23',
      start_time: '13:00',
      end_time: '14:00',
      status: 'CONFIRMED',
      total_price: services[4].price,
      created_at: now,
      updated_at: now,
    },
  ];

  await knex(ETableNames.bookings).insert(bookings);
  console.log(`✅ ${bookings.length} reservas inseridas com sucesso!`);
}
