import User from "../users/entity";
import WeeklyUpdate from "../weeklyUpdates/entity";
import * as moment from 'moment';
moment().format()

const week = moment().isoWeek()

export async function getCategory(inputCategory) {
	let resultCat = async () => {
		return await WeeklyUpdate.find({
			select: ["category", "id"],
			relations: ["userId"],
			where: {
				category: inputCategory,
				weekNumber: week
			}
		});
	};
	return await resultCat();
}

export async function getDepartment(inputDepartment) {
	let resultDepartment = async () => {
		return await User.find({
			relations: ["weeklyUpdate"],
			where: {
				department: inputDepartment,
				weekNumber: week
			}
		});
	};
	return await resultDepartment();
}

export async function getActivity(inputActivities) {
	let resultActivity = async () => {
		return await WeeklyUpdate.find({
			select: ["activityId", "id"],
			relations: ["userId"],
			where: {
				activityId: inputActivities,
				weekNumber: week
			}
		})
	}
	return await resultActivity()
};

export async function algolly(inputDepartment, inputActivities, inputCategory) {
	const departmentMatch = await getDepartment(inputDepartment);
	const activityMatch = await getActivity(inputActivities);
	const categoryMatch = await getCategory(inputCategory);
	if (!departmentMatch || departmentMatch.length === 0) {
		if (!activityMatch || activityMatch.length === 0) {
			if (!categoryMatch || categoryMatch.length === 0) {
				return null;
			} else
				return categoryMatch.map(
					catMatch => catMatch.userId && catMatch.userId
				);
		} else
			return activityMatch.map(actMatch => actMatch.userId && actMatch.userId);
	} else return departmentMatch;
}
