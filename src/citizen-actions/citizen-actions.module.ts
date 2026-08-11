import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CitizenAction } from './citizen-action.entity'
import { CitizenActionsController } from './citizen-actions.controller'
import { CitizenActionsService } from './citizen-actions.service'

@Module({imports:[TypeOrmModule.forFeature([CitizenAction])],controllers:[CitizenActionsController],providers:[CitizenActionsService],exports:[CitizenActionsService]})
export class CitizenActionsModule{}
