process.env.NODE_ENV = 'development';
require('dotenv-flow').config({ path: require('path').resolve(__dirname, '..') });

const mongoose = require('mongoose');
const { Category } = require('../Schemas/expenseSchema');

const DB_URI = process.env.MONGODB_URI;

const systemCategories = [
    { name: "travel", isDefault: true, userId: null },
    { name: "food", isDefault: true, userId: null },
    { name: "rent", isDefault: true, userId: null },
    { name: "utility", isDefault: true, userId: null },
    { name: "groceries", isDefault: true, userId: null },
    { name: "entertainment", isDefault: true, userId: null },
    { name: "subscriptions", isDefault: true, userId: null },
    { name: "clothing", isDefault: true, userId: null },
    { name: "health", isDefault: true, userId: null },
    { name: "miscellaneous", isDefault: true, userId: null },
];

const seedSystemCategories = async () => {
    try {
        // Connect to MongoDB first
        await mongoose.connect(DB_URI);
        console.log('✅ Connected to MongoDB');

        const existingCount = await Category.countDocuments({ isDefault: true, userId: null });
        
        if (existingCount > 0) {
            console.log('System categories already exist. Skipping seed.');
            await mongoose.connection.close();
            return;
        }

        await Category.insertMany(systemCategories);
        console.log('✅ System categories seeded successfully!');
        
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Run the seed function
seedSystemCategories();