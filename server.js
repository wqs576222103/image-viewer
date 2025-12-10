const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { Op } = require('sequelize');

// 引入MySQL配置
const { sequelize, connectDB } = require('./config/database');
const Image = require('./models/Image');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ storage });

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes

// 获取图片列表
app.get('/api/images', async (req, res) => {
  try {
    // 检查数据库连接
    await sequelize.authenticate();
    // 从url中获取筛选条件
    const { remark, category } = req.query;
    console.log('remark:', remark);
    console.log('category:', category);
    const where = {};
    if (remark) {
      where.remark = { [Op.like]: `%${remark}%` };
    }
    if(category) {
      where.category = { [Op.like]: `%${category}%` };
    }

    
    const images = await Image.findAll({
      order: [['createdAt', 'DESC']],
      where
    });
    
    res.json(images);
  } catch (err) {
    console.error('Error fetching images:', err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// 获取单个图片
app.get('/api/images/:id', async (req, res) => {
  try {
    // 检查数据库连接
    await sequelize.authenticate();
    
    const image = await Image.findByPk(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json(image);
  } catch (err) {
    console.error('Error fetching image:', err);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// 上传图片
app.post('/api/images', upload.single('image'), async (req, res) => {
  try {
    // 检查数据库连接
    await sequelize.authenticate();
    
    const { name, category, remark } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    const image = await Image.create({
      id: uuidv4(),
      name: name || req.file.originalname,
      url: imageUrl,
      category: category || '',
      remark: remark || ''
    });

    res.status(201).json(image);
  } catch (err) {
    console.error('Error uploading image:', err);
    
    // 如果上传失败，删除已保存的文件
    if (req.file) {
      const filePath = path.join(__dirname, 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// 更新图片信息
app.put('/api/images/:id', async (req, res) => {
  try {
    // 检查数据库连接
    await sequelize.authenticate();
    
    const { id } = req.params;
    const { name, category, remark } = req.body;

    const [updatedRowsCount] = await Image.update(
      { name, category, remark },
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const updatedImage = await Image.findByPk(id);
    res.json(updatedImage);
  } catch (err) {
    console.error('Error updating image:', err);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// 删除图片
app.delete('/api/images/:id', async (req, res) => {
  try {
    // 检查数据库连接
    await sequelize.authenticate();
    
    const { id } = req.params;
    
    const image = await Image.findByPk(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // 删除文件系统中的图片文件
    const filePath = path.join(__dirname, image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 从数据库中删除记录
    await image.destroy();
    
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // 连接数据库
  await connectDB();
});