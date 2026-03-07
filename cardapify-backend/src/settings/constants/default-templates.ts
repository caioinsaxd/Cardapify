export interface RestaurantSettings {
  [key: string]: unknown;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    fontColor: string;
  };
  layout: {
    gridType: string;
    cardStyle: string;
    showImages: boolean;
    showDescriptions: boolean;
  };
  buttons: {
    shape: string;
    size: string;
    animation: string;
  };
  currency: string;
  timezone: string;
}

export interface WebSettings {
  [key: string]: unknown;
  logoUrl: string;
  coverImage: string;
  footer: {
    showFooter: boolean;
    customCSS: string;
  };
}

export interface TotemSettings {
  [key: string]: unknown;
  idle: {
    idleTimeout: number;
    showVideos: boolean;
    autoRotateCategories: boolean;
  };
  payment: {
    requirePaymentBeforeOrder: boolean;
  };
  sound: {
    soundEffects: boolean;
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  settings: RestaurantSettings;
  webSettings: WebSettings;
  totemSettings: TotemSettings;
}

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'dark',
    name: 'Dark Theme',
    description: 'Modern dark theme with vibrant accents',
    settings: {
      theme: {
        primaryColor: '#FF6B35',
        secondaryColor: '#2D2D2D',
        backgroundColor: '#1A1A1A',
        fontFamily: 'Roboto',
        fontColor: '#FFFFFF',
      },
      layout: {
        gridType: '3x3',
        cardStyle: 'ROUNDED',
        showImages: true,
        showDescriptions: true,
      },
      buttons: {
        shape: 'PILLOW',
        size: 'LARGE',
        animation: 'HOVER_ZOOM',
      },
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
    },
    webSettings: {
      logoUrl: '',
      coverImage: '',
      footer: {
        showFooter: true,
        customCSS: '',
      },
    },
    totemSettings: {
      idle: {
        idleTimeout: 60,
        showVideos: true,
        autoRotateCategories: true,
      },
      payment: {
        requirePaymentBeforeOrder: true,
      },
      sound: {
        soundEffects: true,
      },
    },
  },
  {
    id: 'light',
    name: 'Light Theme',
    description: 'Clean and bright light theme',
    settings: {
      theme: {
        primaryColor: '#007AFF',
        secondaryColor: '#F5F5F5',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Open Sans',
        fontColor: '#333333',
      },
      layout: {
        gridType: '2x5',
        cardStyle: 'SQUARE',
        showImages: true,
        showDescriptions: true,
      },
      buttons: {
        shape: 'SQUARE',
        size: 'MEDIUM',
        animation: 'NONE',
      },
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
    },
    webSettings: {
      logoUrl: '',
      coverImage: '',
      footer: {
        showFooter: true,
        customCSS: '',
      },
    },
    totemSettings: {
      idle: {
        idleTimeout: 90,
        showVideos: false,
        autoRotateCategories: false,
      },
      payment: {
        requirePaymentBeforeOrder: true,
      },
      sound: {
        soundEffects: false,
      },
    },
  },
  {
    id: 'orange',
    name: 'Orange (Fast Food Style)',
    description: 'Classic fast food theme inspired by major chains',
    settings: {
      theme: {
        primaryColor: '#DA291C',
        secondaryColor: '#FFC72C',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Arial',
        fontColor: '#000000',
      },
      layout: {
        gridType: '3x3',
        cardStyle: 'ROUNDED',
        showImages: true,
        showDescriptions: false,
      },
      buttons: {
        shape: 'PILLOW',
        size: 'LARGE',
        animation: 'HOVER_SCALE',
      },
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
    },
    webSettings: {
      logoUrl: '',
      coverImage: '',
      footer: {
        showFooter: false,
        customCSS: '',
      },
    },
    totemSettings: {
      idle: {
        idleTimeout: 45,
        showVideos: true,
        autoRotateCategories: true,
      },
      payment: {
        requirePaymentBeforeOrder: true,
      },
      sound: {
        soundEffects: true,
      },
    },
  },
  {
    id: 'blue',
    name: 'Blue Corporate',
    description: 'Professional blue theme for corporate restaurants',
    settings: {
      theme: {
        primaryColor: '#0056B3',
        secondaryColor: '#17A2B8',
        backgroundColor: '#F8F9FA',
        fontFamily: 'Roboto',
        fontColor: '#212529',
      },
      layout: {
        gridType: '2x4',
        cardStyle: 'SQUARE',
        showImages: true,
        showDescriptions: true,
      },
      buttons: {
        shape: 'ROUNDED',
        size: 'MEDIUM',
        animation: 'NONE',
      },
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
    },
    webSettings: {
      logoUrl: '',
      coverImage: '',
      footer: {
        showFooter: true,
        customCSS: '',
      },
    },
    totemSettings: {
      idle: {
        idleTimeout: 60,
        showVideos: false,
        autoRotateCategories: false,
      },
      payment: {
        requirePaymentBeforeOrder: true,
      },
      sound: {
        soundEffects: false,
      },
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean and simple design with focus on products',
    settings: {
      theme: {
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        backgroundColor: '#FAFAFA',
        fontFamily: 'Helvetica',
        fontColor: '#333333',
      },
      layout: {
        gridType: '1x10',
        cardStyle: 'SQUARE',
        showImages: true,
        showDescriptions: false,
      },
      buttons: {
        shape: 'SQUARE',
        size: 'SMALL',
        animation: 'NONE',
      },
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
    },
    webSettings: {
      logoUrl: '',
      coverImage: '',
      footer: {
        showFooter: false,
        customCSS: '',
      },
    },
    totemSettings: {
      idle: {
        idleTimeout: 120,
        showVideos: false,
        autoRotateCategories: false,
      },
      payment: {
        requirePaymentBeforeOrder: false,
      },
      sound: {
        soundEffects: false,
      },
    },
  },
  {
    id: 'festive',
    name: 'Festive',
    description: 'Colorful and fun theme for celebrations',
    settings: {
      theme: {
        primaryColor: '#E91E63',
        secondaryColor: '#9C27B0',
        backgroundColor: '#FFFDE7',
        fontFamily: 'Poppins',
        fontColor: '#424242',
      },
      layout: {
        gridType: '3x3',
        cardStyle: 'PILLOW',
        showImages: true,
        showDescriptions: true,
      },
      buttons: {
        shape: 'PILLOW',
        size: 'LARGE',
        animation: 'HOVER_BOUNCE',
      },
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
    },
    webSettings: {
      logoUrl: '',
      coverImage: '',
      footer: {
        showFooter: true,
        customCSS: '',
      },
    },
    totemSettings: {
      idle: {
        idleTimeout: 30,
        showVideos: true,
        autoRotateCategories: true,
      },
      payment: {
        requirePaymentBeforeOrder: true,
      },
      sound: {
        soundEffects: true,
      },
    },
  },
];

export const DEFAULT_SETTINGS: RestaurantSettings = DEFAULT_TEMPLATES[0].settings;
export const DEFAULT_WEB_SETTINGS: WebSettings = DEFAULT_TEMPLATES[0].webSettings;
export const DEFAULT_TOTEM_SETTINGS: TotemSettings = DEFAULT_TEMPLATES[0].totemSettings;
