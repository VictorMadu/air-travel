import config from "../../config";
import { asyncFnCallRetrier } from "../_utils";
import { LocationInfoExternalServiceImpl } from "./location-info-external.service";

export type { LocationInfoExternalService } from "./location-info-external.service.types";

export const locationInfoExternalService = new LocationInfoExternalServiceImpl(
    asyncFnCallRetrier,
    config
);
