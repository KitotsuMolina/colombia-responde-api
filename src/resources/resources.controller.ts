import { Controller, Get, Query } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EmergencyResource } from './resource.entity'
@Controller('resources')
export class ResourcesController {
  constructor(@InjectRepository(EmergencyResource) private readonly repository:Repository<EmergencyResource>) {}
  @Get() findAll(@Query('department') department?:string) {
    return this.repository.find({ where:{ active:true, ...(department ? { location:{ departmentCode:department } } : {}) }, order:{ updatedAt:'DESC' }, take:200 })
  }
}
