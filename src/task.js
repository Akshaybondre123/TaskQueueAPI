
const redisClient = require('./redisc');
const winston = require('winston');


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: './logs/task-log.log' }),
    new winston.transports.Console()
  ]
});


async function task(user_id) {
  const logEntry = `${user_id} - Task completed at ${new Date().toISOString()}`;
  logger.info(logEntry);
}


async function queueTask(user_id) {
  const taskData = { user_id, timestamp: Date.now() };
  await redisClient.lpush(`task_queue:${user_id}`, JSON.stringify(taskData));
}


async function processQueue() {
  const users = await redisClient.keys('task_queue:*');
  for (const userKey of users) {
    const user_id = userKey.split(':')[1];
    const taskData = await redisClient.rpop(userKey);
    if (taskData) {
      const parsedTask = JSON.parse(taskData);
      await task(parsedTask.user_id);
    }
  }
}


setInterval(processQueue, 1000);

module.exports = { task, queueTask, processQueue };
