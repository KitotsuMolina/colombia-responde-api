import { Module } from '@nestjs/common';import { IncidentsModule } from '../incidents/incidents.module';import { AdminController } from './admin.controller';import { AdminGuard } from './admin.guard'
@Module({imports:[IncidentsModule],controllers:[AdminController],providers:[AdminGuard]}) export class AdminModule{}
