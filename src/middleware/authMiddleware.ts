import { Request, Response, NextFunction } from "express";

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const providedKey = req.headers["x-api-key"];

  if (!providedKey || providedKey !== process.env.AITOL_API_KEY) {
    return res.status(401).json({ error: "Unauthorized: invalid or missing API key" });
  }

  next();
}