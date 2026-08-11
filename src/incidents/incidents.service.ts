import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateIncidentDto } from './create-incident.dto'
import { Incident } from './incident.entity'

@Injectable()
export class IncidentsService {
  constructor(@InjectRepository(Incident) private readonly repository: Repository<Incident>) {}
  findAll(department?: string) {
    return this.repository.find({ where: department ? { location: { departmentCode: department } } : {}, order: { createdAt: 'DESC' }, take: 200 })
  }
  create(dto: CreateIncidentDto) {
    const location={ ...dto.location, departmentCode:dto.location.departmentCode??'', municipalityCode:dto.location.municipalityCode??'' }
    const incident = this.repository.create({ ...dto, location, kind: dto.kind as Incident['kind'], coordinates: { type: 'Point', coordinates: [dto.longitude, dto.latitude] } })
    return this.repository.save(incident)
  }
}
