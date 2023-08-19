import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import User from "../../models/User/User";
import Project from "../../models/Project/Project";

import { mockUserData, mockProjectData } from "../../test/mock";

describe("Project Functional Tests", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI!);

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(mockUserData);

    process.env.TEST_TOKEN = response.body.token;
  });

  it("should create a new project", async () => {
    const response = await request(app)
      .post("/api/v1/projects/create")
      .set("Authorization", `Bearer ${process.env.TEST_TOKEN}`)
      .send(mockProjectData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.name).toBe(mockProjectData.name);
    expect(response.body.data.description).toBe(mockProjectData.description);
  });

  it("should throw error on project creation", async () => {
    jest.spyOn(Project.prototype, "save").mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const response = await request(app)
      .post("/api/v1/projects/create")
      .set("Authorization", `Bearer ${process.env.TEST_TOKEN}`)
      .send();

    expect(response.status).toBe(500);
  });

  afterAll(async () => {
    await User.deleteOne({ username: mockUserData.username });
    await Project.deleteOne({ name: mockProjectData.name });
    await mongoose.connection.close();
  });
});