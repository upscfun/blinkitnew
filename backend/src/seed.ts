import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', color: '#4ade80', image: 'https://cdn-icons-png.flaticon.com/128/2153/2153788.png', displayOrder: 1 },
  { name: 'Dairy & Breakfast', slug: 'dairy-breakfast', color: '#facc15', image: 'https://cdn-icons-png.flaticon.com/128/3051/3051716.png', displayOrder: 2 },
  { name: 'Munchies', slug: 'munchies', color: '#f97316', image: 'https://cdn-icons-png.flaticon.com/128/1046/1046747.png', displayOrder: 3 },
  { name: 'Cold Drinks & Juices', slug: 'cold-drinks-juices', color: '#38bdf8', image: 'https://cdn-icons-png.flaticon.com/128/2405/2405479.png', displayOrder: 4 },
  { name: 'Instant & Frozen Food', slug: 'instant-frozen', color: '#a78bfa', image: 'https://cdn-icons-png.flaticon.com/128/3480/3480823.png', displayOrder: 5 },
  { name: 'Tea, Coffee & Health', slug: 'tea-coffee-health', color: '#6d4c41', image: 'https://cdn-icons-png.flaticon.com/128/751/751621.png', displayOrder: 6 },
  { name: 'Bakery & Biscuits', slug: 'bakery-biscuits', color: '#fbbf24', image: 'https://cdn-icons-png.flaticon.com/128/3082/3082060.png', displayOrder: 7 },
  { name: 'Sweet Tooth', slug: 'sweet-tooth', color: '#f472b6', image: 'https://cdn-icons-png.flaticon.com/128/2454/2454295.png', displayOrder: 8 },
  { name: 'Atta, Rice & Dal', slug: 'atta-rice-dal', color: '#d97706', image: 'https://cdn-icons-png.flaticon.com/128/1046/1046751.png', displayOrder: 9 },
  { name: 'Masala, Oil & Dry Fruits', slug: 'masala-oil', color: '#ef4444', image: 'https://cdn-icons-png.flaticon.com/128/2276/2276931.png', displayOrder: 10 },
  { name: 'Cleaning Essentials', slug: 'cleaning', color: '#06b6d4', image: 'https://cdn-icons-png.flaticon.com/128/2913/2913465.png', displayOrder: 11 },
  { name: 'Personal Care', slug: 'personal-care', color: '#ec4899', image: 'https://cdn-icons-png.flaticon.com/128/3081/3081559.png', displayOrder: 12 },
];

async function main() {
  console.log('Seeding database...');

  // Admin user
  await prisma.user.upsert({
    where: { email: 'admin@blinkmart.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@blinkmart.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  });

  // Test user
  await prisma.user.upsert({
    where: { email: 'user@blinkmart.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@blinkmart.com',
      password: await bcrypt.hash('user123', 10),
      phone: '9876543210',
    },
  });

  // Categories
  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.slug] = created.id;
  }

  // Products
  const products = [
    // Fruits & Vegetables
    { name: 'Fresh Tomatoes', price: 29, mrp: 35, stock: 100, unit: '500g', brand: 'Farm Fresh', categorySlug: 'fruits-vegetables', tags: ['tomato', 'vegetables'], images: ['https://cdn-icons-png.flaticon.com/128/415/415733.png'] },
    { name: 'Banana', price: 39, mrp: 45, stock: 80, unit: '6 pcs', brand: 'Farm Fresh', categorySlug: 'fruits-vegetables', tags: ['fruit', 'banana'], images: ['https://cdn-icons-png.flaticon.com/128/415/415713.png'] },
    { name: 'Red Apple', price: 99, mrp: 120, stock: 60, unit: '4 pcs (~500g)', brand: 'Fresho', categorySlug: 'fruits-vegetables', tags: ['fruit', 'apple'], images: ['https://cdn-icons-png.flaticon.com/128/415/415682.png'] },
    { name: 'Onion', price: 25, mrp: 30, stock: 200, unit: '1 kg', brand: 'Farm Fresh', categorySlug: 'fruits-vegetables', tags: ['onion', 'vegetables'], images: ['https://cdn-icons-png.flaticon.com/128/415/415728.png'] },
    { name: 'Spinach', price: 19, mrp: 25, stock: 50, unit: '250g', brand: 'Organic India', categorySlug: 'fruits-vegetables', tags: ['green', 'leafy'], images: ['https://cdn-icons-png.flaticon.com/128/415/415730.png'] },
    { name: 'Mango (Alphonso)', price: 149, mrp: 180, stock: 30, unit: '4 pcs (~600g)', brand: 'Farm Fresh', categorySlug: 'fruits-vegetables', tags: ['fruit', 'mango'], images: ['https://cdn-icons-png.flaticon.com/128/415/415683.png'] },

    // Dairy & Breakfast
    { name: 'Amul Toned Milk', price: 28, mrp: 28, stock: 150, unit: '500ml', brand: 'Amul', categorySlug: 'dairy-breakfast', tags: ['milk', 'dairy'], images: ['https://cdn-icons-png.flaticon.com/128/3051/3051716.png'] },
    { name: 'Amul Butter', price: 55, mrp: 58, stock: 80, unit: '100g', brand: 'Amul', categorySlug: 'dairy-breakfast', tags: ['butter', 'dairy'], images: ['https://cdn-icons-png.flaticon.com/128/3051/3051716.png'] },
    { name: 'Britannia Cheese Slices', price: 95, mrp: 100, stock: 60, unit: '10 slices', brand: 'Britannia', categorySlug: 'dairy-breakfast', tags: ['cheese', 'dairy'], images: ['https://cdn-icons-png.flaticon.com/128/3480/3480823.png'] },
    { name: 'Epigamia Greek Yogurt', price: 55, mrp: 60, stock: 45, unit: '90g', brand: 'Epigamia', categorySlug: 'dairy-breakfast', tags: ['yogurt', 'protein'], images: ['https://cdn-icons-png.flaticon.com/128/3051/3051716.png'] },
    { name: 'Cornflakes', price: 149, mrp: 170, stock: 70, unit: '500g', brand: "Kellogg's", categorySlug: 'dairy-breakfast', tags: ['breakfast', 'cereal'], images: ['https://cdn-icons-png.flaticon.com/128/1046/1046751.png'] },

    // Munchies
    { name: "Lay's Classic Salted", price: 20, mrp: 20, stock: 200, unit: '52g', brand: "Lay's", categorySlug: 'munchies', tags: ['chips', 'snacks'], images: ['https://cdn-icons-png.flaticon.com/128/1046/1046747.png'] },
    { name: 'Doritos Nacho Cheese', price: 30, mrp: 30, stock: 150, unit: '70g', brand: 'Doritos', categorySlug: 'munchies', tags: ['chips', 'nacho'], images: ['https://cdn-icons-png.flaticon.com/128/1046/1046747.png'] },
    { name: 'Kurkure Masala Munch', price: 10, mrp: 10, stock: 300, unit: '22g', brand: 'Kurkure', categorySlug: 'munchies', tags: ['snacks', 'masala'], images: ['https://cdn-icons-png.flaticon.com/128/1046/1046747.png'] },
    { name: 'Bikaji Bikaneri Bhujia', price: 65, mrp: 70, stock: 100, unit: '200g', brand: 'Bikaji', categorySlug: 'munchies', tags: ['bhujia', 'namkeen'], images: ['https://cdn-icons-png.flaticon.com/128/1046/1046747.png'] },

    // Cold Drinks & Juices
    { name: 'Coca-Cola', price: 40, mrp: 40, stock: 200, unit: '600ml', brand: 'Coca-Cola', categorySlug: 'cold-drinks-juices', tags: ['soda', 'cola'], images: ['https://cdn-icons-png.flaticon.com/128/2405/2405479.png'] },
    { name: 'Tropicana Orange', price: 65, mrp: 75, stock: 100, unit: '1L', brand: 'Tropicana', categorySlug: 'cold-drinks-juices', tags: ['juice', 'orange'], images: ['https://cdn-icons-png.flaticon.com/128/2405/2405479.png'] },
    { name: 'Red Bull Energy Drink', price: 125, mrp: 130, stock: 80, unit: '250ml', brand: 'Red Bull', categorySlug: 'cold-drinks-juices', tags: ['energy', 'drink'], images: ['https://cdn-icons-png.flaticon.com/128/2405/2405479.png'] },
    { name: 'Appy Fizz', price: 25, mrp: 25, stock: 150, unit: '250ml', brand: 'Parle Agro', categorySlug: 'cold-drinks-juices', tags: ['juice', 'apple'], images: ['https://cdn-icons-png.flaticon.com/128/2405/2405479.png'] },

    // Instant & Frozen
    { name: 'Maggi 2-Minute Noodles', price: 14, mrp: 14, stock: 500, unit: '70g', brand: 'Maggi', categorySlug: 'instant-frozen', tags: ['noodles', 'instant'], images: ['https://cdn-icons-png.flaticon.com/128/3480/3480823.png'] },
    { name: 'McCain French Fries', price: 145, mrp: 155, stock: 60, unit: '420g', brand: 'McCain', categorySlug: 'instant-frozen', tags: ['frozen', 'fries'], images: ['https://cdn-icons-png.flaticon.com/128/3480/3480823.png'] },
    { name: 'Ching\'s Secret Schezwan Noodles', price: 30, mrp: 35, stock: 120, unit: '60g', brand: "Ching's", categorySlug: 'instant-frozen', tags: ['noodles', 'schezwan'], images: ['https://cdn-icons-png.flaticon.com/128/3480/3480823.png'] },

    // Tea, Coffee
    { name: 'Tata Tea Premium', price: 145, mrp: 155, stock: 90, unit: '250g', brand: 'Tata Tea', categorySlug: 'tea-coffee-health', tags: ['tea', 'tata'], images: ['https://cdn-icons-png.flaticon.com/128/751/751621.png'] },
    { name: 'Nescafe Classic', price: 219, mrp: 235, stock: 70, unit: '100g', brand: 'Nescafe', categorySlug: 'tea-coffee-health', tags: ['coffee', 'instant'], images: ['https://cdn-icons-png.flaticon.com/128/751/751621.png'] },
    { name: 'Bournvita', price: 209, mrp: 225, stock: 80, unit: '500g', brand: 'Cadbury', categorySlug: 'tea-coffee-health', tags: ['health', 'chocolate'], images: ['https://cdn-icons-png.flaticon.com/128/751/751621.png'] },

    // Bakery
    { name: 'Britannia 5050 Biscuits', price: 30, mrp: 35, stock: 200, unit: '150g', brand: 'Britannia', categorySlug: 'bakery-biscuits', tags: ['biscuit', 'sweet'], images: ['https://cdn-icons-png.flaticon.com/128/3082/3082060.png'] },
    { name: 'Parle-G Biscuits', price: 10, mrp: 10, stock: 500, unit: '100g', brand: 'Parle', categorySlug: 'bakery-biscuits', tags: ['biscuit', 'glucose'], images: ['https://cdn-icons-png.flaticon.com/128/3082/3082060.png'] },
    { name: 'English Oven Sandwich Bread', price: 45, mrp: 50, stock: 60, unit: '400g', brand: 'English Oven', categorySlug: 'bakery-biscuits', tags: ['bread', 'sandwich'], images: ['https://cdn-icons-png.flaticon.com/128/3082/3082060.png'] },

    // Sweet Tooth
    { name: 'Dairy Milk Silk', price: 89, mrp: 95, stock: 120, unit: '60g', brand: 'Cadbury', categorySlug: 'sweet-tooth', tags: ['chocolate', 'cadbury'], images: ['https://cdn-icons-png.flaticon.com/128/2454/2454295.png'] },
    { name: 'KitKat', price: 30, mrp: 30, stock: 200, unit: '37g', brand: 'Nestle', categorySlug: 'sweet-tooth', tags: ['chocolate', 'wafer'], images: ['https://cdn-icons-png.flaticon.com/128/2454/2454295.png'] },
    { name: 'Ferrero Rocher (3 pcs)', price: 99, mrp: 110, stock: 50, unit: '37.5g', brand: 'Ferrero', categorySlug: 'sweet-tooth', tags: ['chocolate', 'premium'], images: ['https://cdn-icons-png.flaticon.com/128/2454/2454295.png'] },

    // Atta, Rice, Dal
    { name: "Aashirvaad Atta", price: 259, mrp: 275, stock: 100, unit: '5kg', brand: 'Aashirvaad', categorySlug: 'atta-rice-dal', tags: ['atta', 'flour'], images: ['https://cdn-icons-png.flaticon.com/128/1046/1046751.png'] },
    { name: 'India Gate Basmati Rice', price: 349, mrp: 370, stock: 80, unit: '5kg', brand: 'India Gate', categorySlug: 'atta-rice-dal', tags: ['rice', 'basmati'], images: ['https://cdn-icons-png.flaticon.com/128/1046/1046751.png'] },
    { name: 'Tata Dal (Toor)', price: 159, mrp: 170, stock: 120, unit: '1kg', brand: 'Tata', categorySlug: 'atta-rice-dal', tags: ['dal', 'toor'], images: ['https://cdn-icons-png.flaticon.com/128/1046/1046751.png'] },

    // Masala, Oil
    { name: 'MDH Garam Masala', price: 75, mrp: 80, stock: 100, unit: '100g', brand: 'MDH', categorySlug: 'masala-oil', tags: ['masala', 'spice'], images: ['https://cdn-icons-png.flaticon.com/128/2276/2276931.png'] },
    { name: 'Fortune Sunflower Oil', price: 179, mrp: 195, stock: 90, unit: '1L', brand: 'Fortune', categorySlug: 'masala-oil', tags: ['oil', 'cooking'], images: ['https://cdn-icons-png.flaticon.com/128/2276/2276931.png'] },

    // Cleaning
    { name: 'Vim Dishwash Liquid', price: 99, mrp: 110, stock: 80, unit: '500ml', brand: 'Vim', categorySlug: 'cleaning', tags: ['dishwash', 'cleaning'], images: ['https://cdn-icons-png.flaticon.com/128/2913/2913465.png'] },
    { name: 'Harpic Power Plus', price: 79, mrp: 90, stock: 70, unit: '500ml', brand: 'Harpic', categorySlug: 'cleaning', tags: ['toilet', 'cleaner'], images: ['https://cdn-icons-png.flaticon.com/128/2913/2913465.png'] },
    { name: 'Surf Excel Quick Wash', price: 119, mrp: 130, stock: 100, unit: '500g', brand: 'Surf Excel', categorySlug: 'cleaning', tags: ['detergent', 'laundry'], images: ['https://cdn-icons-png.flaticon.com/128/2913/2913465.png'] },

    // Personal Care
    { name: 'Dove Body Lotion', price: 225, mrp: 245, stock: 60, unit: '250ml', brand: 'Dove', categorySlug: 'personal-care', tags: ['lotion', 'skin'], images: ['https://cdn-icons-png.flaticon.com/128/3081/3081559.png'] },
    { name: 'Colgate MaxFresh Toothpaste', price: 99, mrp: 110, stock: 120, unit: '150g', brand: 'Colgate', categorySlug: 'personal-care', tags: ['toothpaste', 'dental'], images: ['https://cdn-icons-png.flaticon.com/128/3081/3081559.png'] },
    { name: 'Head & Shoulders Shampoo', price: 175, mrp: 190, stock: 80, unit: '340ml', brand: 'Head & Shoulders', categorySlug: 'personal-care', tags: ['shampoo', 'hair'], images: ['https://cdn-icons-png.flaticon.com/128/3081/3081559.png'] },
  ];

  for (const p of products) {
    const { categorySlug, ...data } = p;
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        ...data,
        slug,
        description: `High quality ${data.name} from ${data.brand}`,
        categoryId: createdCategories[categorySlug],
      },
    });
  }

  // Sample coupons
  await prisma.coupon.upsert({
    where: { code: 'WELCOME50' },
    update: {},
    create: {
      code: 'WELCOME50',
      description: '50% off on first order',
      discount: 50,
      type: 'PERCENT',
      minOrder: 99,
      maxDiscount: 100,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FLAT30' },
    update: {},
    create: {
      code: 'FLAT30',
      description: 'Flat ₹30 off on orders above ₹199',
      discount: 30,
      type: 'FLAT',
      minOrder: 199,
      isActive: true,
    },
  });

  console.log('Seeding complete!');
  console.log('Admin: admin@blinkmart.com / admin123');
  console.log('User:  user@blinkmart.com  / user123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
