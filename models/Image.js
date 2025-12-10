const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Image = sequelize.define('Image', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  remark: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  category: {
    type: DataTypes.TEXT,
    defaultValue: ''
  }
}, {
  tableName: 'images',
  timestamps: true
});

module.exports = Image;