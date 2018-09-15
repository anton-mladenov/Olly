import {
	Post,
	Body,
	HttpCode,
	JsonController,
	NotFoundError,
	BadRequestError,
	HeaderParam,
	Ctx,
	UnauthorizedError
} from "routing-controllers";
import MatchController from "../matches/controller";
import Company from "../companies/entity";
import User from "../users/entity"
import WeeklyUpdateController from '../weeklyUpdates/controller'
import { threeIntroQuestions, introButton, ollyCopy, ollyConfig, weeklyUpdateQuestions, getFollowUpHappenedQuestion, getFollowUpFeedbackQuestion } from './bot-lib';
import * as request from "superagent"
import Match from "../matches/entity";
import ActivityController from "../activities/controller";

import { validateSlackMessage } from './validation'

const token = process.env.BOT_ID
const MatchClass = new MatchController()
const WeeklyUpdateClass = new WeeklyUpdateController()
const ActivityClass = new ActivityController()

@JsonController()
export default class SlackbotController {

	getTeam = (teamId) => {
		return Company.findOne({ "teamId": teamId })
	}

	postMessage = (
		messageText: string,
		channel: string = "",
		attachments: object = {},
		responseUrl: string = "https://slack.com/api/chat.postMessage"
	): Promise<string | undefined> => {
		return request
			.post(responseUrl)
			.set({
				'Content-Type': 'application/json; charset=utf8',
				'Authorization': `Bearer ${token}`
			})
			.send({
				"channel": channel,
				"text": `${messageText}`,
				"attachments": attachments,
				"as_user": true
			})
			.then(_ => "request has been sent")
			.catch(err => {
				if (err.status === 500) {
					console.log("___500 Error from postMessage func: ", err.response.body)
					return "Error from postMessage func"
				}
				else {
					console.error("___only err: ", err, " and error status: ", err.status, " and error response body: ", err.response.body)
				}
			})
	}

	@Post('/slack/message')
	async parseResponse(
		@HttpCode(200)
		@Body() body: any,
		@HeaderParam('X-Slack-Signature') requestSignature: string,
		@HeaderParam('X-Slack-Request-Timestamp') requestTimeStamp: string,
		@Ctx() context: any
	) {
		if (body) {
			console.log("THIS IS THE BODY: ", body)
		}
		if (!body) {
			console.log("There is no body! So lonely!")
			throw new Error("Error in the body! Body is missing.")
		}
		//Slack needs this to validate the request URL. 
		if (body.challenge) return await body.challenge

		if (!requestSignature || !requestTimeStamp) throw new UnauthorizedError("Timestamp or Request signature is missing.")
		const validated = await validateSlackMessage(context.request.rawBody, requestSignature, requestTimeStamp)
		if (!validated) throw new UnauthorizedError("You are not authorized.")

		if (!body.event || body.event.bot_id) {
			console.log("IT's the bot speaking, ignore!")
			return "Error"
		}

		if (body.event.type === "team_join") {
			return await this.postMessage(ollyCopy.join.newUser, body.event.user.id, [{ "text": "" }])
		}

		const message = body.event.text.toLowerCase()

		if (message.includes('goals')) {
			const updateQuestions = weeklyUpdateQuestions()
			updateQuestions
				.then(questions => {
					return this.postMessage(ollyCopy.match.onStart, body.event.channel, questions)
				})
				.catch(err => console.log("ERROR IN GETTING UPDATES", err))
		} else if (message.includes('intro')) {
			return this.postMessage(ollyCopy.introduction.onStart, body.event.channel, await introButton)
		} else if (message.includes('set activities')) {
			this.addedActivities()
				.then(_ => {
					return this.postMessage("Activities are set, woohoo!", body.event.channel, [], body.response_url)
				})
				.catch(err => console.error(err))
		} else if (message.includes('follow up')) {
			return this.postMessage(`<@${body.event.user}>${ollyCopy.followUp.onStart}`, body.event.channel, await getFollowUpHappenedQuestion(), body.response_url)
		}
		return ""
	}

	@Post('/slack/response')
	async getInfo(
		@HttpCode(200)
		@Body() body: any,
		@Ctx() context: any,
		@HeaderParam('X-Slack-Request-Timestamp') requestTimeStamp: string,
		@HeaderParam('X-Slack-Signature') requestSignature: string,
	) {
		const validated = await validateSlackMessage(context.request.rawBody, requestSignature, requestTimeStamp)
		if (!validated) throw new UnauthorizedError
		if (!body || !body.payload) throw new BadRequestError("Incorrect body")
		const parsedData = this.tryParseJson(body.payload)
		if (!parsedData) throw new BadRequestError("Incorrect body")
		const userId: string = parsedData.user && parsedData.user.id

		switch (parsedData.callback_id) {
			case 'weekly_update':
				return this.handleWeeklyUpdate(parsedData, userId)
			case 'intro_me':
				this.sendIntroQuestions(parsedData)
				break
			case 'follow_up_happened':
				parsedData['actions'][0].value === "yes" ?
					this.postMessage(ollyCopy.followUp.onYes, "", await getFollowUpFeedbackQuestion(), parsedData.response_url) :
					this.postMessage(ollyCopy.followUp.onNo, "", {}, parsedData.response_url)
				return ""
			case 'follow_up_feedback':
				this.postMessage(ollyCopy.followUp.onThanks, "", {}, parsedData.response_url)
				return ""
			default:
				break
		}
		return ""
	}

	//helper functions
	async saveUser(dept, funFact, interest, userId) {
		const existingUsers = await User.find({ slackId: userId })
		let entity
		if (await existingUsers.length > 0) {
			entity = await existingUsers[0]
		} else {
			entity = new User()
		}
		entity.slackId = userId
		entity.t
		entity.department = await dept
		entity.funFact = await funFact
		entity.interests = await interest
		await entity.save()
	}

	addedActivities = async () => {
		return await ollyConfig.activities.forEach(activ => {
			return ActivityClass.addActivity(activ)
		})
	}

	async getMatches(
		user: string
	) {
		const update = await WeeklyUpdateClass.getWeeklyGoals(user)
		if (!update || !update.id) throw new NotFoundError("Weekly update could not be found")
		const { department, activityId, category } = await update
		return await MatchClass.createMatch({ department, activityId, category, id: update.id })
	}

	trimMatchedUsers = (users, currentUserSlackId: string): string => {
		if (!users || users.length < 1) return ollyCopy.match.onNoMatch
		const newUsers = users.filter(user => user.slackId !== currentUserSlackId)
		if (users.length > newUsers.length) {
			return this.trimMatchedUsers(newUsers, currentUserSlackId)
		}

		const message = users.length < 2 ? ollyCopy.match.onOneMatch : ollyCopy.match.onManyMatches
		const usersString = users.length < 2 ? `<@${users[0].slackId}>` : users.map(user => `<@${user.slackId}>`).join(", ")
		console.log("USERS", usersString)
		return `${message} ${usersString}`
	}


	tryParseJson = (payload: string) => {
		try {
			return JSON.parse(payload)
		} catch (err) {
			if (err.status === 500) {
				console.log("___500 Error from postMessage func: ", err.response.body)
				return "Error from postMessage func"
			}
			else {
				console.error("___only err: ", err, " and error status: ", err.status, " and error response body: ", err.response.body)
			}
		}
		return false
	}

	handleWeeklyUpdate = async (parsedData, userId) => {
		const parsedMessage = parsedData['actions'][0]
		try {
			if (parsedMessage['selected_options']) {
				await WeeklyUpdateClass.newWeeklyGoals({
					user: userId,
					[parsedMessage.name]: [parsedMessage['selected_options'][0].value]
				})
				return ""
			}
		} catch (err) {
			this.postMessage("I can't handle your submit, can you try again?", parsedData.channel, {}, parsedData.response_url)
			if (err.status === 500) {
				console.log("___500 Error from postMessage func: ", err.response.body)
				return "Error from postMessage func"
			}
			else {
				console.error("___only err: ", err, " and error status: ", err.status, " and error response body: ", err.response.body)
			}
		}

		if (parsedMessage.value === "submit") {
			let matches: Match | null = await this.getMatches(userId)
			if (!matches) return "no matches"
			return this.trimMatchedUsers(matches.users, userId)
		}
	}

	sendIntroQuestions = async (parsedData) => {
		if (parsedData.type === "interactive_message") {
			let threeQ = await threeIntroQuestions(parsedData.trigger_id, parsedData.callback_id)

			await request
				.post("https://slack.com/api/dialog.open")
				.set({
					'Content-Type': 'application/json; charset=utf8',
					'Authorization': `Bearer ${token}`
				})
				.send(await threeQ)
				.then(res => console.log("threeQ answer: ", res.status, " ", res.body))
				.catch(err => {
					this.postMessage("I can't send you the 3 questions, can you try again?", parsedData.channel, {}, parsedData.response_url)
					if (err.status === 500) {
						console.log("___500 Error from postMessage func: ", err.response.body)
						return "Error from postMessage func"
					}
					else {
						console.error("___only err: ", err, " and error status: ", err.status, " and error response body: ", err.response.body)
					}
				})
		}

		if (parsedData.type === "dialog_submission") {
			const dept = parsedData.submission.choose_dept,
				funFact = parsedData.submission.fun_fact,
				interests = parsedData.submission.your_interests,
				userId = parsedData.user.id

			this.saveUser(dept, funFact, interests, userId)
				.then(_ => this.postMessage(ollyCopy.introduction.onThanks, parsedData.channel, {}, parsedData.response_url))
				.catch(err => {
					this.postMessage(ollyCopy.introduction.onFailed, parsedData.channel, {}, parsedData.response_url)
					if (err.status === 500) {
						console.log("___500 Error from postMessage func: ", err.response.body)
						return "Error from postMessage func"
					}
					else {
						console.error("___only err: ", err, " and error status: ", err.status, " and error response body: ", err.response.body)
					}
				})
		}
	}
}