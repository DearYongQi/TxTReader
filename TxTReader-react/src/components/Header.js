import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Input, Button, Switch } from 'antd';
import { SearchOutlined, BulbOutlined, BulbFilled, HomeOutlined } from '@ant-design/icons';
import { ThemeContext } from '../context/ThemeContext';
import './Header.scss';

/**
 * 页面顶部导航栏组件
 * @param {Object} props - 组件属性
 * @param {string} props.searchQuery - 搜索关键词
 * @param {Function} props.onSearch - 搜索回调函数
 * @returns {JSX.Element} Header组件
 */
const Header = ({ searchQuery, onSearch }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [searchText, setSearchText] = useState(searchQuery || '');

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchText);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active-nav-item' : '';
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1 className="logo">
            <Link to="/">小说阅读器</Link>
          </h1>
          
          {isHome && (
            <form className="search-box" onSubmit={handleSearchSubmit}>
              <Input
                placeholder="搜索文本..."
                value={searchText}
                onChange={handleSearch}
                prefix={<SearchOutlined />}
                allowClear
              />
            </form>
          )}
          
          <div className="header-actions">
            <div className="theme-switch">
              <span className="theme-icon">
                {theme === 'dark' ? <BulbFilled /> : <BulbOutlined />}
              </span>
              <Switch
                checked={theme === 'dark'}
                onChange={toggleTheme}
                checkedChildren="暗"
                unCheckedChildren="亮"
              />
            </div>
            
            {!isHome && (
              <Link to="/">
                <Button icon={<HomeOutlined />}>返回首页</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 