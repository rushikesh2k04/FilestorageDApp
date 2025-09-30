const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with improved configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Enable logging only in dev
    pool: {
      max: 10,       // Maximum number of connections in pool
      min: 0,        // Minimum number of connections in pool
      acquire: 30000, // Max time (ms) to get a connection before throwing error
      idle: 10000    // Max time (ms) a connection can be idle before being released
    },
    define: {
      timestamps: true,  // Automatically add createdAt and updatedAt fields
      underscored: true, // Use snake_case column names
    },
  }
);

// Test the database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
})();

module.exports = sequelize;
