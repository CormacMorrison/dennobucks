import dotenv from "dotenv";
import { Token, Error } from "./types.ts";
import path from "path";
import { Client } from "pg";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export async function Register(username: string, password: string): Promise<Token | Error> {
  if (username.length < 3 || username.length > 20) {
    // throw error
  } else if (!username.match(/^[a-zA-Z0-9_]+$/)) {
    // throw error
  } else if (password.length < 5) {
    // throw error
  }

  const passwordHash: string = await bcrypt.hash(password, 10);

  const client = new Client();
  const userId = uuidv4();
  await client.connect();
  console.log("hi");
  try {
    let query: string = `
      insert into
        Users(id, username, pw)
      values
        ($1, $2, $3)
    `;
    console.log("hi");
    await client.query(query, [userId, username, passwordHash]);
    console.log("hi");
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
    return {
      error: err,
    };
  }
}
