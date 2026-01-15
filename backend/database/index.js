import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  multipleStatements: true,
};

async function runTests() {
  let connection;

  try {
    console.log("🔌 Connecting to database...");
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true,
    });

    console.log("✅ Connected successfully!\n");

    // Create database if it doesn't exist
    console.log(`📦 Creating database '${dbConfig.database}' if not exists...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`
    );
    console.log("✅ Database ready!\n");

    // Select the database
    await connection.query(`USE ${dbConfig.database}`);

    // Read and execute schema.sql
    console.log("📄 Reading schema.sql...");
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    console.log("📝 Executing schema.sql...");
    await connection.query(schemaSql);
    console.log("✅ Schema created successfully!\n");

    // Read and execute seeder.sql
    console.log("📄 Reading seeder.sql...");
    const seederPath = path.join(__dirname,  "seeder.sql");
    const seederSql = fs.readFileSync(seederPath, "utf8");
    console.log("📝 Executing seeder.sql...");

    // Use query() instead of execute() to avoid prepared statement protocol issues
    await connection.query(seederSql);

    console.log("✅ Seeder executed successfully!\n");

    // Test queries to verify data
    console.log("🔍 Running verification queries...\n");

    // Count users
    const [usersCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM users"
    );
    console.log(`👥 Total Users: ${usersCount[0].count}`);

    // Count presentations
    const [presCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM presentations"
    );
    console.log(`📊 Total Presentations: ${presCount[0].count}`);

    // Count slides
    const [slidesCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM slides"
    );
    console.log(`📋 Total Slides: ${slidesCount[0].count}\n`);

    // Show sample data
    console.log("📋 Sample Users:");
    const [users] = await connection.execute(
      "SELECT uuid, username, email FROM users LIMIT 3"
    );
    console.table(users);

    console.log("📋 Sample Presentations:");
    const [presentations] = await connection.execute(
      `SELECT p.uuid, p.title, u.username, COUNT(s.uuid) as slide_count 
       FROM presentations p 
       JOIN users u ON p.user_id = u.uuid 
       LEFT JOIN slides s ON p.uuid = s.presentation_id 
       GROUP BY p.uuid 
       LIMIT 3`
    );
    console.table(presentations);

    console.log("📋 Sample Slide Content (First 3):");
    const [slides] = await connection.execute(
      `SELECT uuid, presentation_id, slide_order, 
              SUBSTRING(content, 1, 80) as content_preview 
       FROM slides 
       LIMIT 3`
    );
    console.table(slides);

    console.log("\n✨ All tests passed successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.code === "ER_ACCESS_DENIED_FOR_USER") {
      console.error("💡 Hint: Check your DB_USER and DB_PASSWORD in .env");
    } else if (error.code === "ER_PARSE_ERROR") {
      console.error("💡 Hint: There's a SQL syntax error in your script");
      console.error("Details:", error.sqlMessage);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n🔌 Connection closed");
    }
  }
}

runTests();
