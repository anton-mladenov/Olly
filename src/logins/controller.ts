import {
  BadRequestError,
} from "routing-controllers";
import Company from "../companies/entity";

export default class LoginController {
  async authenticate(
    params: any,
    body: any
  ) {

    const company = await Company.findOne({ where: { name: body.name } });
    if (!company)
      throw new BadRequestError("Company not found");

    if (!(await company.checkApiKey(params.authorization))) throw new BadRequestError("TEST");

    return "Signed in"
  }
}
