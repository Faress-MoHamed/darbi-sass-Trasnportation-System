import gql from "graphql-tag";

// tenant.typeDefs.ts
export const tenantTypeDefs = gql`
  enum PlanType {
    basic
    pro
    enterprise
  }

  enum TenantStatus {
    active
    suspended
    inactive
  }
enum UserRole {
    admin 
    supervisor 
    driver 
    passenger
  }
enum UserStatus {
    active 
    banned 
    pending
  }

  type Tenant {
    id: ID!
    name: String!
    planType: PlanType!
    status: TenantStatus!
    createdAt: String!
  }

  type PaginationMeta {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
  }

  type TenantPagination {
    data: [Tenant!]!
    meta: PaginationMeta!
  }

  input TenantUserInput {
    email: String
    password: String!
    status:UserStatus!
    name:String!
    phone:String!
    
  }

  input TenantInput {
    id: ID
    name: String!
    planType: PlanType!
    status: TenantStatus
    user: TenantUserInput!
  }

  type Query {
    tenants(id: ID, page: Int, limit: Int, search: String): TenantPagination!
  }

  type Mutation {
    CuTenant(data: TenantInput!): Tenant
  }
`;
