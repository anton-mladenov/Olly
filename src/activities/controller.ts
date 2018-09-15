import { NotFoundError } from "routing-controllers";
import Activity from "./entity";

export default class ActivityController {
  async getActivities() {
    return await {
      activities: Activity.find()
    }
  }

  async addActivity(
    name: string
  ) {
	const activ = new Activity()
	activ.activityName = name
    return activ.save()
  }

  async editActivity(
    activityId: number,
    update: Activity
  ) {
    const activity = await Activity.findOne(activityId)
    if(!activity) {
      throw new NotFoundError
    }
    return Activity.merge(activity, update).save()
  }

  async deleteActivity(
    activityId: number,
  ) {
    const activity = await Activity.findOne(activityId)
    if(!activity) {
      throw new NotFoundError
    }
    return Activity.remove(activity)
  }
  
}
