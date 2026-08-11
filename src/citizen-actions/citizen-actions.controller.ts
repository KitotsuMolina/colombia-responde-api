import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ValidateCitizenActionDto } from './citizen-action.dto'
import { CitizenActionsService } from './citizen-actions.service'

@Controller('citizen-actions')
export class CitizenActionsController {
  constructor(private readonly service:CitizenActionsService){}
  @Get() findAll(){return this.service.findAll()}
  @Get('validate/:token') preview(@Param('token') token:string){return this.service.preview(token)}
  @Post('validate/:token') validate(@Param('token') token:string,@Body() dto:ValidateCitizenActionDto){return this.service.validate(token,dto.decision)}
  @Get(':id') findOne(@Param('id') id:string){return this.service.findOne(id)}
}
