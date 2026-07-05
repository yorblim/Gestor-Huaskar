import { Router } from "express";
import { getSuggestionsHandler } from "./purchasesuggestion.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const purchaseSuggestionRouter = Router();

purchaseSuggestionRouter.get("/", authMiddleware, getSuggestionsHandler);

export default purchaseSuggestionRouter;
