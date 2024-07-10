import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.use(
  "/transcription",
  cors({
    origin: "*",
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  }),
);

app.post("/transcription", async (c) => {
  const { audio, apiKey } = await c.req.json();
  if (audio && apiKey) {
    const response = await fetch(audio);
    const audioFile = await response.blob();
    if (audioFile) {
      const form = new FormData();
      form.append("model", "whisper-1");
      form.append("file", audioFile);
      const transcription = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );
      const response: any = await transcription.json();
      return c.json(response);
    }
  }
  c.status(500);
  return c.json({ message: "audio and apiKey can't be empty" });
});

export default app;
