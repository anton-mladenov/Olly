import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany
} from "typeorm";
import {
  IsString,
  IsArray,
  IsOptional
} from "class-validator";
import WeeklyUpdate from "../weeklyUpdates/entity";
import Match from "../matches/entity";
import FollowUp from "../followups/entity";

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn() id?: number;

  @IsOptional()
  @IsString()
  @Column("text", { nullable: true })
  department?: string;

  @IsOptional()
  @IsString()
  @Column("text", { nullable: true })
  role?: string;

  @IsOptional()
  // funFact should be ONLY ONE fun fact! (for now)
  @IsString()
  @Column("text", { nullable: true })
  funFact?: string;

  @IsString()
  @Column("text", { nullable: true })
  slackId?: string;

  @IsOptional()
  @IsArray()
  @Column("text", { nullable: true })
  interests?: string[];

  @IsOptional()
  @IsArray()
  @Column("text", { nullable: true })
  skills?: string[];

  @OneToMany(_ => WeeklyUpdate, WeeklyUpdate => WeeklyUpdate.userId)
  weeklyUpdate: number[];

  @OneToMany(_ => FollowUp, followUp => followUp.user)
  followUps: number[];

  @ManyToMany(_ => Match, match => match.users)
  matches: number[];
}
