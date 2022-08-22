import express, { Response, Request, NextFunction, Router } from "express";
import { runDbsInit } from "./services/run-dbs-init";
import runServicesInit from "./services/run-services-init";
import { attachControllersToRoute, Attacher } from "./controllers";
import attachMiddleware from "./middleware";
import config from "./config";

export default class Bootstrap {
    private app = express();

    static async loadAndStartApp() {
        const bootstrap = new Bootstrap();
        await bootstrap.attachControllersToRoute().attachMiddleware().startAllInits();
        bootstrap.attachEscapedErrorCatcher().startListening();
    }

    private constructor() {}

    private attachControllersToRoute() {
        const controllerAttacher = this.createControllerAttacher();
        attachControllersToRoute(controllerAttacher);

        return this;
    }

    private createControllerAttacher(): Attacher {
        return {
            attach: (routePath: string, controller: Router) => this.app.use(routePath, controller),
        };
    }

    private attachMiddleware() {
        attachMiddleware(this.app);
        return this;
    }

    private async startAllInits() {
        await runDbsInit();
        await runServicesInit();
        return this;
    }

    private attachEscapedErrorCatcher() {
        (<any>this.app).use((err: Error, req: Request, res: Response, next: NextFunction) => {
            res.status(500).json({
                status: false,
                msg: "Internal Server Error",
            });

            console.error("VERY CRITICAL: Uncaught error", err);
        });

        return this;
    }

    private startListening() {
        this.app.listen(config.port, config.host, () => {
            console.log("app listening to", config.host + ":" + config.port);
        });
        return this;
        // TODO: Prevent server from unexcepted crashing
    }
}
