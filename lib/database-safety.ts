const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

type DatabaseIdentity = { hostname: string; database: string };

function identity(raw: string | undefined): DatabaseIdentity {
  if (!raw) throw new Error("DATABASE_URL is required for this command.");
  let parsed: URL;
  try { parsed = new URL(raw); } catch { throw new Error("DATABASE_URL is not a valid URL."); }
  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") throw new Error("Only PostgreSQL URLs are supported.");
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (!database) throw new Error("A database name is required.");
  return { hostname: parsed.hostname.replace(/^\[|\]$/g, ""), database };
}

function assertLocal(identityValue: DatabaseIdentity, allowedDatabases: readonly string[]) {
  if (!LOCAL_HOSTS.has(identityValue.hostname) || !allowedDatabases.includes(identityValue.database)) throw new Error("Refusing to use a non-local or unexpected database target.");
}

export function assertDevelopmentDatabaseTarget(source: Record<string, string | undefined> = process.env) {
  if (source.NODE_ENV === "production") throw new Error("Development database commands are disabled in production.");
  const database = identity(source.DATABASE_URL);
  const direct = identity(source.DIRECT_URL);
  assertLocal(database, ["thanglong_dev"]);
  assertLocal(direct, ["thanglong_dev"]);
  if (database.hostname !== direct.hostname || database.database !== direct.database) throw new Error("DATABASE_URL and DIRECT_URL must target the same local development database.");
}

export function assertIntegrationDatabaseTarget(source: Record<string, string | undefined> = process.env) {
  if (source.RUN_INTEGRATION !== "true") throw new Error("RUN_INTEGRATION=true is required for integration tests.");
  const database = identity(source.DATABASE_URL);
  const direct = identity(source.DIRECT_URL);
  assertLocal(database, ["thanglong_dev", "thanglong_test"]);
  assertLocal(direct, ["thanglong_dev", "thanglong_test"]);
  if (database.hostname !== direct.hostname || database.database !== direct.database) throw new Error("DATABASE_URL and DIRECT_URL must target the same integration database.");
}

export function databaseName(raw: string | undefined) {
  return identity(raw).database;
}
