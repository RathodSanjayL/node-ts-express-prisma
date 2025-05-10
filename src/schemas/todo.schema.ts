import { z } from "zod";

export const PriorityEnum = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);

export const todoBaseSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().max(500).optional().nullable(),
    completed: z.boolean().default(false),
    dueDate: z.string().datetime().optional().nullable(),
    priority: PriorityEnum.default('NORMAL')
})

export const createTodoSchema = todoBaseSchema;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;

export const updateTodoSchema = todoBaseSchema.partial();
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

export const todoQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).default('1').transform(Number),
    limit: z.string().regex(/^\d+$/).default('10').transform(Number),
    completed: z.string().optional().transform(val => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
    }),
    priority: PriorityEnum.optional(),
    search: z.string().optional(),
});
export type TodoQueryInput = z.infer<typeof todoQuerySchema>;