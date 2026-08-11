import { createHash, randomBytes } from 'node:crypto'
import { GoneException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CitizenAction } from './citizen-action.entity'
import { CreateCitizenActionDto } from './citizen-action.dto'

const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex')

@Injectable()
export class CitizenActionsService {
  constructor(@InjectRepository(CitizenAction) private readonly repository:Repository<CitizenAction>,private readonly config:ConfigService){}
  findAll(){return this.repository.find({where:{status:'published'},order:{consentedAt:'DESC'},take:100})}
  async findOne(id:string){const action=await this.repository.findOneBy({id,status:'published'});if(!action)throw new NotFoundException('Acción ciudadana no encontrada');return action}
  async createDraft(dto:CreateCitizenActionDto){const token=randomBytes(32).toString('base64url'),validationExpiresAt=new Date(Date.now()+72*60*60*1000);const action=await this.repository.save(this.repository.create({...dto,status:'pending',validationTokenHash:tokenHash(token),validationExpiresAt}));const base=this.config.get<string>('PUBLIC_WEB_URL')?.replace(/\/$/,'')||'https://colombiaresponde.kitotsu.dev';return{actionId:action.id,status:action.status,validationExpiresAt,validationUrl:`${base}/acciones/validar?token=${encodeURIComponent(token)}`}}
  private async findByToken(token:string){const action=await this.repository.createQueryBuilder('action').addSelect('action.validationTokenHash').where('action.validationTokenHash = :hash',{hash:tokenHash(token)}).andWhere('action.status = :status',{status:'pending'}).getOne();if(!action)throw new NotFoundException('Enlace de validación inválido o utilizado');if(action.validationExpiresAt.getTime()<Date.now())throw new GoneException('El enlace de validación venció');return action}
  async preview(token:string){const action=await this.findByToken(token);action.validationTokenHash=undefined;return action}
  async validate(token:string,decision:'accept'|'decline'){const action=await this.findByToken(token);if(decision==='decline'){await this.repository.delete(action.id);return{status:'declined',published:false}}action.status='published';action.consentedAt=new Date();action.validationTokenHash=null;const saved=await this.repository.save(action);return{status:saved.status,published:true,id:saved.id}}
}
