# TxTReader - 本地TXT文本阅读器

一个基于React+Node.js的本地TXT文本阅读器，支持浏览、搜索、收藏和阅读本地TXT文件。

## 项目结构

```
TxTReader/
├── TxTReader-react/     # 前端React应用
│   ├── public/          # 静态资源
│   └── src/             # 源代码
│       ├── api/         # API请求
│       ├── components/  # 组件
│       ├── context/     # 上下文
│       ├── hooks/       # 自定义Hook
│       ├── pages/       # 页面
│       ├── styles/      # 样式
│       └── utils/       # 工具函数
└── TxTReader-nodejs/    # 后端Node.js应用
    ├── index.js         # 主入口
    ├── favorites.db     # NeDB数据库(自动生成)
    ├── xiaoshuo/        # 存放TXT文件的目录
    └── README.md        # 项目说明文档
```

## 功能特点

- 浏览和搜索本地TXT文件
- 收藏喜欢的文本
- 两种阅读模式：滚动和翻页
- 阅读器设置：字体大小、行间距、背景颜色等
- 听书功能（文本转语音）
- 白天/黑夜模式切换
- 自适应布局，支持PC、平板和手机

## 安装和使用

### 1. 安装依赖

前端：
```bash
cd TxTReader-react
npm install
```

后端：
```bash
cd TxTReader-nodejs
npm install
```

### 2. 添加TXT文件

将TXT文件放入`TxTReader-nodejs/xiaoshuo`文件夹中（如果不存在会自动创建）。

### 3. 启动服务

后端：
```bash
cd TxTReader-nodejs
npm run dev
```

前端：
```bash
cd TxTReader-react
npm start
```

### 4. 配置

前端的API调用默认使用`http://192.168.1.27:5000`作为后端地址，请根据实际情况修改`TxTReader-react/src/api/index.js`中的`API_URL`变量值。

访问 http://localhost:3000 即可使用。

## API接口

| 接口路径 | 方法 | 功能描述 | 参数 | 返回值 |
|---------|------|---------|------|-------|
| `/api/books` | GET | 获取所有TXT文件列表 | 无 | `{success: true, data: [文件列表]}` |
| `/api/books/content/:fileName` | GET | 获取指定TXT文件内容 | 文件名 | `{success: true, data: "文件内容"}` |
| `/api/favorites` | GET | 获取收藏列表 | 无 | `{success: true, data: [收藏列表]}` |
| `/api/favorites` | POST | 添加收藏 | `{title, id}` | `{success: true, data: 新收藏对象}` |
| `/api/favorites/:id` | DELETE | 取消收藏 | 文件ID | `{success: true, message: "取消收藏成功"}` |

## 注意事项

1. 确保Node.js版本 >= 12.0.0
2. 文件名格式应为`标题.txt`，标题即为显示在前端的文件名
3. 程序将在`TxTReader-nodejs/xiaoshuo`目录下查找TXT文件
4. 收藏功能使用NeDB存储数据，数据文件位于`TxTReader-nodejs/favorites.db`
5. 前后端采用跨域方式通信，请确保在`TxTReader-react/src/api/index.js`中配置正确的后端服务器地址 