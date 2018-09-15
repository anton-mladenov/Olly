import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import * as bcrypt from "bcrypt";
import * as randomString from 'randomstring'
import User from "../users/entity";

@Entity()
export default class Company extends BaseEntity {
  @PrimaryGeneratedColumn() 
  id?: number;

  @Column("text", {unique: true}) 
  name: string;

  @Column("text") 
  apiKey: string;

  @Column("text", {nullable: true}) 
  teamId: string;

  @Column("text", {nullable: true}) 
  teamAccessToken: string;

  @Column("text", {nullable: true}) 
  botUserId: string;

  @Column("text", {nullable: true}) 
  botAccessToken: string;

  @OneToMany(_ => User, user => user.id)
  users: string[];


  async setApiKey() {
    const apiKey = randomString.generate(32)
    const hash = await bcrypt.hash(apiKey, 10);
    this.apiKey = await hash;
    return apiKey
  }

  checkApiKey(rawApiKey: string): Promise<boolean> {
    return bcrypt.compare(rawApiKey, this.apiKey);
  }
}
