import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Incident } from './incident.entity'
import { IncidentsController } from './incidents.controller'
import { IncidentsService } from './incidents.service'
import { EvidenceModule } from '../evidence/evidence.module'
import { ExternalMapSyncService } from './external-map-sync.service'
import { TerritorialResolutionService } from './territorial-resolution.service'
@Module({ imports:[TypeOrmModule.forFeature([Incident]),EvidenceModule], controllers:[IncidentsController], providers:[IncidentsService,ExternalMapSyncService,TerritorialResolutionService],exports:[IncidentsService] })
export class IncidentsModule {}
