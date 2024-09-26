import { z } from "zod";

export const EditMessageSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).max(15),
  messages: z.record(z.string().min(1), z.array(z.string()))
});