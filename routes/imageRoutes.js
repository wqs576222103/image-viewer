const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Image = require('../models/Image');

const router = express.Router();

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
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

// 获取图片列表（支持分页）
router.get('/images', async (req, res) => {
  try {
    // 检查数据库连接
    await sequelize.authenticate();

    // 获取分页参数
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 从url中获取筛选条件
    const { remark, category, name } = req.query;
    const where = {};
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (remark) {
      where.remark = { [Op.like]: `%${remark}%` };
    }
    if (category) {
      where.category = { [Op.like]: `%${category}%` };
    }

    // 查询符合条件的图片总数
    const totalCount = await Image.count({ where });

    // 查询当前页的图片
    const images = await Image.findAll({
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset,
      where
    });

    // 计算总页数
    const totalPages = Math.ceil(totalCount / limit);

    // 返回分页结果
    res.json({
      data: images,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        pageSize: limit
      }
    });
  } catch (err) {
    console.error('Error fetching images:', err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// 获取单个图片
router.get('/images/:id', async (req, res) => {
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
router.post('/images', upload.single('image'), async (req, res) => {
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
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// 更新图片信息
router.put('/images/:id', upload.single('image'), async (req, res) => {
  try {
    // 检查数据库连接
    await sequelize.authenticate();

    const { id } = req.params;
    const { name, category, remark } = req.body;

    // 先查找原图片
    const image = await Image.findByPk(id);
    if (!image) {
      // 如果有上传新文件但图片不存在，清理上传的文件
      if (req.file) {
        const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({ error: 'Image not found' });
    }

    // 准备更新数据
    const updateData = {
      name: name || image.name,
      category: category || image.category,
      remark: remark || image.remark
    };

    // 如果有上传新图片，更新图片路径
    if (req.file) {
      // 删除旧图片文件
      const oldFilePath = path.join(__dirname, '..', image.url.substring(1)); // Remove leading slash
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      
      // 设置新图片路径
      updateData.url = `/uploads/${req.file.filename}`;
    }

    // 执行更新
    const [updatedRowsCount] = await Image.update(
      updateData,
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const updatedImage = await Image.findByPk(id);
    res.json(updatedImage);
  } catch (err) {
    console.error('Error updating image:', err);
    // 如果更新失败且有新上传的文件，进行清理
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// 删除图片
router.delete('/images/:id', async (req, res) => {
  try {
    // 检查数据库连接
    await sequelize.authenticate();

    const { id } = req.params;

    const image = await Image.findByPk(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // 删除文件系统中的图片文件
    const filePath = path.join(__dirname, '..', image.url);
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

// 批量删除图片
router.delete('/images', async (req, res) => {
  try {
    // 检查数据库连接
    await sequelize.authenticate();

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid IDs provided' });
    }

    // 查找所有要删除的图片
    const images = await Image.findAll({
      where: {
        id: ids
      }
    });

    if (images.length === 0) {
      return res.status(404).json({ error: 'No images found' });
    }

    // 删除文件系统中的图片文件
    images.forEach(image => {
      const filePath = path.join(__dirname, '..', image.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // 从数据库中删除记录
    await Image.destroy({
      where: {
        id: ids
      }
    });

    res.json({ 
      message: `Successfully deleted ${images.length} images`,
      deletedCount: images.length
    });
  } catch (err) {
    console.error('Error deleting images:', err);
    res.status(500).json({ error: 'Failed to delete images' });
  }
});

module.exports = router;