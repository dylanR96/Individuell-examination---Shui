import { DynamoDB} from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument} from "@aws-sdk/lib-dynamodb"

const client = new DynamoDB({
  region: "eu-north-1",
})

const db = DynamoDBDocument.from(client)

export {db}