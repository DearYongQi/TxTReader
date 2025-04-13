/**
 * 延迟函数
 * @param {number} ms - 延迟时间（毫秒）
 * @returns {Promise} 延迟Promise
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 字节';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['字节', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * 存储数据到localStorage
 * @param {string} key - 键名
 * @param {any} value - 要存储的值
 */
export const saveToStorage = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('保存到localStorage失败:', error);
  }
};

/**
 * 从localStorage获取数据
 * @param {string} key - 键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 获取的值或默认值
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error('从localStorage获取数据失败:', error);
    return defaultValue;
  }
};

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * 生成随机ID
 * @returns {string} 随机ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * 获取设备类型
 * @returns {string} 设备类型（mobile, tablet, desktop）
 */
export const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < 768) {
    return 'mobile';
  } else if (width < 992) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * 分页函数
 * @param {Array} array - 要分页的数组
 * @param {number} page - 页码（从1开始）
 * @param {number} pageSize - 每页条数
 * @returns {Array} 分页后的数组
 */
export const paginate = (array, page, pageSize) => {
  const startIndex = (page - 1) * pageSize;
  return array.slice(startIndex, startIndex + pageSize);
}; 