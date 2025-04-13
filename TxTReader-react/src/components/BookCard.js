import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tooltip } from 'antd';
import { StarOutlined, StarFilled, FileTextOutlined } from '@ant-design/icons';
import { addFavorite, removeFavorite } from '../api';
import './BookCard.scss';

/**
 * 文本卡片组件 - 简洁书本样式
 */
const BookCard = ({ book, isFavorite, onFavoriteChange }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 处理点击卡片事件
  const handleClick = () => {
    navigate(`/reader/${encodeURIComponent(book.id)}`);
  };

  // 处理收藏按钮点击
  const handleFavoriteClick = async (e) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
    
    if (loading) return;
    
    setLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(book.id);
      } else {
        await addFavorite({ id: book.id, title: book.title });
      }
      // 通知父组件更新状态
      onFavoriteChange(book.id, !isFavorite);
    } catch (error) {
      console.error('处理收藏失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 生成书本颜色
  const getBookColor = () => {
    const colors = [
      'linear-gradient(145deg, #ff8a5c, #ea5f35)',
      'linear-gradient(145deg, #3498db, #2980b9)',
      'linear-gradient(145deg, #2ecc71, #27ae60)',
      'linear-gradient(145deg, #9b59b6, #8e44ad)',
      'linear-gradient(145deg, #f1c40f, #f39c12)',
      'linear-gradient(145deg, #1abc9c, #16a085)',
      'linear-gradient(145deg, #e74c3c, #c0392b)'
    ];
    
    // 使用书名生成固定的颜色
    const hash = book.title.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + acc;
    }, 0);
    
    return colors[hash % colors.length];
  };

  return (
    <Card
      className={`book-card ${isFavorite ? 'favorite' : ''}`}
      onClick={handleClick}
      hoverable
    >
      <div className="book-cover" style={{ background: getBookColor() }}>
        <FileTextOutlined className="book-icon" />
        <div className="book-pages"></div>
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <Tooltip title={isFavorite ? '取消收藏' : '添加收藏'}>
          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''}`} 
            onClick={handleFavoriteClick}
            disabled={loading}
          >
            {isFavorite ? <StarFilled /> : <StarOutlined />}
          </button>
        </Tooltip>
      </div>
    </Card>
  );
};

export default BookCard; 