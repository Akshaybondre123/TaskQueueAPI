
const cluster = require('cluster');
const os = require('os');
const numCPUs = 2; 

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);

  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, forking a new one...`);
    cluster.fork(); 
  });
} else {
  require('./app'); 
  console.log(`Worker process ${process.pid} is running`);
}
