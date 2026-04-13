//#conditional

import React from 'react-native';
import {logger, consoleTransport, defLvlType} from 'react-native-logs';

let transport = [];
//#if PRODUCTION
transport = [];
//#else
transport = consoleTransport;
//#endif

let severity = '';
//#if PRODUCTION
severity = 'error';
//#else
severity = 'debug';
//#endif

const configs = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  transport: transport,
  severity: severity,
  transportOptions: {
    colors: {
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
    extensionColors: {
      root: 'magenta',
      home: 'grey',
      user: 'blue',
    },
  },
  async: true,
  asyncFunc: React.InteractionManager.runAfterInteractions,
  dateFormat: 'time',
  printLevel: true,
  printDate: true,
  enabled: true,
};

export const psLogger = logger.createLogger<defLvlType>(configs);
