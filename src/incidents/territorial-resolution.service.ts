import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Incident } from './incident.entity'

const SOURCE_NAME='Mapa de emergencia · Cali'
type ReverseResult={display_name?:string;address?:Record<string,string>}

@Injectable()
export class TerritorialResolutionService implements OnModuleInit,OnModuleDestroy{
  private readonly logger=new Logger(TerritorialResolutionService.name)
  private timer?:NodeJS.Timeout
  private running=false
  constructor(@InjectRepository(Incident) private readonly repository:Repository<Incident>){}
  onModuleInit(){this.timer=setInterval(()=>void this.resolveNext(),15_500);this.timer.unref()}
  onModuleDestroy(){if(this.timer)clearInterval(this.timer)}
  private async resolveNext(){if(this.running)return;this.running=true;try{const incident=await this.repository.createQueryBuilder('incident').where('incident.source_name = :sourceName',{sourceName:SOURCE_NAME}).andWhere("COALESCE(incident.source_data->>'territorialStatus','pending') = 'pending'").orderBy('incident.created_at','DESC').getOne();if(!incident)return;const coordinates=incident.coordinates as {coordinates?:[number,number]},[longitude,latitude]=coordinates.coordinates||[];if(!Number.isFinite(latitude)||!Number.isFinite(longitude))return;const url=new URL('https://nominatim.openstreetmap.org/reverse');url.search=new URLSearchParams({format:'jsonv2',lat:String(latitude),lon:String(longitude),zoom:'10',addressdetails:'1',layer:'address'}).toString();const response=await fetch(url,{headers:{accept:'application/json','user-agent':'ColombiaResponde/0.1 (https://colombiaresponde.kitotsu.dev)'},signal:AbortSignal.timeout(10_000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);const result=await response.json() as ReverseResult,address=result.address||{},countryCode=address.country_code?.toLowerCase(),data={...(incident.sourceData||{}),geocodingAttribution:'OpenStreetMap contributors · Nominatim'};if(countryCode!=='co'){incident.status='archived';incident.sourceData={...data,territorialStatus:countryCode?'outside_colombia':'unresolved',resolvedCountry:address.country||undefined};await this.repository.save(incident);return}const municipality=address.city||address.town||address.municipality||address.village||address.county||'Municipio por determinar',department=address.state||address.region||'Departamento por determinar',territory={departmentCode:address['ISO3166-2-lvl4']?.replace(/^CO-/,'')||'',departmentName:department,municipalityCode:'',municipalityName:municipality,locality:(address.suburb||address.neighbourhood||address.hamlet||incident.location.locality||result.display_name||'').slice(0,160)};incident.location=territory;incident.sourceData={...data,territorialStatus:'resolved',territory};await this.repository.save(incident);this.logger.log(`${incident.externalId}: ${municipality}, ${department}`)}catch(error){this.logger.warn(`No fue posible resolver un territorio: ${error instanceof Error?error.message:String(error)}`)}finally{this.running=false}}
}
