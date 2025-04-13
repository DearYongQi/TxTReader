import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { message, ConfigProvider, theme as antdTheme } from 'antd';
import { ThemeContext } from './context/ThemeContext';
import Home from './pages/Home';
import Reader from './pages/Reader';
import './styles/global.scss';

/**
 * 应用主组件
 * @returns {JSX.Element} App组件
 */
const App = () => {
  const { theme } = useContext(ThemeContext);
  
  // 配置全局消息提示持续时间
  message.config({
    duration: 2,
    maxCount: 3,
  });

  // 设置Ant Design主题
  const getThemeConfig = () => {
    return {
      token: {
        colorPrimary: '#ff9e7d', // 主色调
        borderRadius: 8, // 圆角半径
        colorBgContainer: theme === 'dark' ? '#363636' : '#ffffff', // 容器背景色
        colorText: theme === 'dark' ? '#e8e8e8' : '#333333', // 文本颜色
        colorBgElevated: theme === 'dark' ? '#444444' : '#ffffff', // 弹窗背景色
        colorBgMask: theme === 'dark' ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.45)', // 遮罩层颜色
      },
      algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    };
  };
  
  return (
    <ConfigProvider theme={getThemeConfig()}>
      <div className={`app ${theme}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reader/:fileName" element={<Reader />} />
        </Routes>
      </div>
    </ConfigProvider>
  );
};

export default App; 