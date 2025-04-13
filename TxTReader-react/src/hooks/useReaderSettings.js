import { useState, useEffect, useRef } from 'react';
import { getFromStorage, saveToStorage } from '../utils';

/**
 * 阅读器设置Hook，管理阅读器的各种设置
 * @returns {Object} 阅读器设置和设置函数
 */
const useReaderSettings = () => {
  // 默认设置
  const defaultSettings = {
    fontSize: 18,
    lineHeight: 1.8,
    background: '#fff8f5',
    color: '#333333',
    fontFamily: 'sans-serif',
    isEyeProtection: false,
    autoScroll: false,
    autoScrollSpeed: 2, // 1-5
    isDarkMode: false,
  };

  // 从localStorage获取设置，如果没有则使用默认设置
  const [settings, setSettings] = useState(() => {
    const savedSettings = getFromStorage('readerSettings', defaultSettings);
    console.log('从存储加载设置:', savedSettings);
    return savedSettings;
  });
  
  // 用于跟踪用户是否手动修改了背景色
  const userChangedBgRef = useRef(false);

  // 更新单个设置
  const updateSetting = (key, value) => {
    console.log(`更新设置: ${key} = `, value);
    
    // 如果用户手动修改了背景色或文本色，标记为已修改
    if (key === 'background' || key === 'color') {
      userChangedBgRef.current = true;
    }
    
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      // 立即保存到localStorage
      saveToStorage('readerSettings', newSettings);
      return newSettings;
    });
  };

  // 重置所有设置为默认值
  const resetSettings = () => {
    console.log('重置所有设置为默认值');
    userChangedBgRef.current = false;
    setSettings(defaultSettings);
    saveToStorage('readerSettings', defaultSettings);
  };

  // 切换护眼模式
  const toggleEyeProtection = () => {
    const newEyeProtection = !settings.isEyeProtection;
    console.log('切换护眼模式:', newEyeProtection);
    
    // 先更新护眼模式状态
    setSettings(prev => {
      const newSettings = { ...prev, isEyeProtection: newEyeProtection };
      saveToStorage('readerSettings', newSettings);
      
      // 只有在用户未手动修改背景色的情况下，自动切换背景色
      if (!userChangedBgRef.current) {
        if (newEyeProtection) {
          newSettings.background = '#f0f8e6';
          newSettings.color = '#3a3a3a';
        } else {
          newSettings.background = '#fff8f5';
          newSettings.color = '#333333';
        }
      }
      
      return newSettings;
    });
  };

  // 切换自动滚动
  const toggleAutoScroll = () => {
    const newAutoScroll = !settings.autoScroll;
    console.log('切换自动滚动:', newAutoScroll);
    
    setSettings(prev => {
      const newSettings = { ...prev, autoScroll: newAutoScroll };
      saveToStorage('readerSettings', newSettings);
      return newSettings;
    });
  };

  // 同步暗黑模式设置
  useEffect(() => {
    const darkMode = document.body.className === 'dark';
    
    // 只在初始化和主题模式发生变化时更新颜色
    if (settings.isDarkMode !== darkMode) {
      console.log('暗黑模式变化:', darkMode);
      
      setSettings(prev => {
        const newSettings = { ...prev, isDarkMode: darkMode };
        
        // 只有在用户未手动修改背景色的情况下，自动切换背景色
        if (!userChangedBgRef.current) {
          // 如果是暗黑模式，更新背景色和文本色
          if (darkMode) {
            newSettings.background = '#2c2c2c';
            newSettings.color = '#e8e8e8';
          } else {
            // 如果是亮色模式但启用了护眼模式，使用护眼色
            if (newSettings.isEyeProtection) {
              newSettings.background = '#f0f8e6';
              newSettings.color = '#3a3a3a';
            } else {
              newSettings.background = '#fff8f5';
              newSettings.color = '#333333';
            }
          }
        }
        
        saveToStorage('readerSettings', newSettings);
        return newSettings;
      });
    }
  }, [settings.isDarkMode]);

  return {
    settings,
    updateSetting,
    resetSettings,
    toggleEyeProtection,
    toggleAutoScroll,
  };
};

export default useReaderSettings; 