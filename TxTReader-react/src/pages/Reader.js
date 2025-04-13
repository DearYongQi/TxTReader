import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import ReaderControls from '../components/ReaderControls';
import ScrollReader from '../components/ScrollReader';
import { getBookContent } from '../api';
import useReaderSettings from '../hooks/useReaderSettings';
import './Reader.scss';

/**
 * 阅读页面组件
 */
const Reader = () => {
  const { fileName } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [bookName, setBookName] = useState('');
  const controlsRef = useRef(null);
  const readerRef = useRef(null);
  
  // 使用自定义Hook管理阅读设置
  const { 
    settings, 
    updateSetting, 
    resetSettings,
    toggleEyeProtection,
    toggleAutoScroll
  } = useReaderSettings();

  // 解析文件名获取书名
  useEffect(() => {
    if (fileName) {
      // 从文件名中移除.txt扩展名以获取书名
      setBookName(decodeURIComponent(fileName).replace('.txt', ''));
    }
  }, [fileName]);

  // 获取文本内容
  useEffect(() => {
    const fetchContent = async () => {
      if (!fileName) return;
      
      setLoading(true);
      try {
        const result = await getBookContent(fileName);
        if (result.success) {
          setContent(result.data);
        } else {
          throw new Error(result.message || '获取文本内容失败');
        }
      } catch (err) {
        console.error('获取文本内容失败:', err);
        setError(err.message || '获取文本内容失败');
        message.error('加载文本失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [fileName]);

  // 确保背景色设置正确应用到全局
  useEffect(() => {
    document.documentElement.style.setProperty('--reader-background-color', settings.background);
    document.documentElement.style.setProperty('--reader-text-color', settings.color);
    
    // 强制重新渲染
    if (readerRef.current) {
      readerRef.current.style.backgroundColor = settings.background;
      readerRef.current.style.color = settings.color;
    }
  }, [settings.background, settings.color]);
  
  // 强制应用护眼模式
  const applyEyeProtection = useCallback(() => {
    console.log('应用护眼模式:', settings.isEyeProtection);
    toggleEyeProtection();
  }, [toggleEyeProtection, settings.isEyeProtection]);

  // 强制应用自动滚动
  const applyAutoScroll = useCallback(() => {
    console.log('应用自动滚动:', settings.autoScroll);
    toggleAutoScroll();
  }, [toggleAutoScroll, settings.autoScroll]);

  // 监听护眼模式变化
  useEffect(() => {
    if (settings.isEyeProtection) {
      document.documentElement.classList.add('eye-protection-active');
    } else {
      document.documentElement.classList.remove('eye-protection-active');
    }
  }, [settings.isEyeProtection]);

  // 处理返回按钮
  const handleBack = () => {
    navigate('/');
  };

  // 处理进度变更
  const handleProgressChange = (newProgress) => {
    setProgress(newProgress);
  };
  
  // 处理内容区域点击
  const handleContentClick = useCallback(() => {
    if (controlsRef.current && typeof controlsRef.current.toggleStatusBar === 'function') {
      controlsRef.current.toggleStatusBar();
    }
  }, []);

  return (
    <div 
      className={`reader-page ${settings.isEyeProtection ? 'eye-protection' : ''}`}
      style={{
        backgroundColor: settings.background,
        color: settings.color
      }}
      ref={readerRef}
    >
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <p>加载中...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>出错了: {error}</p>
          <button onClick={handleBack}>返回首页</button>
        </div>
      ) : (
        <>
          <ReaderControls
            ref={controlsRef}
            bookName={bookName}
            settings={settings}
            updateSetting={updateSetting}
            resetSettings={resetSettings}
            toggleEyeProtection={applyEyeProtection}
            toggleAutoScroll={applyAutoScroll}
            handleBack={handleBack}
          />
          
          <div className="reader-container" onClick={handleContentClick}>
            <ScrollReader
              content={content}
              settings={settings}
              onProgressChange={handleProgressChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Reader;