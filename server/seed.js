const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');
  


  const password = await bcrypt.hash('password123', 10);

  // 1. Admin
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@bharatbazaar.dev',
      phone: '0000000000',
      password,
      role: 'ADMIN',
    },
  });

  // 2. Artisan
  const artisanUser = await prisma.user.create({
    data: {
      name: 'Ramesh (Artisan)',
      email: 'artisan@bharatbazaar.dev',
      phone: '1111111111',
      password,
      role: 'ARTISAN',
      artisan: {
        create: {
          location: 'Varanasi',
          state: 'Uttar Pradesh',
          primaryLanguage: 'Hindi',
          businessType: 'Handicrafts',
        },
      },
    },
    include: { artisan: true },
  });

  // 3. Intern
  const internUser = await prisma.user.create({
    data: {
      name: 'Shivay (Intern)',
      email: 'intern@bharatbazaar.dev',
      phone: '2222222222',
      password,
      role: 'INTERN',
      intern: {
        create: {
          college: 'Delhi University',
          course: 'BBA',
          skills: ['Marketing', 'Social Media', 'Design'],
          location: 'Delhi',
        },
      },
    },
    include: { intern: true },
  });

  // 4. Products for Artisan
  await prisma.product.create({
    data: {
      artisanId: artisanUser.artisan.id,
      title: 'Handmade Bamboo Storage Basket',
      description: 'A handcrafted bamboo basket made using traditional techniques and natural materials.',
      price: 300,
      quantity: 20,
      category: 'Handicrafts',
      tags: ['bamboo', 'handmade', 'eco-friendly'],
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
