import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from "typeorm";
import { MinLength, IsString } from "class-validator";
import WeeklyUpdate from "../weeklyUpdates/entity";

@Entity()
export default class Activity extends BaseEntity {
  @PrimaryGeneratedColumn() id?: number;

  @IsString()
  @MinLength(2)
  @Column("text", {unique: true})
  activityName: string;

  @OneToMany(_ => WeeklyUpdate, WeeklyUpdate => WeeklyUpdate.activityId)
  weeklyUpdate: number[];
}
