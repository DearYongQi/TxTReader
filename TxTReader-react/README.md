# TxTReader-react 前端应用

这是TxTReader应用的前端部分，使用React + Ant Design + Sass + Axios开发。

## 项目结构

```
TxTReader-react/
├── public/                 // 静态资源
├── src/                    // 源代码
│   ├── api/                // API请求
│   ├── assets/             // 静态资源
│   ├── components/         // 通用组件
│   ├── context/            // 上下文
│   ├── hooks/              // 自定义Hooks
│   ├── pages/              // 页面组件
│   ├── styles/             // 样式文件
│   ├── utils/              // 工具函数
│   ├── App.js              // 应用入口
│   ├── App.scss            // 全局样式
│   ├── index.js            // 挂载入口
│   └── theme.js            // 主题配置
├── package.json            // 项目依赖配置
└── README.md               // 项目说明文档
```

## 依赖安装

```bash
cd TxTReader-react
npm install
```

## 启动服务

```bash
npm start
```

## 项目功能

- 本地TXT文本阅读器
- 支持白天/黑夜模式切换
- 支持不同设备屏幕适配（PC、平板、手机）
- 文本列表浏览和搜索
- 收藏功能
- 文本阅读（支持滚动和翻页两种模式）
- 听书功能
- 阅读设置（字体大小、行间距、背景颜色等）

## 接口使用

前端通过Axios调用后端API：

- 获取文件列表: `/api/books` (GET)
- 获取文件内容: `/api/books/content/:fileName` (GET)
- 获取收藏列表: `/api/favorites` (GET)
- 添加收藏: `/api/favorites` (POST)
- 取消收藏: `/api/favorites/:id` (DELETE)

## 注意事项

1. 前端启动时默认请求所有文件列表和收藏列表
2. 搜索功能在前端本地完成，无需调用后端API
3. 收藏文件默认展示在列表前部
4. 响应式设计支持多种设备屏幕尺寸
5. 默认前端开发服务端口为3000 