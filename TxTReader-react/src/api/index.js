import axios from 'axios';

// 动态获取API地址，根据当前浏览器地址确定后端地址
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  // 如果是本地开发环境，使用相同的主机名但端口为5000
  // 如果部署在同一台服务器上，也能正确工作
  return `http://${hostname}:5000`;
};

const API_URL = getApiBaseUrl();
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 获取所有文本列表
 * @returns {Promise<Array>} 文本列表
 */
export const getBooks = async () => {
  try {
    const response = await api.get('/books');
    return response.data;
  } catch (error) {
    console.error('获取文本列表失败:', error);
    return { success: false, message: '获取文本列表失败', error: error.message };
  }
};

/**
 * 获取文本内容
 * @param {string} fileName - 文件名
 * @returns {Promise<string>} 文本内容
 */
export const getBookContent = async (fileName) => {
  try {
    const response = await api.get(`/books/content/${encodeURIComponent(fileName)}`);
    return response.data;
  } catch (error) {
    console.error('获取文本内容失败:', error);
    return { success: false, message: '获取文本内容失败', error: error.message };
  }
};

/**
 * 获取收藏列表
 * @returns {Promise<Array>} 收藏列表
 */
export const getFavorites = async () => {
  try {
    const response = await api.get('/favorites');
    return response.data;
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    return { success: false, message: '获取收藏列表失败', error: error.message };
  }
};

/**
 * 添加收藏
 * @param {Object} book - 书籍对象
 * @param {string} book.id - 书籍ID
 * @param {string} book.title - 书籍标题
 * @returns {Promise<Object>} 添加结果
 */
export const addFavorite = async (book) => {
  try {
    const response = await api.post('/favorites', book);
    return response.data;
  } catch (error) {
    console.error('添加收藏失败:', error);
    return { success: false, message: '添加收藏失败', error: error.message };
  }
};

/**
 * 取消收藏
 * @param {string} id - 书籍ID
 * @returns {Promise<Object>} 取消结果
 */
export const removeFavorite = async (id) => {
  try {
    const response = await api.delete(`/favorites/${encodeURIComponent(id)}`);
    return response.data;
  } catch (error) {
    console.error('取消收藏失败:', error);
    return { success: false, message: '取消收藏失败', error: error.message };
  }
}; 