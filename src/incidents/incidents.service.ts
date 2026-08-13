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
    return this.repository.find({ where: department ? { location: { departmentCode: department },status:'active' } : {status:'active'}, order: { createdAt: 'DESC' }, take: 1000 })
  }
  async analytics(){const incidents=await this.repository.find({where:{status:'active'}}),external=incidents.filter(item=>item.sourceName==='Mapa de emergencia · Cali'&&item.sourceData?.territorialStatus==='resolved'),classify=(item:Incident)=>item.sourceData?.saturation==='exceso'||item.sourceData?.sourceState==='cubierto'?'attended':item.sourceData?.saturation==='faltan'?'pending':'unknown',groups=new Map<string,Incident[]>();for(const item of external){const key=`${item.location.municipalityName} · ${item.location.departmentName}`;groups.set(key,[...(groups.get(key)||[]),item])}const stats=(items:Incident[])=>{const attended=items.filter(item=>classify(item)==='attended').length,pending=items.filter(item=>classify(item)==='pending').length,unknown=items.length-attended-pending,classified=attended+pending;return{total:items.length,attended,pending,unknown,responseRate:classified?Math.round(attended/classified*1000)/10:null}};const cali=external.filter(item=>/cali/i.test(item.location.municipalityName)),now=Date.now(),pendingCali=cali.filter(item=>classify(item)==='pending'),ages=pendingCali.map(item=>(now-item.createdAt.getTime())/36e5),needs=new Map<string,{label:string;count:number}>();for(const item of cali)for(const need of (item.sourceData?.needs as string[]|undefined)||[]){const key=need.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();if(key){const current=needs.get(key);needs.set(key,{label:current?.label||need,count:(current?.count||0)+1})}}const hourly=Array.from({length:24},(_,offset)=>{const end=now-offset*36e5,start=end-36e5;return{hour:new Date(start).toISOString(),created:cali.filter(item=>item.createdAt.getTime()>=start&&item.createdAt.getTime()<end).length}}).reverse();return{generatedAt:new Date(),scope:'Cali',summary:stats(cali),pendingAge:{under1:ages.filter(v=>v<1).length,from1to3:ages.filter(v=>v>=1&&v<3).length,from3to6:ages.filter(v=>v>=3&&v<6).length,from6to12:ages.filter(v=>v>=6&&v<12).length,over12:ages.filter(v=>v>=12).length},cities:[...groups].map(([name,items])=>({name,...stats(items)})).sort((a,b)=>b.total-a.total).slice(0,20),needs:[...needs.values()].sort((a,b)=>b.count-a.count).slice(0,12),hourly,methodology:{attended:'Punto clasificado por la fuente como exceso/NO ACUDIR o cubierto.',pending:'Punto que informa que todav\u00eda faltan personas.',unknown:'No existe informaci\u00f3n suficiente sobre cobertura.',responseTimesAvailable:false,responseTimesNote:'La bit\u00e1cora hist\u00f3rica todav\u00eda no est\u00e1 persistida completamente; no se publica un tiempo de respuesta estimado como si fuera medido.'}}}
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
