import express, { Response, Request, NextFunction, Router } from "express";
import { runDbsInit } from "./services/run-dbs-init";
import runServicesInit from "./services/run-services-init";
import { attachRoutes, Attacher } from "./controllers";
import attachMiddleware from "./middleware";
import config from "./config";

export default class Bootstrap {
    private app = express();

    static async loadAndStartApp() {
        const bootstrap = new Bootstrap();

        await bootstrap.startAllInits();
        bootstrap.attachMiddleware();
        bootstrap.attachControllersToRoute();
        bootstrap.attachEscapedErrorCatcher();
        bootstrap.startListening();
    }

    private constructor() {}

    private attachControllersToRoute() {
        const controllerAttacher = this.createControllerAttacher();
        attachRoutes(controllerAttacher);
    }

    private createControllerAttacher(): Attacher {
        return {
            attach: (routePath: string, controller: Router) => this.app.use(routePath, controller),
        };
    }

    private attachMiddleware() {
        attachMiddleware(this.app);
    }

    private async startAllInits() {
        await runDbsInit();
        await runServicesInit();
    }

    private attachEscapedErrorCatcher() {
        (<any>this.app).use((err: Error, req: Request, res: Response, next: NextFunction) => {
            res.status(500).json({
                status: false,
                msg: "Internal Server Error",
            });

            console.error("VERY CRITICAL: Uncaught error", err);
        });
    }

    private startListening() {
        this.app.listen(config.port, config.host, () => {
            console.log("app listening to", config.host + ":" + config.port);
        });

        // TODO: Prevent server from unexcepted crashing
    }
}
