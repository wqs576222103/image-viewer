const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Image = require('../models/Image');
const Category = require('../models/Category');

const router = express.Router();

// 获取所有分类
router.get('/categories', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    const categories = await Category.findAll({
      order: [['createTime', 'DESC']]
    });
    
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// 创建分类
router.post('/categories', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    const { name, code } = req.body;
    
    // 检查code是否已经存在
    const existingCategory = await Category.findOne({ where: { code } });
    if (existingCategory) {
      return res.status(400).json({ error: 'Code already exists' });
    }
    
    const category = await Category.create({
      id: uuidv4(),
      name,
      code
    });
    
    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// 更新分类
router.put('/categories/:id', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    const { id } = req.params;
    const { name, code } = req.body;
    
    // 检查分类是否存在
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // 检查code是否已经被其他分类使用
    if (code !== category.code) {
      const existingCategory = await Category.findOne({ where: { code } });
      if (existingCategory) {
        return res.status(400).json({ error: 'Code already exists' });
      }
    }
    
    await Category.update(
      { name, code },
      { where: { id } }
    );
    
    const updatedCategory = await Category.findByPk(id);
    res.json(updatedCategory);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// 删除分类
router.delete('/categories/:id', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    const { id } = req.params;
    
    // 检查分类是否存在
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // 检查是否有图片使用了这个分类
    const imagesWithCategory = await Image.findOne({ 
      where: { 
        category: {
          [Op.or]: [
            { [Op.eq]: category.code },
            { [Op.like]: `${category.code},%` },
            { [Op.like]: `%,${category.code}` },
            { [Op.like]: `%,${category.code},%` }
          ]
        }
      } 
    });
    
    if (imagesWithCategory) {
      return res.status(400).json({ error: 'Cannot delete category because it is associated with one or more images' });
    }
    
    // 执行删除
    await Category.destroy({ where: { id } });
    
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;