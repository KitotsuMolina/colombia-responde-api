import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { CreateSafetyCheckInDto, DeleteSafetyCheckInDto } from './safety-check-in.dto'
import { SafetyCheckInsService } from './safety-check-ins.service'
@Controller('safety-check-ins')
export class SafetyCheckInsController {
  constructor(private readonly service:SafetyCheckInsService) {}
  @Get() search(@Query('q') query?:string){return this.service.search(query)}
  @Post() create(@Body() dto:CreateSafetyCheckInDto){return this.service.create(dto)}
  @Delete(':id') remove(@Param('id') id:string,@Body() dto:DeleteSafetyCheckInDto){return this.service.remove(id,dto.deleteToken)}
}
