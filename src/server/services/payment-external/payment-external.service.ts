import Stripe from "stripe";
import { ConfigManager } from "../_utils/config-manager";
import { ChargeConfig, PaymentExternalService } from "./payment-external.service.types";

export class PaymentExternalServiceImpl implements PaymentExternalService {
    constructor(private stripe: Stripe, private configManager: ConfigManager) {}

    async createChargeAndGetDetails(chargeConfigs: ChargeConfig[]) {
        const charges: number[] = new Array(chargeConfigs.length);
        const session = await this.stripe.checkout.sessions.create({
            success_url: this.configManager.getUrl() + "/payment-success", // TODO: Implement urls is better place
            cancel_url: this.configManager.getUrl() + "/payment-fail",
            payment_method_types: ["card"],

            line_items: chargeConfigs.map((chargeConfig, index) => {
                const description = chargeConfig.description ? chargeConfig.description : undefined;
                const quantity = chargeConfig.quantity ?? 1;
                const unitAmount = this.getValidAmount(chargeConfig.amountInCents);
                charges[index] = quantity * unitAmount;

                return {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: chargeConfig.productName,
                            description,
                        },
                        unit_amount: unitAmount,
                    },
                    quantity,
                };
            }),
            mode: "payment",
        });

        return {
            id: session.id,
            hasPaid: session.payment_status === "paid",
            url: session.url,
            charges,
        };
    }
    async checkIfPaidUsing(stripeId: string) {
        const session = await this.stripe.checkout.sessions.retrieve(stripeId);
        return session.payment_status === "paid";
    }

    private getValidAmount(amount: number) {
        return Math.round(amount + Number.EPSILON);
    }
}
