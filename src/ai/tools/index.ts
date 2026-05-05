import { createUserTool } from "./create-user";
import { createCourseTool } from "./create-course";
import { listUsersTool } from "./list-users";
import { updateUserTool } from "./update-user";
import { deleteUserTool } from "./delete-user";

/**
 * Build the toolkit for the agent.
 * Tools that need request-time context (e.g. who the current admin is)
 * are constructed here so they have access to it.
 */
export function buildAgentTools(ctx: { adminId: string }) {
  return {
    createUser: createUserTool,
    updateUser: updateUserTool(ctx.adminId),
    deleteUser: deleteUserTool(ctx.adminId),
    createCourse: createCourseTool(ctx.adminId),
    listUsers: listUsersTool,
  };
}
