import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne
} from "typeorm";
import Match from "../matches/entity"
import User from "../users/entity";


@Entity()
export default class FollowUp extends BaseEntity {
  
	@PrimaryGeneratedColumn() 
	id?: number;

	@Column("text", {default: "pending"})
	status: string;

	@Column("integer")
	rating: number
	
	@ManyToOne(_ => Match, match => match.id)
	match: number;

	@ManyToOne(_ => User, user => user.id) 
	user: number;
}
