/**
 * Seeds (or updates) the single platform administrator account.
 *
 * Admins are NEVER created through the public registration form. Run this once
 * to provision the admin, controlled entirely by environment variables.
 *
 * Usage:
 *   ADMIN_NAME="Site Admin" ADMIN_EMAIL="admin@bookadoctor.com" ADMIN_PASSWORD="strongpass" npm run seed:admin
 *
 * Or set ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD in server/.env and run:
 *   npm run seed:admin
 */
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

dotenv.config();

const User = require("../models/User");

const run = async () => {
  const name = process.env.ADMIN_NAME || "Site Administrator";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Missing ADMIN_EMAIL or ADMIN_PASSWORD. Set them in server/.env or pass inline."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const existing = await User.findOne({ email });

    if (existing) {
      existing.name = name;
      existing.password = hashedPassword;
      existing.role = "admin";
      await existing.save();
      console.log(`Updated existing user "${email}" -> admin.`);
    } else {
      await User.create({ name, email, password: hashedPassword, role: "admin" });
      console.log(`Created admin account "${email}".`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed admin:", err);
    process.exit(1);
  }
};

run();
