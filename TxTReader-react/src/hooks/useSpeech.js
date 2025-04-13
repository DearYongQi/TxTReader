import { useState, useEffect, useRef } from 'react';
import { message } from 'antd';

/**
 * 语音朗读Hook，管理文本朗读功能
 * @param {Object} settings - 阅读器设置
 * @returns {Object} 语音朗读相关的状态和函数
 */
const useSpeech = (settings) => {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const speechSynthesisRef = useRef(null);
  const utteranceRef = useRef(null);
  const textChunksRef = useRef([]);
  const currentChunkIndexRef = useRef(0);
  const isInitializedRef = useRef(false);

  // 检查浏览器是否支持语音合成
  const checkSpeechSupport = () => {
    return typeof window !== 'undefined' && 
           'speechSynthesis' in window && 
           'SpeechSynthesisUtterance' in window;
  };

  // 初始化语音合成API并获取可用声音
  useEffect(() => {
    if (!checkSpeechSupport()) {
      console.warn("当前浏览器不支持语音合成API");
      return;
    }

    // 保存全局引用，避免直接使用window对象
    speechSynthesisRef.current = window.speechSynthesis;

    // 获取可用声音列表
    const loadVoices = () => {
      try {
        // 重置语音状态
        setSpeaking(false);
        setPaused(false);
        
        if (!speechSynthesisRef.current) return;
        
        const voices = speechSynthesisRef.current.getVoices();
        
        if (!voices || voices.length === 0) {
          console.warn("没有找到可用的语音");
          return;
        }
        
        // 过滤出中文语音，优先使用
        const chineseVoices = voices.filter(voice => 
          voice.lang && (
            voice.lang.includes('zh') || 
            voice.lang.includes('cmn') || 
            voice.lang.includes('CN') ||
            voice.name.includes('Chinese')
          )
        );
        
        const voicesToUse = chineseVoices.length > 0 ? chineseVoices : voices;
        setAvailableVoices(voicesToUse);
        
        if (voicesToUse.length > 0 && !isInitializedRef.current) {
          // 找到默认中文语音
          const defaultVoice = voicesToUse.find(v => 
            v.lang && (
              v.lang.includes('zh') || 
              v.lang.includes('cmn') || 
              v.lang.includes('CN')
            ) && v.default
          ) || voicesToUse[0];
          
          if (defaultVoice && !settings.speechVoice) {
            // 设置默认语音
            isInitializedRef.current = true;
          }
        }
      } catch (error) {
        console.error("获取语音列表出错:", error);
      }
    };

    // 立即尝试加载语音
    loadVoices();

    // 某些浏览器（如Chrome）可能需要等待voiceschanged事件
    if (speechSynthesisRef.current.onvoiceschanged !== undefined) {
      speechSynthesisRef.current.onvoiceschanged = loadVoices;
    }

    // Safari语音加载延迟处理
    const safariVoicesTimeout = setTimeout(loadVoices, 1000);

    // Chrome语音合成bug修复：Chrome中有时会停止朗读
    const intervalId = setInterval(() => {
      if (speechSynthesisRef.current && speaking && !paused) {
        speechSynthesisRef.current.pause();
        speechSynthesisRef.current.resume();
      }
    }, 10000);

    // 清理函数
    return () => {
      clearTimeout(safariVoicesTimeout);
      clearInterval(intervalId);
      if (speechSynthesisRef.current) {
        try {
          speechSynthesisRef.current.cancel();
        } catch (e) {
          console.error("停止语音合成时出错:", e);
        }
      }
    };
  }, [speaking, paused, settings.speechVoice]);

  // 将文本拆分成适当大小的块
  const splitTextIntoChunks = (text) => {
    if (!text) return [];
    
    // 将文本按自然段落分隔
    const paragraphs = text.split(/\n+/).filter(p => p.trim() !== '');
    const chunks = [];
    const maxChunkLength = 160; // 每个语音块的最大长度
    
    paragraphs.forEach(paragraph => {
      // 如果段落较短，直接作为一个块
      if (paragraph.length <= maxChunkLength) {
        chunks.push(paragraph);
      } else {
        // 如果段落较长，按句子分割
        const sentences = paragraph.split(/(?<=[。，？！.,:;?!])\s*/);
        let currentChunk = '';
        
        sentences.forEach(sentence => {
          // 如果单个句子超长，需要再次分割
          if (sentence.length > maxChunkLength) {
            // 按字符长度分割长句子
            for (let i = 0; i < sentence.length; i += maxChunkLength) {
              chunks.push(sentence.substring(i, i + maxChunkLength));
            }
          } else if (currentChunk.length + sentence.length > maxChunkLength) {
            // 当前块加上这个句子会超长，先保存当前块，然后开始新块
            chunks.push(currentChunk);
            currentChunk = sentence;
          } else {
            // 将句子添加到当前块
            currentChunk += sentence;
          }
        });
        
        // 添加最后一个块
        if (currentChunk) {
          chunks.push(currentChunk);
        }
      }
    });
    
    return chunks;
  };

  // 处理当前文本块朗读完成后的操作
  const handleUtteranceEnd = () => {
    // 检查是否还有下一个块
    if (currentChunkIndexRef.current < textChunksRef.current.length - 1) {
      // 继续朗读下一个块
      currentChunkIndexRef.current++;
      speakCurrentChunk();
    } else {
      // 所有块朗读完毕
      setSpeaking(false);
      setPaused(false);
      currentChunkIndexRef.current = 0;
      message.success('朗读完成');
    }
  };

  // 朗读当前文本块
  const speakCurrentChunk = () => {
    if (!checkSpeechSupport() || !speechSynthesisRef.current) return;
    
    try {
      const currentText = textChunksRef.current[currentChunkIndexRef.current];
      if (!currentText) return;
      
      // 创建语音实例
      const newUtterance = new SpeechSynthesisUtterance(currentText);
      utteranceRef.current = newUtterance;
      
      // 设置语音参数
      newUtterance.rate = settings.speechRate || 1;
      newUtterance.pitch = settings.speechPitch || 1;
      newUtterance.volume = settings.speechVolume || 1;
      
      // 设置选择的语音
      if (settings.speechVoice && availableVoices.length > 0) {
        const selectedVoice = availableVoices.find(voice => voice.name === settings.speechVoice);
        if (selectedVoice) {
          newUtterance.voice = selectedVoice;
        } else if (availableVoices.length > 0) {
          newUtterance.voice = availableVoices[0];
        }
      } else if (availableVoices.length > 0) {
        newUtterance.voice = availableVoices[0];
      }
      
      // 结束回调
      newUtterance.onend = handleUtteranceEnd;
      
      // 错误回调
      newUtterance.onerror = (event) => {
        console.error('语音合成出错:', event);
        if (event.error === 'interrupted' || event.error === 'canceled') {
          // 用户或系统中断，不显示错误
          return;
        }
        message.error(`语音合成出错: ${event.error}`);
        setSpeaking(false);
        setPaused(false);
      };
      
      // 开始朗读
      speechSynthesisRef.current.speak(newUtterance);
    } catch (error) {
      console.error('启动语音合成出错:', error);
      message.error('语音合成出错，请检查浏览器设置');
      setSpeaking(false);
      setPaused(false);
    }
  };

  // 开始朗读文本
  const speak = (text, startPosition = 0) => {
    if (!checkSpeechSupport()) {
      message.error('您的浏览器不支持语音合成功能');
      return;
    }
    
    // 确保有文本可读
    if (!text || text.trim() === '') {
      message.warning('没有可朗读的文本');
      return;
    }

    try {
      // 重置状态
      setSpeaking(true);
      setPaused(false);
      
      // 取消之前的朗读
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      
      // 将文本分成多个块
      const chunks = splitTextIntoChunks(text);
      textChunksRef.current = chunks;
      
      // 设置开始位置
      if (startPosition && startPosition > 0 && startPosition < chunks.length) {
        currentChunkIndexRef.current = startPosition;
      } else {
        currentChunkIndexRef.current = 0;
      }
      
      // 开始朗读第一个块
      if (chunks.length > 0) {
        speakCurrentChunk();
      } else {
        setSpeaking(false);
        message.warning('没有可朗读的内容');
      }
    } catch (error) {
      console.error('准备语音合成时出错:', error);
      message.error('语音合成初始化失败');
      setSpeaking(false);
    }
  };

  // 暂停朗读
  const pause = () => {
    if (!checkSpeechSupport() || !speaking || !speechSynthesisRef.current) return;
    
    try {
      speechSynthesisRef.current.pause();
      setPaused(true);
      message.info('朗读已暂停');
    } catch (error) {
      console.error('暂停语音合成时出错:', error);
      message.error('暂停朗读失败');
    }
  };

  // 恢复朗读
  const resume = () => {
    if (!checkSpeechSupport() || !paused || !speechSynthesisRef.current) return;
    
    try {
      speechSynthesisRef.current.resume();
      setPaused(false);
      message.info('继续朗读');
    } catch (error) {
      console.error('恢复语音合成时出错:', error);
      message.error('恢复朗读失败');
    }
  };

  // 停止朗读
  const stop = () => {
    if (!checkSpeechSupport() || !speechSynthesisRef.current) return;
    
    try {
      speechSynthesisRef.current.cancel();
      setSpeaking(false);
      setPaused(false);
      currentChunkIndexRef.current = 0;
    } catch (error) {
      console.error('停止语音合成时出错:', error);
    }
  };

  // 切换朗读状态（播放/暂停/停止）
  const toggleSpeech = (text) => {
    if (speaking) {
      if (paused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(text);
    }
  };

  return {
    speaking,
    paused,
    availableVoices,
    speak,
    pause,
    resume,
    stop,
    toggleSpeech,
    currentChunkIndex: currentChunkIndexRef.current,
    totalChunks: textChunksRef.current.length
  };
};

export default useSpeech; 