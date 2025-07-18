import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { PrismaClient } from "@prisma/client";
import { gql } from "graphql-tag";
import { config } from "dotenv";

// Load environment variables from .env file
config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define GraphQL schema
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

  type Mutation {
    createReport(data: CreateReportInput!): Report!
  }
`;

// Define resolvers
const resolvers = {
  Query: {
    reports: async () => {
      return await prisma.report.findMany();
    },
    report: async (_: any, args: { id: string }) => {
      return await prisma.report.findUnique({ where: { id: args.id } });
    },
  },
  Mutation: {
    createReport: async (_: any, args: { data: any }) => {
      return await prisma.report.create({
        data: { ...args.data, clerkId: "user_2f67U5Q4wrZKQ4hKhXXurI5lqZl" }, //anonynmous
      });
    },
  },
};

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the server
startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
