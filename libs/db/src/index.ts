import { PrismaClient } from "../../generated/prisma";
import { createClient } from "@supabase/supabase-js";

export type JwtClaims = {
  organization_id?: string;
  role?: string;
  sub?: string;
};

let _adminPrisma: PrismaClient | null = null;

function getAdminPrisma(): PrismaClient {
  if (!_adminPrisma) {
    _adminPrisma = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
    });
  }
  return _adminPrisma;
}

function setJwtClaims(claims: JwtClaims): string {
  const payload = JSON.stringify({
    role: "authenticated",
    ...claims,
  });
  return `set_config('request.jwt.claims', '${payload.replace(/'/g, "''")}', true)`;
}

export function getPrisma(claims: JwtClaims) {
  const admin = getAdminPrisma();

  return admin.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, args, query }) {
          const sql = setJwtClaims(claims);
          return admin.$transaction(async (tx) => {
            await tx.$executeRawUnsafe(sql);
            return query(args);
          });
        },
      },
    },
  });
}

export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export { getAdminPrisma };
export type { PrismaClient } from "../../generated/prisma";
