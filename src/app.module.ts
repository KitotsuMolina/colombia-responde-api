import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HealthController } from './health.controller'
import { IncidentsModule } from './incidents/incidents.module'
import { PeopleModule } from './people/people.module'
import { ResourcesModule } from './resources/resources.module'
import { RedisModule } from './redis/redis.module'
import { SafetyCheckInsModule } from './safety-check-ins/safety-check-ins.module'
import { EvidenceModule } from './evidence/evidence.module'
import { AdminModule } from './admin/admin.module'
import { CitizenActionsModule } from './citizen-actions/citizen-actions.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        ssl: config.get('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
      }),
    }),
    IncidentsModule,
    PeopleModule,
    ResourcesModule,
    RedisModule,
    SafetyCheckInsModule,
    EvidenceModule,
    AdminModule,
    CitizenActionsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
