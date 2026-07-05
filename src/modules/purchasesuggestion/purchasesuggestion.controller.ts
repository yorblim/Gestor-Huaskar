import { Request, Response, NextFunction } from "express";
import { getSuggestions } from "./purchasesuggestion.service";

export async function getSuggestionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const suggestions = await getSuggestions();
    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    next(error);
  }
}
