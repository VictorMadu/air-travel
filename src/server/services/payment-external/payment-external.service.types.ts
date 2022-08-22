export interface PaymentExternalService {
    createChargeAndGetDetails(chargeConfigs: ChargeConfig[]): Promise<ChargeDetails>;
    checkIfPaidUsing(chargeId: StripeId): Promise<boolean>;
}

export interface ChargeConfig {
    amountInCents: number;
    productName: string;
    description?: string;
    quantity?: number;
}

export interface ChargeDetails {
    id: string;
    charges: number[];
    hasPaid: boolean;
}
export type StripeId = string;
