import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { Redis as UpstashRedis } from '@upstash/redis'
import IORedis from 'ioredis'

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly restClient?: UpstashRedis
  private readonly tcpClient?: IORedis

  constructor() {
    const restUrl = process.env.UPSTASH_REDIS_REST_URL
    const restToken = process.env.UPSTASH_REDIS_REST_TOKEN
    if (restUrl && restToken) {
      this.restClient = new UpstashRedis({ url: restUrl, token: restToken })
    } else {
      this.tcpClient = new IORedis(process.env.REDIS_URL ?? 'redis://redis:6379', {
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        connectTimeout: 5_000,
        commandTimeout: 3_000,
        retryStrategy: (attempt) => Math.min(attempt * 200, 2_000),
      })
      this.tcpClient.on('error', () => {
        // Consumers decide how to degrade; credentials and errors are not logged here.
      })
    }
  }

  async ping() {
    if (this.restClient) return this.restClient.ping()
    if (!this.tcpClient) throw new Error('Redis no configurado')
    if (this.tcpClient.status === 'wait') await this.tcpClient.connect()
    return this.tcpClient.ping()
  }

  onApplicationShutdown() {
    this.tcpClient?.disconnect()
  }
}
