import { Router } from "express";
import SavingController from "../controller/saving.controller.js";

const savingRouter = new Router();
const controller = new SavingController();

savingRouter.post("/", controller.createSaving);
savingRouter.get("/latest", controller.getLatestSaving);
savingRouter.get("/:cubeid", controller.getOneSaving);
savingRouter.get("/", controller.getAllSavings);
savingRouter.put("/", controller.updateSaving);
savingRouter.delete("/", controller.deleteSaving);

export default savingRouter;
