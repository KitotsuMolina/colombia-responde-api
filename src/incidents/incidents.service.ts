import { Injectable, MessageEvent, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { interval, map, merge, Observable, Subject } from 'rxjs'
import { CreateIncidentDto } from './create-incident.dto'
import { Incident } from './incident.entity'
import { EvidenceService } from '../evidence/evidence.service'
import { UpdateIncidentLocationDto } from '../admin/update-incident-location.dto'
import { AdminCreateIncidentDto } from '../admin/admin-create-incident.dto'

@Injectable()
export class IncidentsService {
  private readonly events = new Subject<MessageEvent>()
  constructor(@InjectRepository(Incident) private readonly repository: Repository<Incident>,private readonly evidence:EvidenceService) {}
  findAll(department?: string) {
    return this.repository.find({ where: department ? { location: { departmentCode: department } } : {}, order: { createdAt: 'DESC' }, take: 200 })
  }
  async findOne(id:string){const incident=await this.repository.findOneBy({id});if(!incident)throw new NotFoundException('Reporte no encontrado');return{...incident,evidence:await this.evidence.list(id)}}
  stream():Observable<MessageEvent>{return merge(this.events.asObservable(),interval(20000).pipe(map(()=>({data:{type:'heartbeat'}}))))}
  async create(dto: CreateIncidentDto|AdminCreateIncidentDto) {
    const location={ ...dto.location, departmentCode:dto.location.departmentCode??'', municipalityCode:dto.location.municipalityCode??'' }
    const incident = this.repository.create({ ...dto, location, kind: dto.kind as Incident['kind'], coordinates: { type: 'Point', coordinates: [dto.longitude, dto.latitude] } })
    const saved=await this.repository.save(incident)
    this.events.next({data:{type:'incident',incident:saved}})
    return saved
  }
  async updateLocation(id:string,dto:UpdateIncidentLocationDto){const incident=await this.repository.findOneBy({id});if(!incident)throw new NotFoundException('Reporte no encontrado');incident.location.locality=dto.locality;incident.coordinates={type:'Point',coordinates:[dto.longitude,dto.latitude]};const saved=await this.repository.save(incident);this.events.next({data:{type:'incident',incident:saved}});return saved}
}
