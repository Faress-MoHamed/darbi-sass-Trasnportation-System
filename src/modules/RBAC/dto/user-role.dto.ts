import z from "zod";

export interface AssignRolesToUserDTO {
userId: string;
roleIds: string[];
}


export const AssignRolesToUserSchema = z.object({
userId: z.string().min(1, "User ID is required"),
roleIds: z.array(z.string().min(1)).min(1, "At least one role is required"),
});