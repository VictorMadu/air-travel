import { Response, Request, NextFunction, Router } from "express";
export function catchAsyncRouteErr(route: Route) {
    return (req: Request, res: Response, next: NextFunction) => route(req, res, next).catch(next);
}

type Route = (req: Request, res: Response, next: NextFunction) => Promise<any>;
