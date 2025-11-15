import { createResolvers } from "../../../helpers/createResolver";
import { TenantService } from "../tenant.service";
const Tenant = new TenantService();
export const tenantResolvers = createResolvers({
	Query: {
		tenants: async (_parent, _args, _context) => {
			const tenants = await Tenant.getTenants(_args); // لازم تبقى عامل الميثود دي
			console.log({ tenants });
			return tenants;
		},
	},

	Mutation: {
		CuTenant: async (_, args) => {
			console.log({ args });
			const result = await Tenant.CuTenant(args?.data);
			return result;
		},
	},
});
