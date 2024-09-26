import {db} from "../dynamoDb"
import { APIGatewayProxyResult } from 'aws-lambda';
import { formatInTimeZone  } from 'date-fns-tz'
import { QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import {z} from "zod";
import { EditMessageSchema } from "../middleware/EditMessageSchema";

function getCurrentTime(): string {
  const currentDate: Date = new Date();
  const currentDateGMTplus2 = formatInTimeZone(currentDate, 'Europe/Stockholm', "dd-MM-yyyy HH:mm")

  return currentDateGMTplus2;
}

export const handler = async (event: APIGatewayProxyResult): Promise<APIGatewayProxyResult> => {
 
  const modifiedAt: string = getCurrentTime();

  try {
    const {username, messages } = EditMessageSchema.parse(JSON.parse(event.body))
    const result = await db.send(new QueryCommand({
      TableName: "MessageBoard",
      KeyConditionExpression: "#username = :usernameValue",
      ExpressionAttributeNames: {
        "#username": "username",
      },
      ExpressionAttributeValues: {
        ":usernameValue": { S: username },
      },
    }));

    const items = result.Items ?? [];
    
    if(!items || items.length === 0) {
      const response = {
        statusCode: 404,
        body: JSON.stringify({ message: "User does not exist or has no current messages." })
      }
      return response;
    }

    const existingMessages = result.Items?.[0]?.text?.M ?? {};

    for (const [uniqueId, newTexts] of Object.entries(messages)) {

      if (!existingMessages[uniqueId]) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: `Message ID ${uniqueId} does not exist.`
          })
        };
      }

      const messageObject = existingMessages[uniqueId]?.M;

      if (!messageObject) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: `Internal error: Message object for ID ${uniqueId} is malformed.`
          })
        };
      }

      existingMessages[uniqueId].M.Message = { S: newTexts[0]}
      existingMessages[uniqueId].M.modifiedAt = {S: modifiedAt}
      delete existingMessages[uniqueId].M.CreatedAt
    }


    const updateParams = {
      TableName: "MessageBoard",
      Key: {
        username: { S: username },
      },
      UpdateExpression: "SET #text = :textValue",
      ExpressionAttributeNames: {
        "#text": "text",
      },
      ExpressionAttributeValues: {
        ":textValue": { M: existingMessages },
      },
    };

    await db.send(new UpdateItemCommand(updateParams));

    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: "Success"})
    }
    return response
  } catch (error) {
    if(error instanceof z.ZodError) {
      const firstErrorMessage = error.errors[0].message;
      return{
        statusCode: 400,
        body: JSON.stringify({ 
          message: firstErrorMessage, 
        })
      }
    }
    return{
      statusCode: 500,
      body: JSON.stringify({ message: "Error while scanning the table", error: (error as Error).message})
    }
  }
}
