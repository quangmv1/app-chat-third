import i18n, {
  InitOptions,
  Resource,
  ResourceLanguage,
  TFunction,
} from 'i18next';
import {psLogger} from '../utils';
import en from './resources/en.json';
import vi from './resources/vi.json';

import moment from 'moment';
// import 'moment/min/locales';
import 'moment/locale/vi';

const DEFAULT_LANGUAGE = 'vi';

moment.locale(DEFAULT_LANGUAGE);

const DEFAULT_NS = 'translation';

type PSi18nOptions = {
  language?: string;
  i18nOptions?: InitOptions;
  resources?: Resource;
};

export type PSTranslator = TFunction | ((key: string) => string);

export class PSi18n {
  i18n = i18n.createInstance();

  resources: Resource = {
    en: {
      translation: en,
    },
    vi: {
      translation: vi,
    },
  };

  i18nOptions: InitOptions;

  translator: PSTranslator = (key: string) => key;

  currentLanguage: string = DEFAULT_LANGUAGE;

  private onLanguageChangeListeners: ((t: PSTranslator) => void)[] = [];

  initialized = false;

  private waitForInitializing: Promise<void> | undefined;

  constructor(options: PSi18nOptions = {}) {
    if (options.language) {
      this.currentLanguage = options.language;
    }

    this.i18nOptions = {
      compatibilityJSON: 'v3',
      interpolation: {escapeValue: false},
      keySeparator: false,
      nsSeparator: false,
      parseMissingKeyHandler: (key: string) => {
        psLogger.error(`PSi18n: Missing translation for key: ${key}`);
        return key;
      },
      ...options.i18nOptions,
    };

    this.resources = {
      ...this.resources,
      ...options.resources,
    };

    this.validateCurrentLanguage();
  }

  async getTranslator() {
    if (!this.initialized) {
      if (this.waitForInitializing) {
        await this.waitForInitializing;
      } else {
        const initPromise = this.init();
        this.waitForInitializing = initPromise;
        await initPromise;
      }
    }
    return this.translator;
  }

  registerResource(language: string, resource: ResourceLanguage) {
    this.resources[language] = resource;
    if (this.initialized) {
      this.i18n.addResources(language, DEFAULT_NS, resource);
    }
  }

  async setLanguage(language: string) {
    this.currentLanguage = language;
    if (!this.initialized) {
      return this.translator;
    }
    try {
      moment.locale(language);

      this.translator = await this.i18n.changeLanguage(language);

      this.onLanguageChangeListeners.forEach(listener =>
        listener(this.translator),
      );
    } catch (error) {
      psLogger.error(`PSi18n: set language error: ${JSON.stringify(error)}`);
    }
    return this.translator;
  }

  addOnLanguageChangeListener(callback: (t: PSTranslator) => void) {
    this.onLanguageChangeListeners.push(callback);
    return {
      unsubscribe: () => {
        this.onLanguageChangeListeners = this.onLanguageChangeListeners.filter(
          listener => listener !== callback,
        );
      },
    };
  }

  private async init() {
    this.validateCurrentLanguage();
    try {
      this.translator = await this.i18n.init({
        ...this.i18nOptions,
        lng: this.currentLanguage,
        fallbackLng: DEFAULT_LANGUAGE,
        resources: this.resources,
      });
      this.initialized = true;
    } catch (error) {
      psLogger.error(`PSi18n: init error ${JSON.stringify(error)}`);
    }
    this.waitForInitializing = undefined;
  }

  private validateCurrentLanguage = () => {
    const availableLanguages = Object.keys(this.resources);
    if (availableLanguages.indexOf(this.currentLanguage) === -1) {
      psLogger.error(
        `PSi18n: ${this.currentLanguage} language is not registered.`,
      );
      this.currentLanguage = DEFAULT_LANGUAGE;
    }
  };
}
