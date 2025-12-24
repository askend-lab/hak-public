import { z } from 'zod';

export type VoiceModel = 'efm_s' | 'efm_l';

export const SynthesisEntrySchema = z.object({
  id: z.string().uuid(),
  originalText: z.string().min(1),
  phoneticText: z.string(),
  audioHash: z.string(),
  voiceModel: z.enum(['efm_s', 'efm_l']),
  createdAt: z.string().datetime(),
});

export const TaskEntrySchema = z.object({
  id: z.string().uuid(),
  synthesis: SynthesisEntrySchema,
  order: z.number().int().min(0),
  addedAt: z.string().datetime(),
});

export const TaskSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  entries: z.array(TaskEntrySchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  shareToken: z.string().optional(),
});

export const CreateTaskRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const AddEntryRequestSchema = z.object({
  taskId: z.string().uuid(),
  synthesis: SynthesisEntrySchema,
});

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T): z.ZodObject<{
  success: z.ZodBoolean;
  data: z.ZodOptional<T>;
  error: z.ZodOptional<z.ZodString>;
}> =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

export type SynthesisEntry = z.infer<typeof SynthesisEntrySchema>;
export type TaskEntry = z.infer<typeof TaskEntrySchema>;
export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;
export type AddEntryRequest = z.infer<typeof AddEntryRequestSchema>;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
