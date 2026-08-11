import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { CreatePersonDto } from './create-person.dto'
import { MissingPerson } from './person.entity'

@Controller('missing-persons')
export class PeopleController {
  constructor(@InjectRepository(MissingPerson) private readonly repository: Repository<MissingPerson>) {}
  @Get() search(@Query('q') query?: string) {
    return this.repository.find({ where: query ? { fullName: ILike(`%${query}%`) } : {}, order:{ createdAt:'DESC' }, take:100, select: { contactToken:false } })
  }
  @Post() create(@Body() dto: CreatePersonDto) {
    const location={ ...dto.location, departmentCode:dto.location.departmentCode??'', municipalityCode:dto.location.municipalityCode??'' }
    return this.repository.save(this.repository.create({ ...dto, location, lastSeenAt:new Date(dto.lastSeenAt), status:'missing' }))
  }
}
