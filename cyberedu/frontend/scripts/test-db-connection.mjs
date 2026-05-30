import pg from "pg";

const urls = {
  pooler6543:
    "postgresql://postgres.vxihebmodvatwmiasvzp:xxXX1234%21%2F%2122@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public&sslmode=require&connect_timeout=60&connection_limit=1",
  pooler5432:
    "postgresql://postgres.vxihebmodvatwmiasvzp:xxXX1234%21%2F%2122@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?schema=public&sslmode=require&connect_timeout=60",
  dbdirect:
    "postgresql://postgres.vxihebmodvatwmiasvzp:xxXX1234%21%2F%2122@db.vxihebmodvatwmiasvzp.supabase.co:5432/postgres?schema=public&sslmode=require&connect_timeout=60",
};

for (const [name, url] of Object.entries(urls)) {
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 65_000,
  });
  try {
    await client.connect();
    const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM "User"');
    console.log(`${name}: OK users=${rows[0].n}`);
  } catch (error) {
    console.log(`${name}: FAIL ${error.code ?? ""} ${error.message}`);
  } finally {
    await client.end().catch(() => {});
  }
}
