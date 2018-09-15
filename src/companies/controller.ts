// use this controller with caution - it works partially, 
// you have to double check what works and what not before using in production

import {
  JsonController,
  Get,
  Authorized,
  Post,
  HttpCode,
  Body,
  QueryParams
} from "routing-controllers";
import Company from "./entity";
import * as request from 'superagent'

@JsonController()
export default class CompanyController {
  @Authorized()
  @Get("/companies")
  getCompany() {
    return Company.find();
  }

  @Post("/companies")
  @HttpCode(201)
  async createCompany(
    @Body() body: any
  ) {
    const newCompany = new Company()
    const apiKey = await newCompany.setApiKey()
    newCompany.name = body.name
    await newCompany.save()
    return apiKey
  }

  @Get("/auth")
  async createAuth(
    @QueryParams() params : any
  ) {
    const credentials = await request
      .get(`https://slack.com/api/oauth.access?code=${params.code}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`)
      .then(res => res.body)
      .catch(err => console.error(err))

    const newCompany = new Company()
    await newCompany.setApiKey()
    newCompany.name = credentials.team_name
    newCompany.teamId = credentials.team_id
    newCompany.teamAccessToken = credentials.access_token
    newCompany.botAccessToken = credentials.bot.bot_access_token
    newCompany.botUserId = credentials.bot.bot_user_id
    return newCompany.save()
  }
}
