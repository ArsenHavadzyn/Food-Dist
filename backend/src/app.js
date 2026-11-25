// Express app setup, routes and middleware
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const salesRoutes = require('./routes/sales');
const productsRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const financialRoutes = require('./routes/financial');
const reportsRoutes = require('./routes/reports');
const factorRoutes = require('./routes/factor');
const aiRoutes = require('./routes/ai');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const importsRoutes = require('./routes/imports');

const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API mount
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/factor', factorRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/imports', importsRoutes);

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// static files (reports)
app.use('/public', express.static('public'));

// Error handling
app.use(errorHandler);

module.exports = app;
