import * as z from "zod";

export const querySchema = z.object({
  query: z.string().optional().or(z.literal("")),
  limit: z.number().optional(),
  skip: z.number().optional(),
});
