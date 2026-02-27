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
    wechat: 'WeChat',
    line: 'LINE',
    
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
    
    // Form Labels
    enterTrainName: 'Enter a name for your train',
    enterDisplayName: 'Enter your display name',
    enterTrainId: 'Enter Train ID',
    joinTrainButton: 'Join Train',
    createTrainButton: 'Create Train',
    or: 'or',
    noLoginRequired: 'No login required',
    
    // Platform Labels
    instagramLabel: 'Instagram',
    tiktokLabel: 'TikTok',
    twitterLabel: 'Twitter/X',
    youtubeLabel: 'YouTube',
    twitchLabel: 'Twitch',
    linkedinLabel: 'LinkedIn',
    facebookLabel: 'Facebook',
    whatsappLabel: 'WhatsApp',
    telegramLabel: 'Telegram',
    discordLabel: 'Discord',
    githubLabel: 'GitHub',
    wechatLabel: 'WeChat',
    lineLabel: 'LINE',
    
    // Username Labels
    instagramUsername: 'Instagram Username',
    tiktokUsername: 'TikTok Username',
    twitterUsername: 'Twitter/X Username',
    youtubeUsername: 'YouTube Username',
    twitchUsername: 'Twitch Username',
    linkedinUsername: 'LinkedIn Username',
    facebookUsername: 'Facebook Profile URL',
    whatsappUsername: 'WhatsApp Number',
    telegramUsername: 'Telegram Username',
    discordUsername: 'Discord Username',
    githubUsername: 'GitHub Username',
    wechatUsername: 'WeChat Username',
    lineUsername: 'LINE ID'
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
    twitter: 'X/Twitter',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    twitch: 'Twitch',
    facebook: 'Facebook',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    discord: 'Discord',
    github: 'GitHub',
    wechat: '微信',
    line: 'LINE',
    
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
    
    // Form Labels
    enterTrainName: '输入您的列车名称',
    enterDisplayName: '输入您的显示名称',
    enterTrainId: '输入列车ID',
    joinTrainButton: '加入列车',
    createTrainButton: '创建列车',
    or: '或',
    noLoginRequired: '无需登录',
    
    // Platform Labels
    instagramLabel: 'Instagram',
    tiktokLabel: 'TikTok',
    twitterLabel: 'Twitter/X',
    youtubeLabel: 'YouTube',
    twitchLabel: 'Twitch',
    linkedinLabel: 'LinkedIn',
    facebookLabel: 'Facebook',
    whatsappLabel: 'WhatsApp',
    telegramLabel: 'Telegram',
    discordLabel: 'Discord',
    githubLabel: 'GitHub',
    wechatLabel: '微信',
    lineLabel: 'LINE',
    
    // Username Labels
    instagramUsername: 'Instagram 用户名',
    tiktokUsername: 'TikTok 用户名',
    twitterUsername: 'Twitter/X 用户名',
    youtubeUsername: 'YouTube 用户名',
    twitchUsername: 'Twitch 用户名',
    linkedinUsername: 'LinkedIn 用户名',
    facebookUsername: 'Facebook 个人资料链接',
    whatsappUsername: 'WhatsApp 号码',
    telegramUsername: 'Telegram 用户名',
    discordUsername: 'Discord 用户名',
    githubUsername: 'GitHub 用户名',
    wechatUsername: '微信用户名',
    lineUsername: 'LINE ID'
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
  
  // Get translation for a key
  t(key, params = {}) {
    let translation = translations[this.currentLanguage]?.[key] || 
                     translations['en']?.[key] || 
                     key;
    
    // Replace parameters
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{{${param}}}`, params[param]);
    });
    
    // Debug logging
    if (this.debugMode) {
      this.debugLogs.push({
        timestamp: new Date().toISOString(),
        key,
        language: this.currentLanguage,
        translation,
        params
      });
    }
    
    return translation;
  }
  
  // Change language
  setLanguage(langCode) {
    if (translations[langCode]) {
      this.currentLanguage = langCode;
      localStorage.setItem('followtrain_language', langCode);
      console.log('[I18N] Language changed to:', langCode);
      return true;
    }
    console.warn('[I18N] Unsupported language:', langCode);
    return false;
  }
  
  // Get current language
  getCurrentLanguage() {
    return this.currentLanguage;
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