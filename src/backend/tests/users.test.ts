import { Register } from "../users.ts";
import { Client } from "pg";
import axios from "axios";
import { port, url } from "../config.json";

const SERVER_URL = `${url}:${port}`;

jest.mock("pg", () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };

  return {
    Client: jest.fn(() => mClient),
  };
});

describe("Register", () => {
  let client: Client;
  beforeEach(() => {
    client = new Client();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  test("Invalid email", async () => {
    await expect(
      axios.post(`${SERVER_URL}/auth/register`, {
        email: "abc",
        password: "lamingtons1",
        username: "lamingt",
      })
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          error: expect.any(String),
        },
      },
    });
  });

  test("Invalid username length", async () => {
    await expect(
      axios.post(`${SERVER_URL}/auth/register`, {
        email: "abc@gmai.com",
        password: "lamingtons1",
        username: "la",
      })
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          error: expect.any(String),
        },
      },
    });
  });

  test("Invalid username characters", async () => {
    await expect(
      axios.post(`${SERVER_URL}/auth/register`, {
        email: "abc@gmai.com",
        password: "lamingtons1",
        username: "lamingt!",
      })
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          error: expect.any(String),
        },
      },
    });
  });

  test("Invalid password length", async () => {
    await expect(
      axios.post(`${SERVER_URL}/auth/register`, {
        email: "abc@gmai.com",
        password: "lam1",
        username: "lamingt",
      })
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          error: expect.any(String),
        },
      },
    });
  });

  test("Password does not contain at least one number and letter", async () => {
    await expect(
      axios.post(`${SERVER_URL}/auth/register`, {
        email: "abc@gmai.com",
        password: "lamingtons",
        username: "lamingt",
      })
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          error: expect.any(String),
        },
      },
    });
  });

  test("Valid Registration", async () => {
    const res = await Register("abc@gmail.com", "lamingt", "lamingtons1");

    expect(client.connect).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining(`
      insert into
        Users(id, username, email, pw)
      values
        ($1, $2, $3, $4)
    `),
      expect.arrayContaining([expect.any(String), "lamingt", "abc@gmail.com", expect.any(String)])
    );
    expect(client.end).toHaveBeenCalledTimes(1);
    expect(res).toStrictEqual({
      token: expect.any(String),
    });
  });
});
