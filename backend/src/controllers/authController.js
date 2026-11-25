const authService = require('../services/authService');

// Controller for authentication routes

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const data = await authService.login(email, password);
        res.json(data);
    } catch (err) {
        next(err);
    }
};

exports.me = async (req, res, next) => {
    try {
        const user = await authService.findById(req.user.id);
        if (!user || user.role !== req.user.role) {
            return res.status(401).json({ message: 'Сесію завершено. Увійдіть знову.' });
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
};

exports.register = async (req, res, next) => {
    try {
        // Only Admin should create users; route is protected
        const user = await authService.register(req.body);
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
};
