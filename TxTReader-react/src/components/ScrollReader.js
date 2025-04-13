import React, { useState, useEffect, useRef } from 'react';
import { Spin } from 'antd';
import './ScrollReader.scss';

/**
 * 滚动模式阅读组件
 * @param {Object} props - 组件属性
 * @param {string} props.content - 文本内容
 * @param {Object} props.settings - 阅读设置
 * @param {Function} props.onProgressChange - 阅读进度变更回调
 * @returns {JSX.Element} ScrollReader组件
 */
const ScrollReader = ({ 
  content, 
  settings,
  onProgressChange
}) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(settings?.autoScroll || false);
  const scrollTimerRef = useRef(null);
  const userScrollRef = useRef(false);
  
  // 从settings中提取需要的设置
  const {
    fontSize = 18,
    lineHeight = 1.8,
    background: backgroundColor = '#fff8f5',
    color: textColor = '#333333',
    isEyeProtection: isEyeProtectionActive = false,
    autoScroll: isAutoScrollActive = false,
    autoScrollSpeed = 2
  } = settings || {};
  
  // 记录设置更改
  useEffect(() => {
    console.log('ScrollReader settings updated:', {
      fontSize,
      lineHeight,
      backgroundColor,
      textColor,
      isEyeProtectionActive,
      isAutoScrollActive,
      autoScrollSpeed
    });
  }, [fontSize, lineHeight, backgroundColor, textColor, isEyeProtectionActive, isAutoScrollActive, autoScrollSpeed]);

  // 应用背景颜色和文本颜色
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      
      console.log('Applying colors to container:', {
        backgroundColor,
        textColor
      });
      
      // 使用CSS变量
      document.documentElement.style.setProperty('--reader-background-color', backgroundColor);
      document.documentElement.style.setProperty('--reader-text-color', textColor);
      
      // 确保滚动容器也应用这些颜色
      container.style.backgroundColor = backgroundColor;
      container.style.color = textColor;
    }
  }, [backgroundColor, textColor]);

  // 应用护眼模式
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      if (isEyeProtectionActive) {
        container.classList.add('eye-protection');
      } else {
        container.classList.remove('eye-protection');
      }
    }
  }, [isEyeProtectionActive]);
  
  // 计算阅读进度
  const calculateProgress = () => {
    if (!containerRef.current || !contentRef.current) return 0;
    
    const container = containerRef.current;
    const content = contentRef.current;
    
    const scrollTop = container.scrollTop;
    const scrollHeight = content.clientHeight - container.clientHeight;
    
    // 确保不会出现负进度或超过100%
    if (scrollHeight <= 0) return 100;
    
    const calculatedProgress = Math.min(Math.max((scrollTop / scrollHeight) * 100, 0), 100);
    return Math.round(calculatedProgress);
  };

  // 处理滚动事件
  const handleScroll = () => {
    // 标记用户发起的滚动
    if (!scrollTimerRef.current) {
      userScrollRef.current = true;
      
      // 重置用户滚动标记的定时器
      setTimeout(() => {
        userScrollRef.current = false;
      }, 2000);
    }
    
    const newProgress = calculateProgress();
    setProgress(newProgress);
    
    if (onProgressChange) {
      onProgressChange(newProgress);
    }
    
    // 如果用户手动滚动并且正在自动滚动中，暂停自动滚动
    if (userScrollRef.current && isAutoScrolling && scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current);
      scrollTimerRef.current = null;
      setIsAutoScrolling(false);
    }
  };

  // 切换自动滚动状态
  useEffect(() => {
    setIsAutoScrolling(isAutoScrollActive);
    
    if (isAutoScrollActive) {
      startAutoScroll();
    } else if (scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
    
    return () => {
      if (scrollTimerRef.current) {
        clearInterval(scrollTimerRef.current);
      }
    };
  }, [isAutoScrollActive, autoScrollSpeed]);

  // 开始自动滚动
  const startAutoScroll = () => {
    if (scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current);
    }
    
    // 根据速度设置滚动间隔，速度值越大，滚动越快
    // 将速度反转为时间间隔：100是最快，0是最慢
    // autoScrollSpeed范围是1-5，转换为适当的滚动速度
    const speedMultiplier = 20; // 每个速度级别增加的毫秒数
    const baseInterval = 60; // 基础时间间隔
    const interval = baseInterval - (autoScrollSpeed - 1) * speedMultiplier; // 60ms到20ms范围
    
    scrollTimerRef.current = setInterval(() => {
      if (containerRef.current && !userScrollRef.current) {
        containerRef.current.scrollTop += 1; // 每次滚动1像素
        
        // 更新进度
        const newProgress = calculateProgress();
        setProgress(newProgress);
        
        if (onProgressChange) {
          onProgressChange(newProgress);
        }
        
        // 如果滚动到底部，停止自动滚动
        if (newProgress >= 100) {
          clearInterval(scrollTimerRef.current);
          scrollTimerRef.current = null;
          setIsAutoScrolling(false);
        }
      }
    }, interval);
  };

  // 格式化内容为段落
  const formatContent = () => {
    if (!content) return null;
    
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') {
        return <div key={index} className="empty-line" style={{ height: `${lineHeight}em` }}></div>;
      }
      return <p key={index}>{paragraph}</p>;
    });
  };

  // 增加点击切换自动滚动功能
  const handleContainerClick = (e) => {
    // 防止与其他点击事件冲突
    if (e.target === containerRef.current || e.target === contentRef.current) {
      if (scrollTimerRef.current) {
        clearInterval(scrollTimerRef.current);
        scrollTimerRef.current = null;
        setIsAutoScrolling(false);
      } else {
        setIsAutoScrolling(true);
        startAutoScroll();
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`scroll-reader-container ${isEyeProtectionActive ? 'eye-protection' : ''}`}
      onScroll={handleScroll}
      onClick={handleContainerClick}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight
      }}
    >
      {/* DEBUG: Display current settings */}
      {/* <div style={{ position: 'fixed', bottom: '60px', left: '20px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', borderRadius: '5px', zIndex: 1000, fontSize: '12px' }}>
        Font: {fontSize}px | Line: {lineHeight} | BG: {backgroundColor} | Auto: {isAutoScrolling ? 'On' : 'Off'}
      </div> */}
      
      {/* 显示自动滚动指示器 */}
      {isAutoScrolling && (
        <div className="auto-scroll-indicator">
          自动滚动中...
        </div>
      )}
      
      {content ? (
        <div ref={contentRef} className="scroll-content">
          {formatContent()}
        </div>
      ) : (
        <div className="loading-container">
          <Spin size="large" />
          <p>加载中...</p>
        </div>
      )}
    </div>
  );
};

export default ScrollReader; 