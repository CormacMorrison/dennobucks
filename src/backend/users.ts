import dotenv from "dotenv";
import { Token } from "./types.ts";
import path from "path";
import { Client } from "pg";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import HttpError from "http-errors";
import validator from "validator";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export async function Register(email: string, username: string, password: string): Promise<Token> {
  if (!validator.isEmail(email)) {
    throw HttpError(400, "Invalid email.");
  } else if (username.length < 3 || username.length > 20) {
    throw HttpError(400, "Username must be between 3 and 20 characters.");
  } else if (!username.match(/^[a-zA-Z0-9_]+$/)) {
    throw HttpError(400, "Username must only cotain alphanumeric characters and underscores.");
  } else if (password.length < 5) {
    throw HttpError(400, "Password must be at least 5 characters.");
  } else if (!password.match(/[0-9]/) || !password.match(/[a-zA-Z]/)) {
    throw HttpError(400, "Password must contain at least one number and one letter.");
  }

  const passwordHash: string = await bcrypt.hash(password, 10);

  const client = new Client();
  const userId = uuidv4();
  await client.connect();
  try {
    const query: string = `
      insert into
        Users(id, username, pw)
      values
        ($1, $2, $3)
    `;
    await client.query(query, [userId, username, passwordHash]);

    const secret: string = process.env.JWT_SECRET || "i-hope-this-secret-isnt-used";
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        userId: userId,
      },
      secret
    );

    await client.end();
    return {
      token,
    };
  } catch (err) {
    // Error codes from https://www.postgresql.org/docs/12/errcodes-appendix.html
    if (err.code === "P0001" || err.code === "23505") {
      throw HttpError(400, err);
    } else {
      throw HttpError(500, err);
    }
  }
}
