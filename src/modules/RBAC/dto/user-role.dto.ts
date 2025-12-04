import z from "zod";

export interface AssignRolesToUserDTO {
userId: string;
roleIds: number[];
}


export const AssignRolesToUserSchema = z.object({
userId: z.string().min(1, "User ID is required"),
roleIds: z.array(z.number().int()).min(1, "At least one role is required"),
});