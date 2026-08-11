import { IsIn, IsOptional, IsString, Length, Matches } from 'class-validator'

export class CreateCitizenActionDto {
  @IsString() @Length(3,160) title:string
  @IsString() @Length(3,180) contactName:string
  @IsString() @Length(7,40) @Matches(/^[+\d][\d\s().-]+$/) contactPhone:string
  @IsString() @Length(10,3000) actionDescription:string
  @IsOptional() @IsString() @Length(3,2000) donationMethod?:string
  @IsString() @Length(2,100) departmentName:string
  @IsString() @Length(2,120) municipalityName:string
  @IsOptional() @IsString() @Length(2,180) locality?:string
}

export class ValidateCitizenActionDto {
  @IsIn(['accept','decline']) decision:'accept'|'decline'
}
