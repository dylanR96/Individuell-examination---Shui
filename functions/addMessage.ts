import {db} from "../dynamoDb"
import { APIGatewayProxyResult } from 'aws-lambda';
import { nanoid } from "nanoid";
import { formatInTimeZone  } from 'date-fns-tz'
import { QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { AddMessageSchema } from "../middleware/AddMessageSchema";
import {z} from "zod";


interface Message {
  M: {
    Message: {S: string};
    CreatedAt: {S: string}
  }
}

type NewMessages = Record<string, Message>

function getCurrentTime(): string {
  const currentDate: Date = new Date();
  const currentDateGMTplus2 = formatInTimeZone(currentDate, 'Europe/Stockholm', "dd-MM-yyyy HH:mm")

  return currentDateGMTplus2;
}

export const handler = async (event: APIGatewayProxyResult): Promise<APIGatewayProxyResult> => {
 
  const createdAt: string = getCurrentTime();

  
  const newMessages: NewMessages = {};


  try {
    const {username, text} = AddMessageSchema.parse(JSON.parse(event.body))
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

    const existingMessages = result.Items?.[0]?.text?.M ?? {};

    for (const [messageKey] of Object.entries(text)) {

      const uniqueId: string = nanoid(5);
      newMessages[uniqueId] = {
        M: {
          Message: { S: text[messageKey] },
          CreatedAt: { S: createdAt },
        }
      };
    }

    const updatedMessages = {
      ...existingMessages,
      ...newMessages
    };

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
        ":textValue": { M: updatedMessages },
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
