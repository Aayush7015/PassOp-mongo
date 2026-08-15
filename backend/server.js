const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const dotenv = require('dotenv')
const crypto = require("crypto");
const algorithm = "aes-256-cbc";

// SECRET KEY (32 bytes)
/*const secretKey = crypto
  .createHash("sha256")
  .update(String(process.env.SECRET_KEY))
  .digest("base64")
  .substr(0, 32);*/

// Encrypt function
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    content: encrypted
  };
}

// Decrypt function
function decrypt(encryptedData) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(encryptedData.iv, "hex")
  );
  let decrypted = decipher.update(encryptedData.content, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}


 //algorithm = "aes-256-cbc";

// SECRET KEY (32 bytes)
 secretKey = crypto
  .createHash("sha256")
  .update(String(process.env.SECRET_KEY))
  .digest("base64")
  .substr(0, 32);

// Encrypt function
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    content: encrypted
  };
}
// Decrypt function
function decrypt(encryptedData) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(encryptedData.iv, "hex")
  );
  let decrypted = decipher.update(encryptedData.content, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
//previous code
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

//const bodyParser = require('bodyParser')
// or as an es module:
// import { MongoClient } from 'mongodb'
dotenv.config()
// Connection URL
//const url = 'mongodb://localhost:27017';
const url = process.env.Mongo_URI;
const client = new MongoClient(url);
// Database Name
const dbName = 'myProject';
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(
  cors({
  origin: 'http://localhost:5174'
}));

client.connect();
  // Get all passwords
  app.get('/', async (req, res) => {
  const db = client.db(dbName);
  const collection = db.collection('passwords');
  const usersCollection = db.collection('users');

  const passwords = await collection.find({}).toArray();
app.post("/register", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Save user
    await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
    });

    res.json({
      message: "Registration Successful",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    // Find user by email
    const user = await usersCollection.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      message: "Login Successful",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});
  // 🔓 Decrypt passwords before sending
  const decryptedPasswords = passwords.map(item => ({
    ...item,
    password: decrypt(item.password)
  }));

  res.json(decryptedPasswords);
});

/*app.get('/', async (req, res) => {
     const db = client.db(dbName);
   const collection = db.collection('passwords');
   const findResult = await collection.find({}).toArray();
   res.json(findResult);
})*/

//save password
// save password (WITH ENCRYPTION) ✅
app.post('/', async (req, res) => {
  const data = req.body;

  // 🔒 Encrypt password before storing
  const encryptedPassword = encrypt(data.password);

  const db = client.db(dbName);
  const collection = db.collection('passwords');

  const result = await collection.insertOne({
    site: data.site,
    username: data.username,
    password: encryptedPassword
  });

  res.send({ success: true, result });
});

/*app.post('/', async (req, res) => {
    const password  = req.body;
    const db = client.db(dbName);
   const collection = db.collection('passwords');
   const findResult = await collection.insertOne(password);
   res.send({success: true, result: findResult});
})*/
// delete a password
app.delete('/', async (req, res) => {
    const password  = req.body;
    const db = client.db(dbName);
   const collection = db.collection('passwords');
   const findResult = await collection.deleteOne(password);
   res.send({success: true, result: findResult});
})
app.listen(port, () => {
  console.log(`Example app listening on  http://localhost:${port}`)
})