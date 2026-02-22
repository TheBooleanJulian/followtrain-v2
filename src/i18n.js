// Internationalization system for FollowTrain
// Development mode with extensive debugging

const translations = {
  en: {
    // Core UI
    appTitle: 'FollowTrain',
    appDescription: 'Share your social profiles with a group. No login required.',
    joinTrain: 'Join Train',
    createTrain: 'Create Train',
    trainName: 'Train Name',
    displayName: 'Display Name',
    participants: 'Participants',
    
    // Social Media Platforms
    instagram: 'Instagram',
    tiktok: 'TikTok',
    twitter: 'X/Twitter',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    twitch: 'Twitch',
    facebook: 'Facebook',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    discord: 'Discord',
    github: 'GitHub',
    
    // Actions
    join: 'Join',
    create: 'Create',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    copy: 'Copy',
    export: 'Export',
    lock: 'Lock',
    unlock: 'Unlock',
    
    // Messages
    loading: 'Loading...',
    saving: 'Saving...',
    success: 'Success!',
    error: 'Error',
    noParticipants: 'No participants yet',
    trainNotFound: 'Train not found',
    invalidTrainId: 'Invalid train ID',
    
    // Activity Feed
    activityFeed: 'Activity Feed',
    joinedTrain: 'joined the train',
    leftTrain: 'left the train',
    updatedProfile: 'updated their profile',
    trainLocked: 'Train was locked',
    trainUnlocked: 'Train was unlocked',
    
    // Admin Panel
    adminPanel: 'Admin Panel',
    trainControls: 'Train Controls',
    reclaimAccess: 'Reclaim Admin Access',
    clearTrain: 'Clear Train',
    
    // Theme Customization
    themeCustomization: 'Theme Customization',
    themePresets: 'Theme Presets',
    customColors: 'Custom Colors',
    preview: 'Preview',
    
    // Export Options
    exportOptions: 'Export Options',
    selectAll: 'Select All',
    clearAll: 'Clear All',
    copyToClipboard: 'Copy to Clipboard',
    downloadAsFile: 'Download as File',
    
    // Debug
    debugMode: 'Debug Mode',
    enableDebug: 'Enable Debug',
    disableDebug: 'Disable Debug',
    
    // Additional UI Elements
    language: 'Language',
    debugPanel: 'Debug Panel',
    debugInfo: 'Debug Info',
    logs: 'Logs',
    or: 'Or',
    enterTrainId: 'Enter Train ID',
    sampleCard: 'Sample Card',
    primary: 'Primary',
    secondary: 'Secondary',
    accent: 'Accent',
    background: 'Background',
    text: 'Text',
    card: 'Card',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy'
  },
  

  
  zh: {
    // Core UI
    appTitle: 'FollowTrain',
    appDescription: '与群组分享您的社交档案。无需登录。',
    joinTrain: '加入列车',
    createTrain: '创建列车',
    trainName: '列车名称',
    displayName: '显示名称',
    participants: '参与者',
    
    // Social Media Platforms
    instagram: 'Instagram',
    tiktok: 'TikTok',
    twitter: 'X/推特',
    linkedin: '领英',
    youtube: 'YouTube',
    twitch: 'Twitch',
    facebook: 'Facebook',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    discord: 'Discord',
    github: 'GitHub',
    
    // Actions
    join: '加入',
    create: '创建',
    cancel: '取消',
    save: '保存',
    edit: '编辑',
    delete: '删除',
    copy: '复制',
    export: '导出',
    lock: '锁定',
    unlock: '解锁',
    
    // Messages
    loading: '加载中...',
    saving: '保存中...',
    success: '成功！',
    error: '错误',
    noParticipants: '暂无参与者',
    trainNotFound: '列车未找到',
    invalidTrainId: '无效的列车ID',
    
    // Activity Feed
    activityFeed: '活动动态',
    joinedTrain: '加入了列车',
    leftTrain: '离开了列车',
    updatedProfile: '更新了个人资料',
    trainLocked: '列车已锁定',
    trainUnlocked: '列车已解锁',
    
    // Admin Panel
    adminPanel: '管理面板',
    trainControls: '列车控制',
    reclaimAccess: '恢复管理员权限',
    clearTrain: '清空列车',
    
    // Theme Customization
    themeCustomization: '主题定制',
    themePresets: '主题预设',
    customColors: '自定义颜色',
    preview: '预览',
    
    // Export Options
    exportOptions: '导出选项',
    selectAll: '全选',
    clearAll: '清空',
    copyToClipboard: '复制到剪贴板',
    downloadAsFile: '下载为文件',
    
    // Debug
    debugMode: '调试模式',
    enableDebug: '启用调试',
    disableDebug: '禁用调试',
    
    // Additional UI Elements
    language: '语言',
    debugPanel: '调试面板',
    debugInfo: '调试信息',
    logs: '日志',
    or: '或',
    enterTrainId: '输入列车ID',
    sampleCard: '示例卡片',
    primary: '主色',
    secondary: '辅色',
    accent: '强调色',
    background: '背景色',
    text: '文字色',
    card: '卡片色',
    terms: '服务条款',
    privacy: '隐私政策'
  }
};

// Language detection and management
class I18nManager {
  constructor() {
    this.currentLanguage = this.detectLanguage();
    this.debugMode = false;
    this.debugLogs = [];
  }
  
  // Detect user's preferred language
  detectLanguage() {
    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && translations[langParam]) {
      console.log('[I18N] Language set from URL parameter:', langParam);
      return langParam;
    }
    
    // Check localStorage
    const savedLang = localStorage.getItem('followtrain_language');
    if (savedLang && translations[savedLang]) {
      console.log('[I18N] Language set from localStorage:', savedLang);
      return savedLang;
    }
    
    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (translations[browserLang]) {
      console.log('[I18N] Language set from browser:', browserLang);
      return browserLang;
    }
    
    // Default to English
    console.log('[I18N] Defaulting to English');
    return 'en';
  }
  
  // Set current language
  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('followtrain_language', lang);
      console.log('[I18N] Language changed to:', lang);
      return true;
    }
    console.warn('[I18N] Unsupported language:', lang);
    return false;
  }
  
  // Get translation
  t(key, params = {}) {
    const translation = translations[this.currentLanguage]?.[key] || translations.en?.[key] || key;
    
    // Handle parameter substitution
    let result = translation;
    Object.keys(params).forEach(param => {
      result = result.replace(`{${param}}`, params[param]);
    });
    
    if (this.debugMode) {
      this.debugLogs.push({
        timestamp: new Date().toISOString(),
        key,
        language: this.currentLanguage,
        translation: result,
        params
      });
    }
    
    return result;
  }
  
  // Get available languages
  getAvailableLanguages() {
    return Object.keys(translations).map(lang => ({
      code: lang,
      name: this.getLanguageName(lang)
    }));
  }
  
  // Get language display name
  getLanguageName(langCode) {
    const names = {
      en: 'English',
      zh: '中文'
    };
    return names[langCode] || langCode;
  }
  
  // Enable debug mode
  enableDebug() {
    this.debugMode = true;
    console.log('[I18N] Debug mode enabled');
  }
  
  // Disable debug mode
  disableDebug() {
    this.debugMode = false;
    console.log('[I18N] Debug mode disabled');
  }
  
  // Get debug info
  getDebugInfo() {
    return {
      currentLanguage: this.currentLanguage,
      availableLanguages: this.getAvailableLanguages(),
      debugMode: this.debugMode,
      debugLogs: this.debugLogs.slice(-20) // Last 20 logs
    };
  }
}

// Create singleton instance
const i18n = new I18nManager();

// Export for use in components
export default i18n;
export { translations };