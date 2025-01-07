import { z } from 'zod'

export const MemoSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(10000),
  images: z.array(z.string().url()).optional(),
})

export type CreateMemoInput = z.infer<typeof MemoSchema>
