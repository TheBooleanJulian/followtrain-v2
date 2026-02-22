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
    disableDebug: 'Disable Debug'
  },
  
  es: {
    // Core UI
    appTitle: 'FollowTrain',
    appDescription: 'Comparte tus perfiles sociales con un grupo. Sin necesidad de iniciar sesión.',
    joinTrain: 'Unirse al Tren',
    createTrain: 'Crear Tren',
    trainName: 'Nombre del Tren',
    displayName: 'Nombre para Mostrar',
    participants: 'Participantes',
    
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
    join: 'Unirse',
    create: 'Crear',
    cancel: 'Cancelar',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    copy: 'Copiar',
    export: 'Exportar',
    lock: 'Bloquear',
    unlock: 'Desbloquear',
    
    // Messages
    loading: 'Cargando...',
    saving: 'Guardando...',
    success: '¡Éxito!',
    error: 'Error',
    noParticipants: 'Aún no hay participantes',
    trainNotFound: 'Tren no encontrado',
    invalidTrainId: 'ID de tren inválido',
    
    // Activity Feed
    activityFeed: 'Feed de Actividad',
    joinedTrain: 'se unió al tren',
    leftTrain: 'dejó el tren',
    updatedProfile: 'actualizó su perfil',
    trainLocked: 'El tren fue bloqueado',
    trainUnlocked: 'El tren fue desbloqueado',
    
    // Admin Panel
    adminPanel: 'Panel de Administración',
    trainControls: 'Controles del Tren',
    reclaimAccess: 'Recuperar Acceso de Admin',
    clearTrain: 'Limpiar Tren',
    
    // Theme Customization
    themeCustomization: 'Personalización de Tema',
    themePresets: 'Preajustes de Tema',
    customColors: 'Colores Personalizados',
    preview: 'Vista Previa',
    
    // Export Options
    exportOptions: 'Opciones de Exportación',
    selectAll: 'Seleccionar Todo',
    clearAll: 'Limpiar Todo',
    copyToClipboard: 'Copiar al Portapapeles',
    downloadAsFile: 'Descargar como Archivo',
    
    // Debug
    debugMode: 'Modo de Depuración',
    enableDebug: 'Habilitar Depuración',
    disableDebug: 'Deshabilitar Depuración'
  },
  
  fr: {
    // Core UI
    appTitle: 'FollowTrain',
    appDescription: 'Partagez vos profils sociaux avec un groupe. Pas de connexion requise.',
    joinTrain: 'Rejoindre le Train',
    createTrain: 'Créer un Train',
    trainName: 'Nom du Train',
    displayName: 'Nom d\'Affichage',
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
    join: 'Rejoindre',
    create: 'Créer',
    cancel: 'Annuler',
    save: 'Sauvegarder',
    edit: 'Éditer',
    delete: 'Supprimer',
    copy: 'Copier',
    export: 'Exporter',
    lock: 'Verrouiller',
    unlock: 'Déverrouiller',
    
    // Messages
    loading: 'Chargement...',
    saving: 'Sauvegarde...',
    success: 'Succès !',
    error: 'Erreur',
    noParticipants: 'Aucun participant pour le moment',
    trainNotFound: 'Train non trouvé',
    invalidTrainId: 'ID de train invalide',
    
    // Activity Feed
    activityFeed: 'Flux d\'Activité',
    joinedTrain: 'a rejoint le train',
    leftTrain: 'a quitté le train',
    updatedProfile: 'a mis à jour son profil',
    trainLocked: 'Le train a été verrouillé',
    trainUnlocked: 'Le train a été déverrouillé',
    
    // Admin Panel
    adminPanel: 'Panneau d\'Administration',
    trainControls: 'Contrôles du Train',
    reclaimAccess: 'Récupérer l\'Accès Admin',
    clearTrain: 'Vider le Train',
    
    // Theme Customization
    themeCustomization: 'Personnalisation du Thème',
    themePresets: 'Préréglages de Thème',
    customColors: 'Couleurs Personnalisées',
    preview: 'Aperçu',
    
    // Export Options
    exportOptions: 'Options d\'Exportation',
    selectAll: 'Tout Sélectionner',
    clearAll: 'Tout Effacer',
    copyToClipboard: 'Copier dans le Presse-papiers',
    downloadAsFile: 'Télécharger en Fichier',
    
    // Debug
    debugMode: 'Mode Débogage',
    enableDebug: 'Activer le Débogage',
    disableDebug: 'Désactiver le Débogage'
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
      es: 'Español',
      fr: 'Français'
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