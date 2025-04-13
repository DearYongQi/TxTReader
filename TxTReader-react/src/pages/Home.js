import React, { useState, useEffect } from 'react';
import { Empty, Pagination, Spin } from 'antd';
import Header from '../components/Header';
import BookCard from '../components/BookCard';
import { getBooks, getFavorites } from '../api';
import { paginate } from '../utils';
import './Home.scss';

/**
 * 首页组件
 * @returns {JSX.Element} Home组件
 */
const Home = () => {
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // 获取所有文本和收藏
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 并行请求获取文本列表和收藏列表
        const [booksRes, favoritesRes] = await Promise.all([
          getBooks(),
          getFavorites()
        ]);

        if (booksRes.success) {
          setBooks(booksRes.data);
        } else {
          throw new Error(booksRes.message || '获取文本列表失败');
        }

        if (favoritesRes.success) {
          setFavorites(favoritesRes.data);
        } else {
          throw new Error(favoritesRes.message || '获取收藏列表失败');
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError(err.message || '获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 处理收藏变更
  const handleFavoriteChange = (id, isFavorite) => {
    if (isFavorite) {
      const book = books.find(b => b.id === id);
      if (book) {
        setFavorites(prev => [...prev, { id, title: book.title }]);
      }
    } else {
      setFavorites(prev => prev.filter(item => item.id !== id));
    }
  };

  // 筛选并排序书籍
  const filteredBooks = books
    .filter(book => 
      searchQuery === '' || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // 收藏的书放在前面
      const aFavorite = favorites.some(f => f.id === a.id);
      const bFavorite = favorites.some(f => f.id === b.id);
      
      if (aFavorite && !bFavorite) return -1;
      if (!aFavorite && bFavorite) return 1;
      
      // 按书名排序
      return a.title.localeCompare(b.title);
    });

  // 分页
  const paginatedBooks = paginate(filteredBooks, currentPage, pageSize);
  const totalItems = filteredBooks.length;

  // 翻页
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="home-page">
      <Header searchQuery={searchQuery} onSearch={setSearchQuery} />
      
      <div className="content-container">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <p>加载中...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>出错了: {error}</p>
          </div>
        ) : paginatedBooks.length > 0 ? (
          <>
            <div className="books-grid">
              {paginatedBooks.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  isFavorite={favorites.some(f => f.id === book.id)}
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </div>
            
            {totalItems > pageSize && (
              <div className="pagination-container">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalItems}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        ) : (
          <Empty 
            description={
              searchQuery ? `没有找到与"${searchQuery}"相关的文本` : "没有可读的文本"
            } 
          />
        )}
      </div>
    </div>
  );
};

export default Home; 