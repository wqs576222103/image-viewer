const express = require('express');
const User = require('../models/User'); // 导入用户模型
const router = express.Router();

// 生成简单token
function generateToken(user) {
  const payload = {
    userId: user.id,
    username: user.username,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24小时后过期
  };
  // 将payload转换为字符串并进行base64编码
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  return token;
}

// 验证token
function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) {
      return null; // token过期
    }
    return payload;
  } catch (e) {
    return null; // token无效
  }
}

// 登录路由
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    // 从数据库查找用户
    const user = await User.findOne({
      where: { username: username }
    });

    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 直接比较密码（不加密）
    if (user.password !== password) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成简单token
    const token = generateToken({
      id: user.id,
      username: user.username
    });

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 刷新token路由
router.post('/refresh', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: '缺少token' });
    }

    // 验证旧token
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: '无效的token' });
    }

    // 重新生成token
    const newToken = generateToken(payload);

    res.json({
      message: 'Token刷新成功',
      token: newToken
    });
  } catch (error) {
    console.error('Token刷新错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 登出路由
router.post('/logout', (req, res) => {
  // 客户端只需要清除本地存储的token即可
  res.json({ message: '登出成功' });
});

module.exports = router;