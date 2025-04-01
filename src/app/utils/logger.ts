import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize } = format;

// Custom format for logs
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Create the logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    // Write all logs to console
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        logFormat
      )
    }),
    // Write all logs with level 'error' and below to error.log
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      dirname: 'logs',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new transports.File({ 
      filename: 'logs/combined.log',
      dirname: 'logs',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // Prevent winston from exiting on error
  exitOnError: false
});

// Create a stream object with a 'write' function that will be used by morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

export default logger;
