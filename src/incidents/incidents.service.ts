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
    return this.repository.find({ where: department ? { location: { departmentCode: department },status:'active' } : {status:'active'}, order: { updatedAt: 'DESC' }, take: 1000 })
  }
  private async sourceLog(incident:Incident){if(incident.sourceName!=='Mapa de emergencia · Cali'||!incident.externalId)return[];try{const response=await fetch(`https://mapa-emergencia.artefactofilms.workers.dev/api/puntos/${encodeURIComponent(incident.externalId)}/bitacora`,{headers:{accept:'application/json','user-agent':'ColombiaResponde/0.1'},signal:AbortSignal.timeout(4_000)});if(!response.ok)return[];const payload=await response.json() as {bitacora?:Array<{texto?:string;autor?:string;ts?:number}>};return(payload.bitacora||[]).slice(0,100).filter(item=>item.texto&&Number.isFinite(item.ts)).map(item=>({text:item.texto!.slice(0,500),author:item.autor?.slice(0,80)||undefined,timestamp:item.ts!}))}catch{return[]}}
  async findOne(id:string){const incident=await this.repository.findOneBy({id});if(!incident)throw new NotFoundException('Reporte no encontrado');const[evidence,sourceLog]=await Promise.all([this.evidence.list(id),this.sourceLog(incident)]);return{...incident,evidence,sourceLog}}
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
