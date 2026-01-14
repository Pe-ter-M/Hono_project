import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { transactions_route } from './transactions/transactions.route.js'
import { swaggerUI } from '@hono/swagger-ui'
import { openapiSpec } from './openapispec.js'
import { loggerMiddleware } from './middleware/logger.middleware.js';
import { logger } from './lib/logger/index.js';

const app = new Hono<{
  Variables: {
    logger: any;
    requestId: string;
  }
}>();

// Apply middleware
app.use('*', loggerMiddleware);


// Add Swagger UI endpoint
app.get('/swagger', swaggerUI({ url: '/openapi' }))

// Add OpenAPI JSON endpoint
app.get('/openapi', (c) => c.json(openapiSpec))

app.route('/transactions', transactions_route)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
