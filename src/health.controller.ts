import { Controller, Get } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { RedisService } from './redis/redis.service'

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check() {
    await this.db.query('SELECT 1')
    let redisStatus = 'degraded'
    try {
      redisStatus = (await this.redis.ping()).toLowerCase()
    } catch {
      // Redis accelerates temporary operations but is not the source of truth.
    }
    return { status: 'ok', database: 'ok', redis: redisStatus, timestamp: new Date().toISOString() }
  }
}
