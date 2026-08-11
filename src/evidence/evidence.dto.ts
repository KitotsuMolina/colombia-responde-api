import { IsIn, IsInt, Max, Min } from 'class-validator'
export class CreateEvidenceUploadDto {@IsIn(['image/jpeg','image/png','image/webp']) mimeType:string;@IsInt() @Min(1) @Max(3145728) sizeBytes:number}
