
import Activity from "../activities/entity"

export const ollyCopy = {
	join: {
		newUser: "Hey, I'm Olly! A friendly little bot that lives inside your Slack who can intro you to people here. Type 'intro' to start, then 'goals' to see what I can do."
	},
	introduction: {
		mainHeader: "About You",
		funFactPlaceholder: "Not many people know this but ...",
		departmentPlaceholder: "Choose Your Department",
		interestsPlaceholder: "Just the first 3 things that come to mind (e.g. sports, books, movies)",
		onStart: "Let me know a bit about you!",
		onThanks: "Thanks! Now, type `goals` whenever you're ready to be intro'd to the right people!",
		onFailed: "Sorry, something went wrong. Can you try again?"
	},
	match: {
		onStart: "While you’re here, let me know what you’re up for this week!",
		onNoMatch: "No matches available. Try again next week",
		onOneMatch: "You matched with ",
		onManyMatches: "Your matches are "
	},
	followUp: {
		onStart: `, just wanted to check if you managed to meet up?`,
		onYes: "That’s great! How was your meeting?",
		onNo: "I'm sorry to hear that! Let's try again next week.",
		onThanks: "Thank you for your feedback!"
	}
}

export const ollyConfig = {
	activities: ["Coffee", "Lunch", "Breakfast", "Sports", "Drinks"],
	departments: ["Development", "Marketing + Growth", "Entrepreneur", "Support", "Analytics", "Legal", "Business Development", "Product", "Design", "Operations", "Events, Workshops + Sprints"],
	categories: ["socialize", "network"] // always keep these the same
}

export const weeklyUpdateQuestions = async () => {
	const activities = await Activity.find()
	const fallback = "If you could read this message, you'd be choosing something fun to do right now."
	const callbackId = "weekly_update"

	let threeButtons: any = await [
		{
			"text": "I want to ...",
			"fallback": fallback,
			"color": "#3AA3E3",
			"attachment_type": "default",
			"callback_id": callbackId,
			"actions": [
				{
					"name": "category",
					"text": "Pick a category",
					"type": "select",
					"options": ollyConfig.categories.map(cat => ({
						text: cat,
						value: cat
					}))
				}
			]
		},
		{
			"text": "... by doing ...",
			"fallback": fallback,
			"color": "#3AA3E3",
			"attachment_type": "default",
			"callback_id": callbackId,
			"actions": [
				{
					"name": "activity",
					"text": "Pick an activity",
					"type": "select",
					"options": await activities.map(activ => {
						return {
							text: activ.activityName,
							value: activ.id
						}
					})
				}
			]
		},
		{
			"text": " ... with ...",
			"fallback": fallback,
			"color": "#3AA3E3",
			"attachment_type": "default",
			"callback_id": callbackId,
			"actions": [
				{
					"name": "department",
					"text": "Choose department",
					"type": "select",
					"options": await ollyConfig.departments.map(dept => ({
						text: dept,
						value: dept.toLowerCase().split(" ").join("_")
					})
					)
				}
			]
		},
		{
			"fallback": fallback,
			"title": "Submit Your Answer",
			"callback_id": callbackId,
			"color": "#66BD96",
			"attachment_type": "default",
			"actions": [
				{
					"name": "submit",
					"style": "primary",
					"text": "Submit Answers",
					"type": "button",
					"value": "submit"
				}
			]
		}
	]
	return await threeButtons
}

export const introButton = [
	{
		"text": "Tell Me More",
		"fallback": "You can't click on this button at the moment",
		"callback_id": "intro_me",
		"color": "#3AA3E3",
		"attachment_type": "default",
		"actions": [
			{
				"name": "Tell Me More",
				"text": "Tell Me More",
				"type": "button",
				"value": "intro",
				"style": "primary"
			}
		]
	}
]

export const threeIntroQuestions = async (trgId, callbId) => {
	let threeQ =
	{
		"trigger_id": `${trgId}`,
		"dialog": {
			"callback_id": `${callbId}`,
			"title": ollyCopy.introduction.mainHeader,
			"submit_label": "Submit",
			"notify_on_cancel": true,
			"elements": [
				{
					"label": "Your Department",
					"type": "select",
					"placeholder": ollyCopy.introduction.departmentPlaceholder,
					"name": "choose_dept",
					"options": await ollyConfig.departments.map(dept => {
						return {
							label: dept,
							value: dept.toLowerCase().split(" ").join("_")
						}
					})
				},
				{
					"label": "Fun Fact About You",
					"name": "fun_fact",
					"type": "text",
					"placeholder": ollyCopy.introduction.funFactPlaceholder
				},
				{
					"label": "Your Interests",
					"name": "your_interests",
					"type": "text",
					"placeholder": ollyCopy.introduction.interestsPlaceholder
				}
			]
		}
	}
	return await threeQ
}

export const getFollowUpHappenedQuestion = () => {
	return [
		{
			"fallback": "Did your meeting happen?",
			"callback_id": "follow_up_happened",
			"attachment_type": "default",
			"actions": [
				{
					"name": "yes",
					"text": "Yes",
					"type": "button",
					"value": "yes",
					"style": "primary"
				},
				{
					"name": "no",
					"text": "No",
					"type": "button",
					"value": "no",
					"style": "primary"
				}
			]
		}
	]
}

export const getFollowUpFeedbackQuestion = () => {
	return [
		{
			"fallback": "Add some comments please",
			"attachment_type": "default",
			"callback_id": "follow_up_feedback",
			"actions": [
				{
					"name": "great",
					"text": "Great",
					"type": "button",
					"value": "2",
					"color": "#3AA3E3",
					"style": "primary"
				},
				{
					"name": "okay",
					"text": "It was okay",
					"type": "button",
					"value": "1",
					"style": "primary"
				},
				{
					"name": "bad",
					"text": "It could have been better",
					"type": "button",
					"value": "0",
					"style": "primary"
				}
			]
		}
	]
}