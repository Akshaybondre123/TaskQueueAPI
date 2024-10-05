
require('dotenv').config(); 

const DEFAULT_REDIS_URL = 'redis://localhost:6379';

module.exports = {
  userRateLimitConfig: {
    tasksPerSecond: parseInt(process.env.TASKS_PER_SECOND) || 1,
    tasksPerMinute: parseInt(process.env.TASKS_PER_MINUTE) || 20, 
  },
  redisURL: process.env.REDIS_URL || DEFAULT_REDIS_URL,
};
