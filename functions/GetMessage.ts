import { QueryCommand } from "@aws-sdk/client-dynamodb";
import {db} from "../dynamoDb"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const username = event.pathParameters ? event.pathParameters.username : null;
  if(!username) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({ message: "Username is required." })
    }
    return response;
  }
  try {
    const result = await db.send(new QueryCommand({
      TableName: "MessageBoard",
      KeyConditionExpression: "#username = :usernameValue",
      ExpressionAttributeNames: {
        "#username": "username",
      },
      ExpressionAttributeValues: {
        ":usernameValue": {S: username},
      },
    }))

    const items = result.Items ?? [];
    
    if(!items || items.length === 0) {
      const response = {
        statusCode: 404,
        body: JSON.stringify({ message: "User does not exist or has no current messages." })
      }
      return response;
  } else {
    const userMessages = items.map(item => item.text.SS)
    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: userMessages})
    }
    return response
  }
  } catch (error) {
    console.error(error)
    return{
      statusCode: 500,
      body: JSON.stringify({ message: "Error while scanning the table", error: (error as Error).message})
    }
  }
}
