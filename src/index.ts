import "reflect-metadata";
import { useKoaServer } from "routing-controllers";
import setupDb from "./db";
import * as Koa from "koa";
import UserController from "./users/controller";
import LoginController from "./logins/controller";
import WeeklyUpdateController from "./weeklyUpdates/controller";
import SlackbotController from "./slackbot/controller";
import CompanyController from "./companies/controller";
require('dotenv').config()

const app = new Koa();
const port = process.env.PORT || 4000;
let time = `${new Date().getHours()}:${new Date().getMinutes()}`;

app.on('error', err => console.error(err))

useKoaServer(app, {
  cors: true,
  controllers: [
    UserController,
    LoginController,
    WeeklyUpdateController,
    CompanyController,
	  SlackbotController
  ]
});

setupDb()
  .then(_ => {
    app.listen(port);
    console.log(`Listening on port ${port}  @ ${time}`);
  })
  .catch(err => console.error(err));


