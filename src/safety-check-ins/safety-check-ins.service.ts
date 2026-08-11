import { createHash, randomBytes } from 'node:crypto'
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, Repository } from 'typeorm'
import { CreateSafetyCheckInDto } from './safety-check-in.dto'
import { SafetyCheckIn } from './safety-check-in.entity'

const hash = (value:string) => createHash('sha256').update(value).digest('hex')
@Injectable()
export class SafetyCheckInsService {
  constructor(@InjectRepository(SafetyCheckIn) private readonly repository:Repository<SafetyCheckIn>) {}
  async search(query?:string) {
    const builder=this.repository.createQueryBuilder('checkin').where("checkin.status <> 'removed'").andWhere('checkin.expires_at > now()').orderBy('checkin.created_at','DESC').take(100)
    if(query) builder.andWhere(new Brackets(qb=>qb.where('checkin.full_name ILIKE :query',{query:`%${query}%`}).orWhere('checkin.public_code = :code',{code:query.toUpperCase()})))
    return builder.getMany()
  }
  async create(dto:CreateSafetyCheckInDto) {
    const deleteToken=randomBytes(32).toString('hex'), publicCode=`BIEN-${randomBytes(4).toString('hex').toUpperCase()}`
    const location={ ...dto.location, departmentCode:dto.location.departmentCode??'', municipalityCode:dto.location.municipalityCode??'' }
    const entity=this.repository.create({ fullName:dto.fullName, location, message:dto.message, publicCode, deleteTokenHash:hash(deleteToken), status:'self_reported', expiresAt:new Date(Date.now()+30*86400000), coordinates:dto.longitude!==undefined&&dto.latitude!==undefined?{type:'Point',coordinates:[dto.longitude,dto.latitude]}:undefined })
    const saved=await this.repository.save(entity)
    return { id:saved.id, fullName:saved.fullName, location:saved.location, message:saved.message, publicCode:saved.publicCode,
      status:saved.status, expiresAt:saved.expiresAt, createdAt:saved.createdAt, updatedAt:saved.updatedAt, deleteToken }
  }
  async remove(id:string,deleteToken:string) {
    const entity=await this.repository.createQueryBuilder('checkin').addSelect('checkin.deleteTokenHash').where('checkin.id = :id',{id}).getOne()
    if(!entity) throw new NotFoundException('Confirmación no encontrada')
    if(hash(deleteToken)!==entity.deleteTokenHash) throw new UnauthorizedException('Token de eliminación inválido')
    entity.status='removed'; await this.repository.save(entity); return { removed:true }
  }
}
