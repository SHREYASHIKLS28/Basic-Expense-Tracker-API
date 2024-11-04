const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/expenses')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Expense model (you need to define this model)
const Expense = mongoose.model('Expense', new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
}));

// Routes

// 1. Get all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.send("Welcome to the Expense Tracker");
    } catch (err) {
        res.status(500).send(err);
    }
});

// 2. Add a new expense
app.post('/api/expenses', async (req, res) => {
    const expense = new Expense({
        description: req.body.description,
        amount: req.body.amount,
        category: req.body.category,
        date: req.body.date,
    });
    try {
        const savedExpense = await expense.save();
        res.status(201).json(savedExpense);
    } catch (err) {
        res.status(400).send(err);
    }
});

// 3. Update an expense
app.put('/api/expenses/:id', async (req, res) => {
    try {
        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedExpense) return res.status(404).send('Expense not found');
        res.json(updatedExpense);
    } catch (err) {
        res.status(400).send(err);
    }
});

// 4. Delete an expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
        if (!deletedExpense) return res.status(404).send('Expense not found');
        res.json({ message: 'Expense deleted successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// 5. Get expenses by month
app.get('/api/expenses/monthly/:year/:month', async (req, res) => {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    try {
        const monthlyExpenses = await Expense.find({
            date: { $gte: startDate, $lt: endDate },
        });
        res.json(monthlyExpenses);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Test root route
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
