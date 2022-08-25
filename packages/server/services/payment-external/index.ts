import Stripe from "stripe";
import config from "../../config";
import { configManager } from "../_utils";
import { PaymentExternalServiceImpl } from "./payment-external.service";
export type { PaymentExternalService, ChargeDetails } from "./payment-external.service.types";

const stripe = new Stripe(config.stripeKey, { apiVersion: "2022-08-01" });

export const paymentExternalService = new PaymentExternalServiceImpl(stripe, configManager);
