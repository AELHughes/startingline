export interface OzowPaymentRequest {
    siteCode: string;
    countryCode: string;
    currencyCode: string;
    amount: number;
    transactionReference: string;
    bankReference: string;
    cancelUrl: string;
    errorUrl: string;
    successUrl: string;
    notifyUrl: string;
    isTest: boolean;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        mobile?: string;
    };
    optional1?: string;
    optional2?: string;
    optional3?: string;
    optional4?: string;
    optional5?: string;
}
export interface OzowPaymentResponse {
    url: string;
    transactionId: string;
    status: 'pending' | 'success' | 'failed' | 'cancelled';
}
export interface OzowWebhookData {
    SiteCode: string;
    TransactionId: string;
    TransactionReference: string;
    Amount: string;
    Status: string;
    Optional1: string;
    Optional2: string;
    Optional3: string;
    Optional4: string;
    Optional5: string;
    CurrencyCode: string;
    IsTest: string;
    StatusMessage: string;
    DateTime: string;
    Hash: string;
}
declare class OzowService {
    private readonly siteCode;
    private readonly privateKey;
    private readonly apiKey;
    private readonly isTest;
    private readonly baseUrl;
    constructor();
    private generateHash;
    createPayment(paymentData: OzowPaymentRequest): Promise<OzowPaymentResponse>;
    verifyWebhook(webhookData: OzowWebhookData): boolean;
    getPaymentStatus(transactionId: string): Promise<any>;
    generatePaymentReference(eventId: string, userId: string): string;
    generateBankReference(eventName: string, customerName: string): string;
}
declare const _default: OzowService;
export default _default;
//# sourceMappingURL=ozowService.d.ts.map