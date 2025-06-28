const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const File = sequelize.define('File', {
  fileId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  cid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  permissions: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'public',
  },
  uploader: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

module.exports = File
