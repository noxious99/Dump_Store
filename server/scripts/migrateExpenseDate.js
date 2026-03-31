require('dotenv').config();
process.env.NODE_ENV = 'development';

const mongoose = require('mongoose');
const { Expense } = require('../Schemas/expenseSchema');

const DB_URI = process.env.MONGODB_URI;

const migrateExpenseDate = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('Connected to MongoDB');

        const result = await Expense.updateMany(
            { date: { $exists: false } },
            [{ $set: { date: "$createdAt" } }]
        );

        console.log(`Migration complete: ${result.modifiedCount} expense records updated (date = createdAt)`);

        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

migrateExpenseDate();
