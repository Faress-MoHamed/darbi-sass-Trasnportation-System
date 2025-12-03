import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.log("❌ DATABASE_URL is not defined");
} else {
    // Mask the password
    const url = new URL(dbUrl);
    const maskedUrl = `${url.protocol}//${url.username}:****@${url.host}${url.pathname}${url.search}`;
    console.log("DATABASE_URL (masked):", maskedUrl);
    console.log("Protocol:", url.protocol);
    console.log("Host:", url.hostname);
    console.log("Port:", url.port || "(default)");
    console.log("Database:", url.pathname.slice(1));
}
