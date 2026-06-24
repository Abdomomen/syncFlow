import * as z from "zod"

export const RegisterSchema = z.object({
  username: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(20, "Name must be less than 20"),
  email: z.email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must be at most 30 characters"),
});

export const LoginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters").max(30, "Password must be at most 30 characters")
})

