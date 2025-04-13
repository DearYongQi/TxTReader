import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { 
  Drawer, Slider, Switch, Button,
  Tooltip, Divider
} from 'antd';
import { 
  SettingOutlined, ArrowLeftOutlined, 
  BgColorsOutlined, FontSizeOutlined, LineHeightOutlined,
  EyeOutlined, RollbackOutlined,
  PlayCircleOutlined, CheckOutlined
} from '@ant-design/icons';
import './ReaderControls.scss';

/**
 * 阅读器控制面板组件
 */
const ReaderControls = forwardRef((props, ref) => {
  const {
    settings,
    updateSetting,
    resetSettings,
    toggleEyeProtection,
    toggleAutoScroll,
    handleBack,
    bookName
  } = props;
  
  const [visible, setVisible] = useState(false);
  const [statusBarVisible, setStatusBarVisible] = useState(true);
  const statusBarTimerRef = useRef(null);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    // 切换状态栏显示/隐藏
    toggleStatusBar: () => {
      // 如果抽屉打开时不切换状态栏
      if (visible) return;
      
      const newVisibility = !statusBarVisible;
      setStatusBarVisible(newVisibility);
      
      // 如果切换为显示，则设置自动隐藏定时器
      if (newVisibility) {
        autoHideStatusBar();
      } else if (statusBarTimerRef.current) {
        // 如果切换为隐藏，清除已有定时器
        clearTimeout(statusBarTimerRef.current);
      }
    }
  }));

  // 打开抽屉
  const showDrawer = () => {
    setVisible(true);
    // 打开抽屉时显示状态栏
    setStatusBarVisible(true);
    // 清除定时器
    if (statusBarTimerRef.current) {
      clearTimeout(statusBarTimerRef.current);
    }
  };

  // 关闭抽屉
  const onClose = () => {
    setVisible(false);
    // 关闭抽屉后启动自动隐藏计时器
    autoHideStatusBar();
  };

  // 自动隐藏状态栏
  const autoHideStatusBar = () => {
    if (statusBarTimerRef.current) {
      clearTimeout(statusBarTimerRef.current);
    }
    
    statusBarTimerRef.current = setTimeout(() => {
      setStatusBarVisible(false);
    }, 2000); // 2秒后自动隐藏
  };
  
  // 组件挂载时设置自动隐藏
  useEffect(() => {
    autoHideStatusBar();
    
    return () => {
      if (statusBarTimerRef.current) {
        clearTimeout(statusBarTimerRef.current);
      }
    };
  }, []);

  // 更改背景颜色
  const handleColorChange = (color) => {
    updateSetting('background', color.value);
    updateSetting('color', color.textColor);
  };

  // 预设的背景颜色选项
  const bgColors = [
    { name: '默认', value: '#fff8f5', textColor: '#333333' },
    { name: '护眼', value: '#f0f8e6', textColor: '#3a3a3a' },
    { name: '暖黄', value: '#faf6e9', textColor: '#5c4b00' },
    { name: '灰白', value: '#f5f5f5', textColor: '#333333' },
    { name: '暗黑', value: '#2c2c2c', textColor: '#e8e8e8' }
  ];

  return (
    <div className="reader-controls">
      <div className={`status-bar ${statusBarVisible ? '' : 'hidden'}`}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          className="control-btn"
        />
        
        <div className="book-title">{bookName}</div>
        
        <div className="spacer"></div>
        
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={showDrawer}
          className="control-btn"
          title="设置"
        />
      </div>

      <Drawer
        title="阅读设置"
        placement="right"
        onClose={onClose}
        open={visible}
        width={320}
        className="settings-drawer"
      >
        <div className="settings-panel">
          <div className="setting-item">
            <div className="setting-title">
              <FontSizeOutlined /> 字体大小
            </div>
            <Slider
              min={12}
              max={32}
              value={settings.fontSize}
              onChange={value => updateSetting('fontSize', value)}
            />
            <div className="slider-values">
              <span>小</span>
              <span>大</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-title">
              <LineHeightOutlined /> 行间距
            </div>
            <Slider
              min={1.3}
              max={2.5}
              step={0.1}
              value={settings.lineHeight}
              onChange={value => updateSetting('lineHeight', value)}
            />
            <div className="slider-values">
              <span>紧</span>
              <span>宽</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-title">
              <BgColorsOutlined /> 背景颜色
            </div>
            <div className="color-picker">
              {bgColors.map(color => (
                <div 
                  key={color.value} 
                  className="color-option-wrapper"
                  onClick={() => handleColorChange(color)}
                >
                  <Tooltip title={color.name}>
                    <div
                      className={`color-option ${settings.background === color.value ? 'active' : ''}`}
                      style={{ backgroundColor: color.value }}
                    >
                      {settings.background === color.value && (
                        <CheckOutlined className="check-icon" />
                      )}
                    </div>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          <div className="setting-item switch-item">
            <div className="setting-title">
              <EyeOutlined /> 护眼模式
            </div>
            <Switch
              checked={settings.isEyeProtection}
              onChange={toggleEyeProtection}
            />
          </div>

          <div className="setting-item switch-item">
            <div className="setting-title">
              <PlayCircleOutlined /> 自动滚动
            </div>
            <Switch
              checked={settings.autoScroll}
              onChange={toggleAutoScroll}
            />
          </div>

          {settings.autoScroll && (
            <div className="setting-item">
              <div className="setting-title">
                自动滚动速度
              </div>
              <Slider
                min={1}
                max={5}
                value={settings.autoScrollSpeed}
                onChange={value => updateSetting('autoScrollSpeed', value)}
              />
              <div className="slider-values">
                <span>慢</span>
                <span>快</span>
              </div>
            </div>
          )}

          <Divider />

          <div className="setting-item">
            <Button 
              icon={<RollbackOutlined />} 
              onClick={resetSettings}
              block
            >
              恢复默认设置
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
});

export default ReaderControls; 