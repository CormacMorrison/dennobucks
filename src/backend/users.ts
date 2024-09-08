import dotenv from "dotenv";
import { Token, ErrorOutput } from "./types";
import path from "path";
import { Client } from "pg";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import validator from "validator";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export async function Register(
  email: string,
  username: string,
  password: string
): Promise<Token | ErrorOutput> {
  if (!validator.isEmail(email)) {
    return {
      error: "Invalid email.",
      statusCode: 400,
    };
  } else if (username.length < 3 || username.length > 20) {
    return {
      error: "Username must be between 3 and 20 characters.",
      statusCode: 400,
    };
  } else if (!username.match(/^[a-zA-Z0-9_]+$/)) {
    return {
      error: "Username must only cotain alphanumeric characters and underscores.",
      statusCode: 400,
    };
  } else if (password.length < 5) {
    return {
      error: "Password must be at least 5 characters.",
      statusCode: 400,
    };
  } else if (!password.match(/[0-9]/) || !password.match(/[a-zA-Z]/)) {
    return {
      error: "Password must contain at least one number and one letter.",
      statusCode: 400,
    };
  }

  const passwordHash: string = await bcrypt.hash(password, 10);

  const client = new Client();
  const userId = uuidv4();
  await client.connect();
  try {
    const query: string = `
      insert into
        Users(id, username, email, pw)
      values
        ($1, $2, $3, $4)
    `;
    await client.query(query, [userId, username, email, passwordHash]);

    const secret: string = process.env.JWT_SECRET;
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        userId: userId,
      },
      secret
    );

    return {
      token,
    };
  } catch (err) {
    // Error codes from https://www.postgresql.org/docs/12/errcodes-appendix.html
    if (err.code === "P0001" || err.code === "23505") {
      return {
        error: err,
        statusCode: 400,
      };
    } else {
      return {
        error: err,
        statusCode: 500,
      };
    }
  } finally {
    await client.end();
  }
}

export async function Login(email: string, password: string): Promise<Token | ErrorOutput> {
  const client = new Client();
  await client.connect();
  try {
    const query: string = `
      select
        *
      from
        users u
      where
        u.email = $1
    `;

    const res = await client.query(query, [email]);
    console.log(res);
    if (res.rowCount <= 0 || !(await bcrypt.compare(password, res.rows[0].pw))) {
      throw new Error("Email or password are incorrect");
    }

    const secret: string = process.env.JWT_SECRET;
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        userId: res.rows[0].id,
      },
      secret
    );

    return {
      token,
    };
  } catch (err) {
    if (err.message === "Email or password are incorrect") {
      return {
        error: err.message,
        statusCode: 400,
      };
    } else {
      return {
        error: err,
        statusCode: 500,
      };
    }
  } finally {
    await client.end();
  }
}
