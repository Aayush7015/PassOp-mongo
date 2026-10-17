require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");

const requiredEnvironment = ["MONGO_URI", "JWT_SECRET", "ENCRYPTION_KEY"];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);
if (missingEnvironment.length) throw new Error(`Missing required environment variables: ${missingEnvironment.join(", ")}`);
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, "base64");
if (encryptionKey.length !== 32) throw new Error("ENCRYPTION_KEY must be a base64 value that decodes to exactly 32 bytes.");

const app = express();
const port = Number(process.env.PORT) || 3000;
const client = new MongoClient(process.env.MONGO_URI);
let db;

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "16kb" }));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173", methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"] }));
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { message: "Too many attempts. Please try again later." } });

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const passwordError = (password) => {
  if (typeof password !== "string" || password.length < 10) return "Password must be at least 10 characters.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) return "Password must include uppercase, lowercase, number, and symbol.";
  return null;
};
function encrypt(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  return { ciphertext: ciphertext.toString("base64"), iv: iv.toString("base64"), authTag: cipher.getAuthTag().toString("base64") };
}
function decrypt(encrypted) {
  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, Buffer.from(encrypted.iv, "base64"));
    decipher.setAuthTag(Buffer.from(encrypted.authTag, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(encrypted.ciphertext, "base64")), decipher.final()]).toString("utf8");
  } catch { throw Object.assign(new Error("Unable to decrypt credential."), { status: 500 }); }
}
function authRequired(req, res, next) {
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Authentication is required." });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ message: "Your session is invalid or has expired." }); }
}
function credentialSummary(credential) {
  return { id: credential._id.toString(), site: credential.site, username: credential.username, createdAt: credential.createdAt, updatedAt: credential.updatedAt };
}

app.post("/api/auth/register", authLimiter, async (req, res) => {
  const name = String(req.body.name || "").trim(); const email = normalizeEmail(req.body.email); const { password } = req.body; const invalidPassword = passwordError(password);
  if (name.length < 2 || !isValidEmail(email) || invalidPassword) return res.status(400).json({ message: invalidPassword || "Provide a name and valid email address." });
  try {
    const now = new Date();
    await db.collection("users").insertOne({ name, email, passwordHash: await bcrypt.hash(password, 12), createdAt: now, updatedAt: now });
    res.status(201).json({ message: "Registration successful. Please log in." });
  } catch (error) { if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists." }); throw error; }
});
app.post("/api/auth/login", authLimiter, async (req, res) => {
  const email = normalizeEmail(req.body.email); const { password } = req.body;
  if (!isValidEmail(email) || typeof password !== "string") return res.status(400).json({ message: "Enter a valid email and password." });
  const user = await db.collection("users").findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Invalid email or password." });
  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, user: { id: user._id.toString(), name: user.name, email: user.email } });
});
app.get("/api/auth/me", authRequired, async (req, res) => {
  const user = await db.collection("users").findOne({ _id: new ObjectId(req.user.sub) }, { projection: { passwordHash: 0 } });
  if (!user) return res.status(401).json({ message: "Your session is invalid." });
  res.json({ user: { id: user._id.toString(), name: user.name, email: user.email } });
});
app.post("/api/auth/logout", authRequired, (_req, res) => res.status(204).end());

app.get("/api/passwords", authRequired, async (req, res) => {
  const credentials = await db.collection("credentials").find({ ownerId: new ObjectId(req.user.sub) }).sort({ updatedAt: -1 }).toArray();
  res.json(credentials.map(credentialSummary));
});
app.post("/api/passwords", authRequired, async (req, res) => {
  const site = String(req.body.site || "").trim(); const username = String(req.body.username || "").trim(); const { password } = req.body;
  if (!site || !username || typeof password !== "string" || !password || site.length > 500 || username.length > 500 || password.length > 1000) return res.status(400).json({ message: "Website, username, and password are required." });
  const now = new Date(); const credential = { ownerId: new ObjectId(req.user.sub), site, username, encryptedPassword: encrypt(password), createdAt: now, updatedAt: now };
  const result = await db.collection("credentials").insertOne(credential);
  res.status(201).json(credentialSummary({ ...credential, _id: result.insertedId }));
});
app.post("/api/passwords/:id/reveal", authRequired, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid credential id." });
  const credential = await db.collection("credentials").findOne({ _id: new ObjectId(req.params.id), ownerId: new ObjectId(req.user.sub) });
  if (!credential) return res.status(404).json({ message: "Credential not found." });
  res.json({ password: decrypt(credential.encryptedPassword) });
});
app.put("/api/passwords/:id", authRequired, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid credential id." });
  const site = String(req.body.site || "").trim(); const username = String(req.body.username || "").trim();
  if (!site || !username || site.length > 500 || username.length > 500) return res.status(400).json({ message: "Website and username are required." });
  const update = { site, username, updatedAt: new Date() };
  if (req.body.password !== undefined) { if (typeof req.body.password !== "string" || !req.body.password) return res.status(400).json({ message: "Password cannot be empty." }); update.encryptedPassword = encrypt(req.body.password); }
  const result = await db.collection("credentials").findOneAndUpdate({ _id: new ObjectId(req.params.id), ownerId: new ObjectId(req.user.sub) }, { $set: update }, { returnDocument: "after" });
  if (!result) return res.status(404).json({ message: "Credential not found." });
  res.json(credentialSummary(result));
});
app.delete("/api/passwords/:id", authRequired, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid credential id." });
  const result = await db.collection("credentials").deleteOne({ _id: new ObjectId(req.params.id), ownerId: new ObjectId(req.user.sub) });
  if (!result.deletedCount) return res.status(404).json({ message: "Credential not found." });
  res.status(204).end();
});
app.use((error, _req, res, _next) => { const status = error.status || 500; if (status >= 500) console.error("Unexpected server error:", error.message); res.status(status).json({ message: status >= 500 ? "An unexpected server error occurred." : error.message }); });
async function start() {
  await client.connect(); db = client.db(process.env.MONGO_DB_NAME || "passop");
  await db.collection("users").createIndex({ email: 1 }, { unique: true }); await db.collection("credentials").createIndex({ ownerId: 1, updatedAt: -1 });
  app.listen(port, () => console.log(`PassOP API listening on http://localhost:${port}`));
}
start().catch((error) => { console.error("Could not start PassOP API:", error.message); process.exit(1); });
