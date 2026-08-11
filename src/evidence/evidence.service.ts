import { randomUUID } from 'node:crypto'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { GetObjectAttributesCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Repository } from 'typeorm'
import { Incident } from '../incidents/incident.entity'
import { CreateEvidenceUploadDto } from './evidence.dto'
import { IncidentEvidence } from './incident-evidence.entity'
@Injectable() export class EvidenceService {private readonly client:S3Client;private readonly bucket:string;private readonly publicBase:string
  constructor(@InjectRepository(IncidentEvidence) private readonly evidence:Repository<IncidentEvidence>,@InjectRepository(Incident) private readonly incidents:Repository<Incident>,config:ConfigService){this.bucket=config.getOrThrow('R2_BUCKET_NAME');this.publicBase=config.getOrThrow<string>('R2_PUBLIC_BASE_URL').replace(/\/$/,'');this.client=new S3Client({region:'auto',endpoint:`https://${config.getOrThrow('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,credentials:{accessKeyId:config.getOrThrow('R2_ACCESS_KEY_ID'),secretAccessKey:config.getOrThrow('R2_SECRET_ACCESS_KEY')}})}
  public(item:IncidentEvidence){return{id:item.id,url:`${this.publicBase}/${item.storageKey}`,mimeType:item.mimeType,sizeBytes:item.sizeBytes,createdAt:item.createdAt}}
  async list(incidentId:string){return(await this.evidence.find({where:{incidentId,status:'ready'},order:{createdAt:'ASC'}})).map(item=>this.public(item))}
  async createUpload(incidentId:string,dto:CreateEvidenceUploadDto){if(!await this.incidents.existsBy({id:incidentId}))throw new NotFoundException('Reporte no encontrado');if(await this.evidence.count({where:{incidentId}})>=3)throw new BadRequestException('Máximo 3 fotografías por reporte');const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[dto.mimeType],storageKey=`incidents/${incidentId}/${randomUUID()}.${extension}`;const item=await this.evidence.save(this.evidence.create({incidentId,storageKey,mimeType:dto.mimeType,sizeBytes:dto.sizeBytes,status:'pending'}));const uploadUrl=await getSignedUrl(this.client,new PutObjectCommand({Bucket:this.bucket,Key:storageKey,ContentType:dto.mimeType,ContentLength:dto.sizeBytes}),{expiresIn:600});return{id:item.id,uploadUrl,expiresAt:new Date(Date.now()+600000).toISOString()}}
  async complete(incidentId:string,id:string){const item=await this.evidence.findOneBy({id,incidentId});if(!item)throw new NotFoundException('Evidencia no encontrada');const object=await this.client.send(new GetObjectAttributesCommand({Bucket:this.bucket,Key:item.storageKey,ObjectAttributes:['ObjectSize']})).catch(()=>null);if(!object||object.ObjectSize!==item.sizeBytes){item.status='rejected';await this.evidence.save(item);throw new BadRequestException('La fotografía no pudo verificarse')}item.status='ready';await this.evidence.save(item);return this.public(item)}
}
