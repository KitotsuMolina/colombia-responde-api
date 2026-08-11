import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { CreateIncidentDto } from './create-incident.dto'
import { IncidentsService } from './incidents.service'

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly service: IncidentsService) {}
  @Get() findAll(@Query('department') department?: string) { return this.service.findAll(department) }
  @Get(':id') findOne(@Param('id') id:string){return this.service.findOne(id)}
  @Post() create(@Body() dto: CreateIncidentDto) { return this.service.create(dto) }
}
