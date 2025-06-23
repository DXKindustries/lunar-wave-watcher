import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/api/noaa', async (req: Request, res: Response): Promise<void> => {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing or invalid NOAA API URL' });
    return;
  }

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("NOAA proxy error:", error.message);
    } else {
      console.error("NOAA proxy error:", error);
    }
    res.status(500).json({ error: 'Failed to fetch from NOAA API' });
  }
});

app.get('/api/zip-lookup', async (req: Request, res: Response): Promise<void> => {
  const { zip } = req.query;

  if (!zip || typeof zip !== 'string') {
    res.status(400).json({ error: 'Missing ZIP code' });
    return;
  }

  const zipCode = zip.trim();
  if (!/^\d{5}(?:-\d{4})?$/.test(zipCode)) {
    res.status(400).json({ error: 'Invalid ZIP code format' });
    return;
  }

  try {
    const response = await axios.get(`https://api.zippopotam.us/us/${zipCode}`);
    res.json(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      res.status(error.response.status).json({ error: 'Failed to fetch ZIP code data' });
    } else {
      res.status(500).json({ error: 'Failed to fetch ZIP code data' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`NOAA Proxy Server running on http://localhost:${PORT}`);
});
