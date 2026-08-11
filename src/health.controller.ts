import { Controller, Get } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import Redis from 'ioredis'

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  @Get()
  async check() {
    await this.db.query('SELECT 1')
    const redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379', { lazyConnect: true, maxRetriesPerRequest: 1 })
    let redisStatus = 'degraded'
    try {
      await redis.connect()
      redisStatus = (await redis.ping()).toLowerCase()
    } catch {
      // Redis accelerates temporary operations but is not the source of truth.
    } finally {
      redis.disconnect()
    }
    return { status: 'ok', database: 'ok', redis: redisStatus, timestamp: new Date().toISOString() }
  }
}
