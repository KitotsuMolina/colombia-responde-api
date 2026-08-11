import { Body, Controller, Param, Post } from '@nestjs/common'
import { CreateEvidenceUploadDto } from './evidence.dto';import { EvidenceService } from './evidence.service'
@Controller('incidents/:incidentId/evidence') export class EvidenceController {constructor(private readonly service:EvidenceService){}@Post('upload-url') create(@Param('incidentId') incidentId:string,@Body() dto:CreateEvidenceUploadDto){return this.service.createUpload(incidentId,dto)}@Post(':id/complete') complete(@Param('incidentId') incidentId:string,@Param('id') id:string){return this.service.complete(incidentId,id)}}
