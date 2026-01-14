import { type Context,type Next } from 'hono'
import { logger } from '../lib/logger/index.js'
import { createMiddleware } from 'hono/factory'

export const loggerMiddleware = createMiddleware(async (c: Context, next: Next) => {
    const startTime = Date.now()
    const requestId = crypto.randomUUID()

    // Start tracking this request
    logger.startRequest(requestId)

    // Log request details
    const { method, url } = c.req
    const userAgent = c.req.header('user-agent') || 'Unknown'
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'Unknown'

    logger.request(`${method} ${url} | IP: ${ip} | UA: ${userAgent}`, requestId)

    // Add request ID to context for use in routes
    c.set('requestId', requestId)
    c.set('logger', logger)

    try {
        await next()

        const endTime = Date.now()
        const duration = endTime - startTime
        const status = c.res.status

        logger.response(`Response sent: ${status} | Duration: ${duration}ms`, requestId)

        // End request tracking
        logger.endRequest(requestId, status)

    } catch (error) {
        const endTime = Date.now()
        const duration = endTime - startTime

        logger.error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {
            requestId,
            tags: ['ERROR']
        })

        logger.endRequest(requestId, 500)
        throw error
    }
})