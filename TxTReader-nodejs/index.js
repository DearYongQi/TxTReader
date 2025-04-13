const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Datastore = require('nedb');

const app = express();
const PORT = process.env.PORT || 5000;

// 初始化数据库 - 改进版本，处理权限问题
let db;
try {
  const dbPath = path.join(__dirname, 'favorites.db');
  
  // 尝试先访问文件，检查权限
  try {
    fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
  } catch (err) {
    console.warn(`无法访问数据库文件 (${err.code}): ${dbPath}`);
    console.warn('将使用内存数据库代替');
    throw new Error('使用内存数据库');
  }
  
  db = new Datastore({ filename: dbPath, autoload: true });
  console.log('成功加载文件数据库');
} catch (err) {
  // 如果无法访问文件或发生任何错误，使用内存数据库
  db = new Datastore();
  console.log('使用内存数据库作为后备方案');
  
  // 添加一个示例记录以便前端有测试数据（可选）
  db.insert({
    title: "示例文本",
    id: "示例文本.txt",
    createdAt: new Date().toISOString(),
  });
}

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件夹路径
const xiaoshuoPath = path.join(__dirname, 'xiaoshuo');

// 将xiaoshuo文件夹设为静态资源目录
app.use('/xiaoshuo', express.static(xiaoshuoPath));

/**
 * 获取所有TXT文件列表
 * @returns {Array} 文件列表数组
 */
app.get('/api/books', (req, res) => {
  try {
    // 确保xiaoshuo文件夹存在
    if (!fs.existsSync(xiaoshuoPath)) {
      fs.mkdirSync(xiaoshuoPath, { recursive: true });
      return res.json({ success: true, data: [] });
    }

    const files = fs.readdirSync(xiaoshuoPath);
    const txtFiles = files
      .filter(file => file.endsWith('.txt'))
      .map(file => ({
        id: file,
        title: file.replace('.txt', ''),
        path: `/api/books/content/${encodeURIComponent(file)}`
      }));

    res.json({ success: true, data: txtFiles });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).json({ success: false, message: '获取文件列表失败', error: error.message });
  }
});

/**
 * 获取TXT文件内容
 * @param {string} fileName - 文件名
 * @returns {string} 文件内容
 */
app.get('/api/books/content/:fileName', (req, res) => {
  try {
    const fileName = decodeURIComponent(req.params.fileName);
    const filePath = path.join(xiaoshuoPath, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ success: true, data: content });
  } catch (error) {
    console.error('获取文件内容失败:', error);
    res.status(500).json({ success: false, message: '获取文件内容失败', error: error.message });
  }
});

/**
 * 获取收藏列表
 * @returns {Array} 收藏列表数组
 */
app.get('/api/favorites', (req, res) => {
  db.find({}, (err, favorites) => {
    if (err) {
      console.error('获取收藏列表失败:', err);
      return res.status(500).json({ success: false, message: '获取收藏列表失败', error: err.message });
    }
    res.json({ success: true, data: favorites || [] });
  });
});

/**
 * 添加收藏
 * @param {string} title - 书籍标题
 * @param {string} id - 书籍ID（文件名）
 * @returns {Object} 添加的收藏对象
 */
app.post('/api/favorites', (req, res) => {
  const { title, id } = req.body;
  
  if (!title || !id) {
    return res.status(400).json({ success: false, message: '标题和ID不能为空' });
  }

  const favorite = {
    title,
    id,
    createdAt: new Date().toISOString()
  };

  try {
    db.insert(favorite, (err, newFavorite) => {
      if (err) {
        console.error('添加收藏失败:', err);
        return res.status(500).json({ success: false, message: '添加收藏失败', error: err.message });
      }
      res.json({ success: true, data: newFavorite });
    });
  } catch (err) {
    console.error('添加收藏错误:', err);
    res.status(500).json({ success: false, message: '添加收藏错误', error: err.message });
  }
});

/**
 * 取消收藏
 * @param {string} id - 书籍ID（文件名）
 * @returns {Object} 操作结果
 */
app.delete('/api/favorites/:id', (req, res) => {
  const id = decodeURIComponent(req.params.id);
  
  try {
    db.remove({ id }, {}, (err, numRemoved) => {
      if (err) {
        console.error('取消收藏失败:', err);
        return res.status(500).json({ success: false, message: '取消收藏失败', error: err.message });
      }
      
      if (numRemoved === 0) {
        return res.status(404).json({ success: false, message: '收藏不存在' });
      }
      
      res.json({ success: true, message: '取消收藏成功' });
    });
  } catch (err) {
    console.error('取消收藏错误:', err);
    res.status(500).json({ success: false, message: '取消收藏错误', error: err.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  
  // 确保xiaoshuo文件夹存在
  if (!fs.existsSync(xiaoshuoPath)) {
    fs.mkdirSync(xiaoshuoPath, { recursive: true });
    console.log(`已创建xiaoshuo文件夹: ${xiaoshuoPath}`);
  } else {
    console.log(`xiaoshuo文件夹已存在: ${xiaoshuoPath}`);
  }
}); 