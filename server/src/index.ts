import { app } from './app.js';
import { config } from './config.js';
app.listen(config.port, process.env.HOST || (config.production ? '0.0.0.0' : '127.0.0.1'), () =>
  console.info(
    `Wyztec ${config.production ? 'production' : 'API'}: http://localhost:${config.port}`,
  ),
);
