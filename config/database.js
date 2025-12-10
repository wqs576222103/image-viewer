const { Sequelize } = require('sequelize');

// 获取环境变量或使用默认值
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_NAME = process.env.DB_NAME || 'imageviewer';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '123456';

// 创建Sequelize实例
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false, // 设置为true可以看到SQL日志
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// 测试数据库连接
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL database');
    
    // 同步数据库模型
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (err) {
    console.error('Unable to connect to MySQL database:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = { sequelize, connectDB };