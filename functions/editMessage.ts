import {db} from "../dynamoDb"
import { ScanCommand } from "@aws-sdk/lib-dynamodb"
import { APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const result = await db.send(new ScanCommand({
      TableName: "MessageBoard",
    }))

    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: result.Items})
    }
    return response
  } catch (error) {
    console.error(error)
    return{
      statusCode: 500,
      body: JSON.stringify({ message: "Error while scanning the table", error: (error as Error).message})
    }
  }
}
