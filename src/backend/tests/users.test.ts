import { Register } from "../users.ts";
import { Client } from "pg";
import MockAdapter from "axios-mock-adapter";
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

const mock = new MockAdapter(axios);
mock
  .onPost(`${SERVER_URL}/register`, {
    email: "email@email.com",
    password: "password123",
    username: "namington",
  })
  .reply(200, {
    token: "token123",
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

  test("Testing API endpoint", async () => {
    const res = await axios.post(`${SERVER_URL}/register`, {
      email: "email@email.com",
      password: "password123",
      username: "namington",
    });
    expect(res.data.token).toEqual("token123");
  });

  test("Invalid email", async () => {
    const res = await Register("abc", "lamingt", "lamingtons1");
    expect(client.connect).toHaveBeenCalledTimes(0);
    expect(res).toStrictEqual({
      error: expect.any(String),
      statusCode: 400,
    });
  });

  test("Invalid username length", async () => {
    const res = await Register("abc@gmai.com", "la", "lamingtons1");
    expect(client.connect).toHaveBeenCalledTimes(0);
    expect(res).toStrictEqual({
      error: expect.any(String),
      statusCode: 400,
    });
  });

  test("Invalid username characters", async () => {
    const res = await Register("abc@gmai.com", "lamingt!", "lamingtons1");
    expect(client.connect).toHaveBeenCalledTimes(0);
    expect(res).toStrictEqual({
      error: expect.any(String),
      statusCode: 400,
    });
  });

  test("Invalid password length", async () => {
    const res = await Register("abc@gmai.com", "lamingt", "lam1");
    expect(client.connect).toHaveBeenCalledTimes(0);
    expect(res).toStrictEqual({
      error: expect.any(String),
      statusCode: 400,
    });
  });

  test("Password does not contain at least one number and letter", async () => {
    const res = await Register("abc@gmai.com", "lamingt", "lamingtons");
    expect(client.connect).toHaveBeenCalledTimes(0);
    expect(res).toStrictEqual({
      error: expect.any(String),
      statusCode: 400,
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
