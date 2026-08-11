import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SafetyCheckIn } from './safety-check-in.entity'
import { SafetyCheckInsController } from './safety-check-ins.controller'
import { SafetyCheckInsService } from './safety-check-ins.service'
@Module({imports:[TypeOrmModule.forFeature([SafetyCheckIn])],controllers:[SafetyCheckInsController],providers:[SafetyCheckInsService]})
export class SafetyCheckInsModule {}
