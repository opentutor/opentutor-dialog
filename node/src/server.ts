/**
 * Module dependencies.
 */
import createApp from 'app';
import http from 'http';
import { logger } from 'utils/logging';

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: any) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

async function serverStart() {
  const app = await createApp();
  const port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);
  const server = http.createServer(app);
  server.on('error', (error: any) => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
      default:
        throw error;
    }
  });
  server.on('listening', () => {
    const addr = server.address();
    const bind =
      typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    logger.info(`Listening on ${bind}`);
  });
  server.listen(port);
  logger.info('node version ' + process.version);
}

serverStart();
