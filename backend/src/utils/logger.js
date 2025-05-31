import debug from 'debug';

// Create namespaced loggers
const authLogger = debug('app:auth');
const userLogger = debug('app:user');
const eventLogger = debug('app:event');

// Export individual loggers
export const auth = {
  info: (...args) => authLogger('INFO:', ...args),
  error: (...args) => authLogger('ERROR:', ...args),
  debug: (...args) => authLogger('DEBUG:', ...args),
};

export const user = {
  info: (...args) => userLogger('INFO:', ...args),
  error: (...args) => userLogger('ERROR:', ...args),
  debug: (...args) => userLogger('DEBUG:', ...args),
};

export const event = {
  info: (...args) => eventLogger('INFO:', ...args),
  error: (...args) => eventLogger('ERROR:', ...args),
  debug: (...args) => eventLogger('DEBUG:', ...args),
};
