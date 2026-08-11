import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EmergencyResource } from './resource.entity'
import { ResourcesController } from './resources.controller'
@Module({ imports:[TypeOrmModule.forFeature([EmergencyResource])], controllers:[ResourcesController] })
export class ResourcesModule {}
