const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const File = sequelize.define(
  'File',
  {
    fileId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    cid: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    permissions: {
      type: DataTypes.ENUM('public', 'private'),
      allowNull: false,
      defaultValue: 'public',
    },
    uploader: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    timestamps: true,       // automatically adds createdAt and updatedAt
    underscored: true,      // snake_case for column names
    tableName: 'files',     // explicit table name
  }
);

module.exports = File;
