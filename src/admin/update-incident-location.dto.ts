import { IsLatitude, IsLongitude, IsString, Length } from 'class-validator'

export class UpdateIncidentLocationDto {
  @IsString() @Length(2,160) locality:string
  @IsLongitude() longitude:number
  @IsLatitude() latitude:number
}
