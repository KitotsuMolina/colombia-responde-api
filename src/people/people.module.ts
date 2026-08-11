import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MissingPerson } from './person.entity'
import { PeopleController } from './people.controller'
@Module({ imports:[TypeOrmModule.forFeature([MissingPerson])], controllers:[PeopleController] })
export class PeopleModule {}
