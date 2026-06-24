import * as z from "zod"

export const subSchema = z.object({
  title: z.string({ required_error: "الاسم مطلوب" }).min(2, "الاسم قصير جداً"),
  
  price: z.coerce.number({ invalid_type_error: "السعر يجب أن يكون رقماً" }).positive("السعر يجب أن يكون موجباً"),
  
  next: z.coerce.date({ invalid_type_error: "التاريخ غير صحيح" }).min(new Date(), "التاريخ يجب أن يكون في المستقبل")
});