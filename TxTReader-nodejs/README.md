# TxTReader-nodejs 后端服务

这是TxTReader应用的后端部分，使用Node.js + Express + NeDB开发。

## 项目结构

```
TxTReader-nodejs/
├── index.js        // 主入口文件
├── package.json    // 项目依赖配置
├── favorites.db    // NeDB数据库文件(自动生成)
└── README.md       // 项目说明文档
```

## 依赖安装

```bash
cd TxTReader-nodejs
npm install
```

## 启动服务

开发模式（带热重载）:
```bash
npm run dev
```

生产模式:
```bash
npm start
```

## 项目功能

- 获取本地TXT文件列表
- 获取TXT文件内容
- 管理用户收藏的文件

## API接口

| 接口路径 | 方法 | 功能描述 | 参数 | 返回值 |
|---------|------|---------|------|-------|
| `/api/books` | GET | 获取所有TXT文件列表 | 无 | `{success: true, data: [文件列表]}` |
| `/api/books/content/:fileName` | GET | 获取指定TXT文件内容 | 文件名 | `{success: true, data: "文件内容"}` |
| `/api/favorites` | GET | 获取收藏列表 | 无 | `{success: true, data: [收藏列表]}` |
| `/api/favorites` | POST | 添加收藏 | `{title, id}` | `{success: true, data: 新收藏对象}` |
| `/api/favorites/:id` | DELETE | 取消收藏 | 文件ID | `{success: true, message: "取消收藏成功"}` |

## 注意事项

1. 确保项目根目录下存在`xiaoshuo`文件夹，该文件夹用于存放TXT文件。
2. 所有TXT文件应该存放在`xiaoshuo`文件夹中。
3. 文件名格式应为`标题.txt`，标题即为显示在前端的文件名。
4. API接口返回的所有数据格式统一为`{success: boolean, data/message: any, error?: string}`。
5. 默认服务端口为5000，可通过环境变量PORT更改。 