import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440000' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Restaurante Demo',
      address: 'Rua Exemplo, 123 - São Paulo, SP',
      settings: {},
    },
  });
  console.log(`Created restaurant: ${restaurant.name}`);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'admin@cardapify.dev' },
    update: {},
    create: {
      email: 'admin@cardapify.dev',
      password: hashedPassword,
      role: 'ADMIN',
      restaurantId: '550e8400-e29b-41d4-a716-446655440000',
    },
  });
  console.log(`Created user: ${user.email}`);

  // Create sample categories
  const categories = [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Bebidas' },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Lanches' },
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Sobremesas' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        restaurantId: '550e8400-e29b-41d4-a716-446655440000',
      },
    });
  }
  console.log(`Created ${categories.length} categories`);

  // Create sample products
  const products = [
    { id: '550e8400-e29b-41d4-a716-446655440011', name: 'Coca-Cola 600ml', description: 'Refrigerante gelado', price: 4.99, categoryId: '550e8400-e29b-41d4-a716-446655440001' },
    { id: '550e8400-e29b-41d4-a716-446655440012', name: 'Suco de Laranja', description: 'Suco natural', price: 7.90, categoryId: '550e8400-e29b-41d4-a716-446655440001' },
    { id: '550e8400-e29b-41d4-a716-446655440013', name: 'X-Burger', description: 'Hambúrguer com queijo', price: 19.99, categoryId: '550e8400-e29b-41d4-a716-446655440002' },
    { id: '550e8400-e29b-41d4-a716-446655440014', name: 'X-Salada', description: 'Hambúrguer com salada', price: 22.90, categoryId: '550e8400-e29b-41d4-a716-446655440002' },
    { id: '550e8400-e29b-41d4-a716-446655440015', name: 'Pudim', description: 'Pudim de leite condensado', price: 8.50, categoryId: '550e8400-e29b-41d4-a716-446655440003' },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {},
      create: {
        id: prod.id,
        name: prod.name,
        description: prod.description,
        price: prod.price,
        categoryId: prod.categoryId,
        isActive: true,
      },
    });
  }
  console.log(`Created ${products.length} products`);

  // Create sample orders
  const orders = [
    { id: '550e8400-e29b-41d4-a716-446655440021', tableNumber: 1, status: 'PENDING', total: 24.89, items: [
      { productId: '550e8400-e29b-41d4-a716-446655440011', quantity: 2, price: 4.99 },
      { productId: '550e8400-e29b-41d4-a716-446655440013', quantity: 1, price: 19.99 },
    ]},
    { id: '550e8400-e29b-41d4-a716-446655440022', tableNumber: 3, status: 'PREPARING', total: 30.80, items: [
      { productId: '550e8400-e29b-41d4-a716-446655440012', quantity: 2, price: 7.90 },
      { productId: '550e8400-e29b-41d4-a716-446655440014', quantity: 1, price: 22.90 },
    ]},
    { id: '550e8400-e29b-41d4-a716-446655440023', tableNumber: 5, status: 'READY', total: 13.40, items: [
      { productId: '550e8400-e29b-41d4-a716-446655440011', quantity: 1, price: 4.99 },
      { productId: '550e8400-e29b-41d4-a716-446655440015', quantity: 1, price: 8.50 },
    ]},
  ];

  for (const order of orders) {
    await prisma.order.upsert({
      where: { id: order.id },
      update: {},
      create: {
        id: order.id,
        tableNumber: order.tableNumber,
        status: order.status as any,
        total: order.total,
        restaurantId: '550e8400-e29b-41d4-a716-446655440000',
        items: {
          createMany: {
            data: order.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      },
    });
  }
  console.log(`Created ${orders.length} orders`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
