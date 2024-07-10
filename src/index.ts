import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/transcription", async (c) => {
  const { data } = await c.req.json();
  const { audio, apiKey } = data;
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
