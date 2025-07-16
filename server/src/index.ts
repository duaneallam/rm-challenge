import { Hono } from "hono";
import { OpenElectricityClient } from "openelectricity";

interface Env {
  OPEN_ELECTRICITY_API_TOKEN: string;
}

const app = new Hono<{ Bindings: Env }>();

app.get("/api/message", async (c) => {
  /* send a request below to openelectricity.org.au to retrieve facilities */

  // const res = await fetch("https://api.openelectricity.org.au/v4/facilities", {
  //     headers: {
  //         Authorization: `Bearer ${c.env.OPEN_ELECTRICITY_API_TOKEN}`
  //     }
  // });

  return c.json({
    message: "✅ Hello world.",
  });
});

app.get("/api/facilities", async (c) => {
  const client = new OpenElectricityClient({
    apiKey: c.env.OPEN_ELECTRICITY_API_TOKEN,
    baseUrl: "https://api.openelectricity.org.au/v4",
  });
  const { response, table } = await client.getFacilities();

  return c.json(response.data);
});

export default app;
