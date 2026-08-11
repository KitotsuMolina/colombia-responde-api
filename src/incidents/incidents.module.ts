import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Incident } from './incident.entity'
import { IncidentsController } from './incidents.controller'
import { IncidentsService } from './incidents.service'
import { EvidenceModule } from '../evidence/evidence.module'
@Module({ imports:[TypeOrmModule.forFeature([Incident]),EvidenceModule], controllers:[IncidentsController], providers:[IncidentsService] })
export class IncidentsModule {}
