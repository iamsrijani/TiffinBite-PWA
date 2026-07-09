import mongoose from 'mongoose';
import User from '../models/User.js';
import Menu from '../models/Menu.js';
import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';
import Wallet from '../models/Wallet.js';
import env from '../config/env.js';

// Setup connection
const MONGODB_URI = env.MONGODB_URI || 'mongodb://localhost:27017/dailybite';

const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clean old data
    await User.deleteMany({});
    await Menu.deleteMany({});
    await Subscription.deleteMany({});
    await Order.deleteMany({});
    await Wallet.deleteMany({});
    console.log('🗑️ Cleaned existing database collections');

    // 1. Create Users
    console.log('👤 Creating users (Admin, Delivery, Customers)...');
    
    const admin = await User.create({
      phone: '9999999999',
      name: 'DailyBite Kitchen Admin',
      email: 'admin@dailybite.com',
      role: 'admin',
      addresses: [{
        label: 'Kitchen Head Office',
        line1: '101, Food Tech Park',
        line2: 'Sector 62',
        city: 'Noida',
        pincode: '201301',
        coordinates: { lat: 28.62, lng: 77.36 }
      }]
    });
    await Wallet.create({ user: admin._id, balance: 1000000 }); // ₹10,000 for admin

    const delivery = await User.create({
      phone: '8888888888',
      name: 'Raju Delivery Partner',
      email: 'raju@dailybite.com',
      role: 'delivery',
      addresses: [{
        label: 'Base Station',
        line1: 'Kitchen Dispatch Center',
        line2: 'Sector 62',
        city: 'Noida',
        pincode: '201301',
        coordinates: { lat: 28.62, lng: 77.36 }
      }]
    });
    await Wallet.create({ user: delivery._id, balance: 20000 }); // ₹200 wallet for delivery rider

    // Customer 1: Aarav Sharma (Corporate, Veg, Medium Spice)
    const aarav = await User.create({
      phone: '7777777777',
      name: 'Aarav Sharma',
      email: 'aarav@gmail.com',
      role: 'customer',
      addresses: [
        {
          label: 'Work',
          line1: 'Tower B, Tech Boulevard',
          line2: 'Sector 127',
          city: 'Noida',
          pincode: '201304',
          coordinates: { lat: 28.53, lng: 77.34 }
        },
        {
          label: 'Home',
          line1: 'Flat 402, Lotus Boulevard',
          line2: 'Sector 100',
          city: 'Noida',
          pincode: '201301',
          coordinates: { lat: 28.55, lng: 77.35 }
        }
      ],
      dietaryPreferences: {
        type: 'veg',
        allergies: ['Peanuts'],
        spiceLevel: 'medium',
        calorieTarget: 2100
      }
    });
    await Wallet.create({ user: aarav._id, balance: 500000 }); // ₹5,000 wallet

    // Customer 2: Neha Patel (Working Couple, Nonveg, Mild Spice)
    const neha = await User.create({
      phone: '6666666666',
      name: 'Neha Patel',
      email: 'neha@gmail.com',
      role: 'customer',
      addresses: [{
        label: 'Home',
        line1: 'Villa 12, Jaypee Greens',
        line2: 'Sector 128',
        city: 'Noida',
        pincode: '201304',
        coordinates: { lat: 28.52, lng: 77.37 }
      }],
      dietaryPreferences: {
        type: 'nonveg',
        allergies: [],
        spiceLevel: 'mild',
        calorieTarget: 1800
      }
    });
    await Wallet.create({ user: neha._id, balance: 800000 }); // ₹8,000 wallet

    // Customer 3: Vikram Singh (Fitness Enthusiast, Vegan, High Protein)
    const vikram = await User.create({
      phone: '5555555555',
      name: 'Vikram Singh',
      email: 'vikram.fit@gmail.com',
      role: 'customer',
      addresses: [{
        label: 'Home',
        line1: 'A-78, Supertech Capetown',
        line2: 'Sector 74',
        city: 'Noida',
        pincode: '201301',
        coordinates: { lat: 28.59, lng: 77.39 }
      }],
      dietaryPreferences: {
        type: 'vegan',
        allergies: ['Gluten'],
        spiceLevel: 'spicy',
        calorieTarget: 2500
      }
    });
    await Wallet.create({ user: vikram._id, balance: 350000 }); // ₹3,500 wallet

    console.log('✅ Users & Wallets Seeded');

    // 2. Generate Menus (14 days: past 7 days to future 7 days)
    console.log('🍱 Generating 14-day Menus...');
    const now = new Date();
    
    const lunchItems = [
      {
        name: 'Tawa Roti & Dal Tadka',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600',
        description: '3 Whole wheat rotis served with comforting yellow dal tadka, jeera rice, and cucumber salad.',
        category: 'veg',
        calories: 550,
        protein: 18,
        carbs: 85,
        fat: 14,
        tags: ['high-fiber', 'home-style'],
      },
      {
        name: 'Paneer Butter Masala Combo',
        image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=600',
        description: 'Soft cottage cheese cubes in rich tomato gravy, served with 2 butter rotis, peas pulao, and pickle.',
        category: 'veg',
        calories: 680,
        protein: 22,
        carbs: 78,
        fat: 26,
        tags: ['popular', 'rich'],
      },
      {
        name: 'Tofu Bhurji & Brown Rice (Vegan)',
        image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600',
        description: 'Crumbled tofu sauteed with capsicum and spices, served with nutrient-dense brown rice and steamed broccoli.',
        category: 'vegan',
        calories: 490,
        protein: 24,
        carbs: 65,
        fat: 12,
        tags: ['high-protein', 'vegan', 'gluten-free'],
      },
      {
        name: 'Chicken Curry & Rice',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600',
        description: 'Tender chicken pieces simmered in traditional home-style curry, served with basmati rice and dal.',
        category: 'nonveg',
        calories: 720,
        protein: 38,
        carbs: 72,
        fat: 22,
        tags: ['high-protein', 'non-veg'],
      },
      {
        name: 'Egg Masala Curry Combo',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600',
        description: '2 boiled eggs in spicy onion-tomato gravy, served with 3 tawa parathas and green chutney.',
        category: 'nonveg',
        calories: 620,
        protein: 20,
        carbs: 68,
        fat: 18,
        tags: ['eggitarian', 'spicy'],
      }
    ];

    const dinnerItems = [
      {
        name: 'Mix Veg Sabzi & Khichdi',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600',
        description: 'Light, digestible yellow moong dal khichdi served with dry mixed vegetable sabzi and roasted papad.',
        category: 'veg',
        calories: 450,
        protein: 12,
        carbs: 75,
        fat: 8,
        tags: ['light', 'elderly-friendly', 'easy-digest'],
      },
      {
        name: 'Aloo Gobhi & Paratha',
        image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600',
        description: 'Home-style potato and cauliflower stir-fry served with 2 soft tawa parathas and curd.',
        category: 'veg',
        calories: 580,
        protein: 10,
        carbs: 82,
        fat: 16,
        tags: ['comfort-food'],
      },
      {
        name: 'High-Protein Chickpea Salad',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600',
        description: 'Boiled chickpeas tossed with chopped cucumber, tomatoes, bell peppers, lemon juice, and olive oil dressing.',
        category: 'vegan',
        calories: 410,
        protein: 16,
        carbs: 58,
        fat: 10,
        tags: ['fitness', 'vegan', 'low-carb'],
      },
      {
        name: 'Chicken Kadhai & Roti',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600',
        description: 'Stir-fried chicken with bell peppers and freshly ground spices, served with 3 multi-grain rotis.',
        category: 'nonveg',
        calories: 650,
        protein: 42,
        carbs: 54,
        fat: 18,
        tags: ['high-protein', 'low-carb'],
      },
      {
        name: 'Methi Thepla & Dum Aloo',
        image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=600',
        description: 'Traditional Gujarati fenugreek flatbreads (3 pcs) served with rich Kashmiri style baby potatoes.',
        category: 'veg',
        calories: 520,
        protein: 11,
        carbs: 70,
        fat: 14,
        tags: ['traditional'],
      }
    ];

    const menus = [];

    for (let i = -7; i <= 7; i++) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + i);
      targetDate.setHours(0, 0, 0, 0);

      // Lunch Menu
      const lunchMenu = await Menu.create({
        date: targetDate,
        mealType: 'lunch',
        items: [
          lunchItems[Math.abs(i) % lunchItems.length],
          lunchItems[(Math.abs(i) + 1) % lunchItems.length],
          lunchItems[(Math.abs(i) + 2) % lunchItems.length]
        ],
        price: {
          single: 12000,    // ₹120.00
          weekly: 77000,    // ₹770.00 (₹110/meal)
          monthly: 300000,  // ₹3000.00 (₹100/meal)
        },
        isPublished: true,
        createdBy: admin._id
      });
      menus.push(lunchMenu);

      // Dinner Menu
      const dinnerMenu = await Menu.create({
        date: targetDate,
        mealType: 'dinner',
        items: [
          dinnerItems[Math.abs(i) % dinnerItems.length],
          dinnerItems[(Math.abs(i) + 1) % dinnerItems.length],
          dinnerItems[(Math.abs(i) + 2) % dinnerItems.length]
        ],
        price: {
          single: 13000,    // ₹130.00
          weekly: 84000,    // ₹840.00 (₹120/meal)
          monthly: 330000,  // ₹3300.00 (₹110/meal)
        },
        isPublished: true,
        createdBy: admin._id
      });
      menus.push(dinnerMenu);
    }

    console.log(`✅ Generated ${menus.length} Menus`);

    // 3. Create active subscriptions
    console.log('💳 Seeding subscriptions...');

    // Subscription for Aarav (Veg Weekly Lunch)
    const startDateAarav = new Date(now);
    startDateAarav.setDate(startDateAarav.getDate() - 3); // Started 3 days ago
    const endDateAarav = new Date(startDateAarav);
    endDateAarav.setDate(endDateAarav.getDate() + 7); // Active for 7 days

    const subAarav = await Subscription.create({
      user: aarav._id,
      plan: 'weekly',
      mealType: 'lunch',
      dietType: 'veg',
      deliveryAddress: aarav.addresses[0], // Work Address
      startDate: startDateAarav,
      endDate: endDateAarav,
      status: 'active',
      pausedDates: [],
      totalMeals: 7,
      mealsDelivered: 3,
      amountPaid: 77000,
      paymentId: 'pay_mock_aarav123'
    });

    // Subscription for Neha (Nonveg Monthly Dinner)
    const startDateNeha = new Date(now);
    startDateNeha.setDate(startDateNeha.getDate() - 10); // Started 10 days ago
    const endDateNeha = new Date(startDateNeha);
    endDateNeha.setDate(endDateNeha.getDate() + 30); // Active for 30 days

    // Pause tomorrow for Neha
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const subNeha = await Subscription.create({
      user: neha._id,
      plan: 'monthly',
      mealType: 'dinner',
      dietType: 'nonveg',
      deliveryAddress: neha.addresses[0], // Home Address
      startDate: startDateNeha,
      endDate: endDateNeha,
      status: 'active',
      pausedDates: [tomorrow], // Paused for tomorrow
      totalMeals: 30,
      mealsDelivered: 10,
      amountPaid: 330000,
      paymentId: 'pay_mock_neha456'
    });

    console.log('✅ Subscriptions created');

    // 4. Create past and today's orders
    console.log('📦 Seeding orders...');

    // Orders for Aarav (past 3 days + today)
    for (let i = -3; i <= 0; i++) {
      const orderDate = new Date(now);
      orderDate.setDate(orderDate.getDate() + i);
      orderDate.setHours(12, 0, 0, 0); // Lunch order time

      const targetDateOnly = new Date(orderDate);
      targetDateOnly.setHours(0, 0, 0, 0);

      const associatedMenu = menus.find(
        m => m.mealType === 'lunch' && m.date.getTime() === targetDateOnly.getTime()
      );

      const status = i < 0 ? 'delivered' : 'preparing'; // Past is delivered, today is preparing
      
      const order = await Order.create({
        user: aarav._id,
        subscription: subAarav._id,
        menu: associatedMenu?._id || null,
        date: targetDateOnly,
        mealType: 'lunch',
        status,
        deliveryAddress: subAarav.deliveryAddress,
        deliveryPartner: status === 'preparing' ? delivery._id : null,
        ...(i < 0 && {
          deliveryProof: {
            image: 'https://images.unsplash.com/photo-1582284738521-48763244fae5?auto=format&fit=crop&q=80&w=600',
            notes: 'Handed to customer Aarav at office desk.',
            timestamp: orderDate,
            coordinates: { lat: 28.53, lng: 77.34 }
          },
          feedback: i === -2 ? {
            rating: 5,
            comment: 'Tawa roti was extremely soft and paneer curry was delicious! Absolutely loved it.',
            createdAt: orderDate
          } : undefined
        })
      });

      // Update delivery partner's history if delivered
      if (status === 'delivered' && i === -1) {
        order.deliveryPartner = delivery._id;
        await order.save();
      }
    }

    // Orders for Neha (past 10 days + today)
    for (let i = -10; i <= 0; i++) {
      const orderDate = new Date(now);
      orderDate.setDate(orderDate.getDate() + i);
      orderDate.setHours(20, 0, 0, 0); // Dinner order time

      const targetDateOnly = new Date(orderDate);
      targetDateOnly.setHours(0, 0, 0, 0);

      const associatedMenu = menus.find(
        m => m.mealType === 'dinner' && m.date.getTime() === targetDateOnly.getTime()
      );

      const status = i < 0 ? 'delivered' : 'scheduled'; // Past delivered, today scheduled
      
      await Order.create({
        user: neha._id,
        subscription: subNeha._id,
        menu: associatedMenu?._id || null,
        date: targetDateOnly,
        mealType: 'dinner',
        status,
        deliveryAddress: subNeha.deliveryAddress,
        deliveryPartner: status === 'scheduled' ? null : delivery._id,
        ...(i < 0 && {
          deliveryProof: {
            image: 'https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?auto=format&fit=crop&q=80&w=600',
            notes: 'Left at security desk as requested.',
            timestamp: orderDate,
            coordinates: { lat: 28.52, lng: 77.37 }
          },
          feedback: i === -5 ? {
            rating: 4,
            comment: 'Chicken curry was nice, spice level was perfect (mild). Thanks!',
            createdAt: orderDate
          } : undefined
        })
      });
    }

    console.log('✅ Orders and Feedback Seeded');
    console.log('🚀 Database Seeding Completed Successfully! 🌱');

  } catch (error) {
    console.error('❌ Seeding failed with error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

seedDatabase();
