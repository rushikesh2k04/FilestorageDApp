const sequelize = require('../config/db');
const File = require('./fileModel');

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully');

    // Sync models
    const syncOptions = process.env.NODE_ENV === 'development' ? { alter: true } : {};
    await sequelize.sync(syncOptions);

    console.log('📦 Models synced successfully');
  } catch (error) {
    console.error('❌ Database connection or sync error:', error);
  }
};

module.exports = { File, syncDatabase };
