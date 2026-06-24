import * as z from "zod"

export const TaskSchema=z.object({
    title:z.string().min(3,"Title is Too short").max(30,"Title is Too Long"),
    desc:z.string()
})