import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateIncidentDto } from './create-incident.dto'
import { Incident } from './incident.entity'
import { EvidenceService } from '../evidence/evidence.service'

@Injectable()
export class IncidentsService {
  constructor(@InjectRepository(Incident) private readonly repository: Repository<Incident>,private readonly evidence:EvidenceService) {}
  findAll(department?: string) {
    return this.repository.find({ where: department ? { location: { departmentCode: department } } : {}, order: { createdAt: 'DESC' }, take: 200 })
  }
  async findOne(id:string){const incident=await this.repository.findOneBy({id});if(!incident)throw new NotFoundException('Reporte no encontrado');return{...incident,evidence:await this.evidence.list(id)}}
  create(dto: CreateIncidentDto) {
    const location={ ...dto.location, departmentCode:dto.location.departmentCode??'', municipalityCode:dto.location.municipalityCode??'' }
    const incident = this.repository.create({ ...dto, location, kind: dto.kind as Incident['kind'], coordinates: { type: 'Point', coordinates: [dto.longitude, dto.latitude] } })
    return this.repository.save(incident)
  }
}
