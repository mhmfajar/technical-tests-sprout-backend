import { Router } from "express";

import accountRoutes from "./accountRoutes";
import arRoutes from "./arRoutes";
import cashRoutes from "./cashRoutes";
import journalRoutes from "./journalRoutes";
import partyRoutes from "./partyRoutes";
import salesRoutes from "./salesRoutes";
import userRoutes from "./userRoutes";

const mainRouter = Router();
const apiRouter = Router();

apiRouter.use("/users", userRoutes);
apiRouter.use("/accounts", accountRoutes);
apiRouter.use("/journals", journalRoutes);
apiRouter.use("/cash", cashRoutes);
apiRouter.use("/ar", arRoutes);
apiRouter.use("/parties", partyRoutes);
apiRouter.use("/sales", salesRoutes);

mainRouter.use("/api", apiRouter);

export default mainRouter;
