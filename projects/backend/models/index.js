const sequelize = require('../config/db')
const File = require('./fileModel')

const syncDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ MySQL connected')
    await sequelize.sync() // Use { force: true } to reset
    console.log('📦 Models synced')
  } catch (error) {
    console.error('❌ DB connection error:', error.message)
  }
}

module.exports = { File, syncDatabase }
