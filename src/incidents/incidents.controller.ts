import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { CreateIncidentDto } from './create-incident.dto'
import { IncidentsService } from './incidents.service'

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly service: IncidentsService) {}
  @Get() findAll(@Query('department') department?: string) { return this.service.findAll(department) }
  @Post() create(@Body() dto: CreateIncidentDto) { return this.service.create(dto) }
}
