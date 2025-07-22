import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { gql } from "graphql-tag";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

// 👉 GraphQL Schema
const typeDefs = gql`
  type Report {
    id: String!
    clerkId: String!
    createdAt: String!
    updatedAt: String!
    reportType: String!
    status: String!
    ship: String!
    observations: String!
    cause: String!
    actionTaken: String!
    position: String!
    location: String!
    procedure: String!
    actionsAndPositions: String!
    permits: String!
    isolationAndBarriers: String!
    personalProtectiveEquipment: String!
    toolsAndEquipment: String!
    housekeeping: String!
    others: String!
  }

  type Mutation {
    createReport(data: CreateReportInput!): Report!
    sendPushNotification(token: String!, title: String, body: String): Boolean!
    saveUserDevice(token: String!, userId: String!): Boolean!
  }

  type Query {
    reports: [Report!]!
    report(id: String!): Report
  }

  input CreateReportInput {
    clerkId: String!
    reportType: String!
    status: String!
    ship: String!
    observations: String!
    cause: String!
    actionTaken: String!
    position: String!
    location: String!
    procedure: String!
    actionsAndPositions: String!
    permits: String!
    isolationAndBarriers: String!
    personalProtectiveEquipment: String!
    toolsAndEquipment: String!
    housekeeping: String!
    others: String!
  }
`;

// 👉 Resolvers
const resolvers = {
  Query: {
    reports: async () => await prisma.report.findMany(),
    report: async (_: any, args: { id: string }) =>
      await prisma.report.findUnique({ where: { id: args.id } }),
  },
  Mutation: {
    createReport: async (_: any, args: { data: any }) =>
      await prisma.report.create({
        data: { ...args.data, clerkId: "user_anon" },
      }),

    sendPushNotification: async (
      _: any,
      args: { token: string; title?: string; body?: string }
    ) => {
      const message = {
        to: args.token,
        sound: "default",
        title: args.title || "All Goodah",
        body: args.body || "Don't forget to submit your daily report!",
      };

      try {
        const res = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
        });

        const result = await res.json();
        console.log("Push sent:", result);
        return true;
      } catch (err) {
        console.error("Push error:", err);
        return false;
      }
    },

    saveUserDevice: async (_: any, args: { token: string; userId: string }) => {
      try {
        await prisma.userDevice.upsert({
          where: { expoPushToken: args.token },
          update: { userId: args.userId },
          create: { userId: args.userId, expoPushToken: args.token },
        });
        return true;
      } catch (err) {
        console.error("❌ Failed to save token:", err);
        return false;
      }
    },
  },
};

// 👉 Apollo + Express
const server = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
  await server.start();
  app.use("/graphql", expressMiddleware(server));

  // ✅ REST: Save Expo Push Token
  app.post("/api/save-token", async (req, res) => {
    const { token, userId = "anon" } = req.body;

    try {
      await prisma.userDevice.upsert({
        where: { expoPushToken: token },
        update: { userId },
        create: { userId, expoPushToken: token },
      });
      console.log("📥 Received token from client:", token);
      console.log("👤 User ID:", userId);
      console.log("✅ Saved Expo token to DB for userId:", userId);
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("❌ Failed to save token:", err);
      res.status(500).json({ error: "Could not save token" });
    }
  });

  // ✅ REST: Send daily notifications to all tokens
  app.post("/dailyNotify", async (_req, res) => {
    try {
      const devices = await prisma.userDevice.findMany();
      console.log("💾 Found devices:", devices);

      for (const device of devices) {
        const message = {
          to: device.expoPushToken,
          sound: "default",
          title: "Time to report!",
          body: "Don't forget to submit your daily safety report.",
        };

        const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
        });

        const result = await expoRes.json();
        console.log("📬 Result for", device.expoPushToken, ":", result);
      }

      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Auto push error:", err);
      res.status(500).json({ error: "Failed to send push" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    const { name, rating, comment } = req.body;

    if (!name || !rating || !comment) {
      return res
        .status(400)
        .json({ error: "All fields are required. (Except Name)" });
    }

    try {
      const feedback = await prisma.feedback.create({
        data: { name, rating: Number(rating), comment },
      });

      console.log("📝 New feedback saved:", feedback);
      res.status(201).json({ ok: true });
    } catch (err) {
      console.error("❌ Failed to save feedback:", err);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  // ✅ Start Express server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Fullstack server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();
