import { z } from "zod";

export const AddMessageSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(15, { message: "Username cannot exceed 15 characters." }),
  text: z.array(z.string().min(1, { message: "Each message cannot be empty." })),
});