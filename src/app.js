
const express = require('express');
const rateLimit = require('express-rate-limit');
const redisClient = require('./redisc');
const { processQueue, queueTask } = require('./task');
const { userRateLimitConfig, redisURL } = require('../main/config');

const app = express();
app.use(express.json());


const limiter = rateLimit({
  windowMs: 1000, 
  max: 1,        
  handler: (req, res) => {
    const { user_id } = req.body;
    queueTask(user_id); 
    res.status(429).json({ message: 'Rate limit exceeded. Task queued.' });
  }
});


app.post('/task', limiter, async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

 
  const taskCount = await redisClient.incr(`task_count:${user_id}`);
  if (taskCount === 1) {
    await redisClient.expire(`task_count:${user_id}`, 60); 
  }

  if (taskCount > 20) {
    queueTask(user_id); 
    return res.status(429).json({ message: 'Rate limit exceeded. Task queued.' });
  }

  try {
   
    await processQueue(user_id);
    res.status(200).json({ message: 'Task completed successfully.' });
  } catch (error) {
    console.error(`Error processing task for user ${user_id}:`, error);
    res.status(500).json({ error: 'Failed to process task.' });
  }
});


app.listen(3000, () => {
  console.log('Server running on port 3000');
});
