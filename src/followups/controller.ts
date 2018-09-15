import {
  BadRequestError
} from "routing-controllers";
import FollowUp from "./entity";
import User from "../users/entity";

export default class FollowUpController {

  async createFollowUp(
    matchId: number,
    changes: Partial<FollowUp>,
    user: User
  ) {
    const followUp = await FollowUp.find({ match: matchId, user: user.id })[0];

    let newFollowUp: FollowUp;

    if (!followUp && changes.rating) {
      newFollowUp = new FollowUp();
    } else if(changes.rating) {
      newFollowUp = followUp;
    } else {
      throw new BadRequestError("You haven't included a rating!")
    }
    return FollowUp.merge(newFollowUp, changes).save();
  }

  async getFollowUps() {
    return {
      followUps: await FollowUp.find()
    };
  }

  async getFollowUpPerMatch(
    matchId: number
  ) {
    return {
      followUps: await FollowUp.find({ match: matchId })
    };
  }
}
