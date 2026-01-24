const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

// 引入MySQL配置
const { sequelize, connectDB } = require('./config/database');

// 引入路由模块
const imageRoutes = require('./routes/imageRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
// 设置缓存
app.use('/file/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: 86400000 }));

// 使用路由模块
app.use('/api', imageRoutes);
app.use('/api', categoryRoutes);

// 启动服务器
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // 连接数据库
  await connectDB();
});
