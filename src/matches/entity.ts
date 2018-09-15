import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  JoinTable
} from "typeorm";
import User from "../users/entity";
import WeeklyUpdate from "../weeklyUpdates/entity";
import FollowUp from "../followups/entity";

@Entity()
export default class Match extends BaseEntity {
  @PrimaryGeneratedColumn() id?: number;

  // @Column("text", { nullable: true })
  // categories: string[];

  // @Column("text", { nullable: true })
  // activities: string[];

  // @Column("text", { nullable: true })
  // status: string;

  @ManyToMany(_ => User, user => user.matches)
  @JoinTable()
  users: User[];

  @OneToMany(_ => WeeklyUpdate, weeklyUpdate => weeklyUpdate.matchId)
  weeklyUpdate?: number[];

  @OneToMany(_ => FollowUp, followUp => followUp.match)
  followUps: number[];
}
