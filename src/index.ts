import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { transactions_route } from './transactions/transactions.route.js'
import { swaggerUI } from '@hono/swagger-ui'
import { openapiSpec } from './openapispec.js'

const app = new Hono()

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
