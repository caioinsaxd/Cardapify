import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 'dev-restaurant-001' },
    update: {},
    create: {
      id: 'dev-restaurant-001',
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
      restaurantId: restaurant.id,
    },
  });
  console.log(`Created user: ${user.email}`);

  // Create sample categories
  const categories = [
    { id: 'cat-bebidas', name: 'Bebidas' },
    { id: 'cat-lanches', name: 'Lanches' },
    { id: 'cat-sobremesas', name: 'Sobremesas' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        restaurantId: restaurant.id,
      },
    });
  }
  console.log(`Created ${categories.length} categories`);

  // Create sample products
  const products = [
    { id: 'prod-001', name: 'Coca-Cola 600ml', description: 'Refrigerante gelado', price: 4.99, categoryId: 'cat-bebidas' },
    { id: 'prod-002', name: 'Suco de Laranja', description: 'Suco natural', price: 7.90, categoryId: 'cat-bebidas' },
    { id: 'prod-003', name: 'X-Burger', description: 'Hambúrguer com queijo', price: 19.99, categoryId: 'cat-lanches' },
    { id: 'prod-004', name: 'X-Salada', description: 'Hambúrguer com salada', price: 22.90, categoryId: 'cat-lanches' },
    { id: 'prod-005', name: 'Pudim', description: 'Pudim de leite condensado', price: 8.50, categoryId: 'cat-sobremesas' },
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
    { id: 'order-001', tableNumber: 1, status: 'PENDING', total: 24.89, items: [
      { productId: 'prod-001', quantity: 2, price: 4.99 },
      { productId: 'prod-003', quantity: 1, price: 19.99 },
    ]},
    { id: 'order-002', tableNumber: 3, status: 'PREPARING', total: 30.80, items: [
      { productId: 'prod-002', quantity: 2, price: 7.90 },
      { productId: 'prod-004', quantity: 1, price: 22.90 },
    ]},
    { id: 'order-003', tableNumber: 5, status: 'READY', total: 13.40, items: [
      { productId: 'prod-001', quantity: 1, price: 4.99 },
      { productId: 'prod-005', quantity: 1, price: 8.50 },
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
        restaurantId: restaurant.id,
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
