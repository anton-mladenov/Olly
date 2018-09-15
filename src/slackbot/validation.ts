import * as crypto from 'crypto'
import * as moment from 'moment'

const secret = process.env.SIGNING_SECRET 
moment().format()
const currentTime = moment()
export const validateSlackMessage = (rawBody: string, signature: string, requestTimestamp: string): boolean => {
  if(currentTime.diff(moment.unix(parseInt(requestTimestamp)), 'second') > 300) return false //return false if request is older than 5 minutes
  let signatureBaseString = 'v0:' + requestTimestamp + ':' + rawBody
  return compare(hash(signatureBaseString), signature)
}

const hash = (signatureBaseString) => {
  if(!secret) return false
  return "v0=" + crypto.createHmac('sha256', secret).update(signatureBaseString).digest("hex")
}

const compare = (hash, signature) => {
  return hash === signature
}