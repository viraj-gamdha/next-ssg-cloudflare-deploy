import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { Bindings, Next } from "hono/types";
import { Product, products } from "./db/schema";
import { createDb, DrizzleDB } from "./db/db";
import { ContentfulStatusCode } from "hono/utils/http-status";

// Define environment variables interface
interface Env {
  DB: D1Database;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_TOKEN: string;
}

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      // Allow development and production origins
      const allowedOrigins = ["https://next-js-test-68e.pages.dev"];
      return allowedOrigins.includes(origin) ? origin : "http://localhost:3000";
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    credentials: true,
  })
);

// Db middleware
app.use("*", async (c: Context, next: Next) => {
  const db = createDb(c.env.DB);
  c.set("db", db);
  await next();
});

app.post("/trigger-deploy", async (c: Context<{ Bindings: Env }>) => {
  try {
    const { message, data, user } = await c.req.json().catch(() => ({}));

    const clientPayload = {
      timestamp: new Date().toISOString(),
      trigger_source: "hono-api",
      message:
        message ||
        `Deployment triggered via API at ${new Date().toISOString()}`,
      data: data || "No additional data provided.",
      user: user || "anonymous",
    };

    console.log("Attempting to trigger GitHub Actions workflow...");

    const githubApiUrl = `https://api.github.com/repos/${c.env.GITHUB_OWNER}/${c.env.GITHUB_REPO}/dispatches`;

    const response = await fetch(githubApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Hono-GitHub-Trigger/1.0", // It's good practice to have a User-Agent
      },
      body: JSON.stringify({
        event_type: "trigger-deploy",
        client_payload: clientPayload,
      }),
    });

    if (response.ok) {
      console.log("Successfully triggered GitHub Actions workflow.");
      return c.json({
        success: true,
        message: "Workflow dispatch event sent to GitHub.",
        payload: clientPayload,
      });
    } else {
      const errorResponse = await response.text();
      console.error("Failed to trigger GitHub workflow:", errorResponse);
      return c.json(
        {
          success: false,
          message: "Failed to trigger GitHub workflow.",
          error: {
            status: response.status,
            statusText: response.statusText,
            response: errorResponse,
          },
        },
        response.status as ContentfulStatusCode
      );
    }
  } catch (error: any) {
    console.error("An unexpected error occurred:", error);
    return c.json(
      {
        success: false,
        message: "An internal server error occurred.",
        error: error.message,
      },
      500
    );
  }
});

// GET endpoint to fetch all products
app.get("/get-products", async (c: Context) => {
  try {
    const db: DrizzleDB = c.get("db");

    const productsData: Product[] = await db.select().from(products).all();

    return c.json({
      success: true,
      message: "Products fetched successfully",
      data: productsData,
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch products",
        error: error.message,
      },
      500
    );
  }
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
