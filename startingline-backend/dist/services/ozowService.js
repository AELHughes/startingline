"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
class OzowService {
    constructor() {
        this.siteCode = process.env.OZOW_SITE_CODE || '';
        this.privateKey = process.env.OZOW_PRIVATE_KEY || '';
        this.apiKey = process.env.OZOW_API_KEY || '';
        this.isTest = process.env.OZOW_IS_TEST === 'true';
        this.baseUrl = this.isTest
            ? 'https://stagingapi.ozow.com'
            : 'https://api.ozow.com';
    }
    generateHash(data) {
        const sortedKeys = Object.keys(data).sort();
        const concatenated = sortedKeys
            .map(key => data[key])
            .join('') + this.privateKey;
        return crypto_1.default
            .createHash('sha512')
            .update(concatenated.toLowerCase())
            .digest('hex')
            .toLowerCase();
    }
    async createPayment(paymentData) {
        try {
            const requestData = {
                SiteCode: this.siteCode,
                CountryCode: 'ZA',
                CurrencyCode: 'ZAR',
                Amount: paymentData.amount.toFixed(2),
                TransactionReference: paymentData.transactionReference,
                BankReference: paymentData.bankReference,
                CancelUrl: paymentData.cancelUrl,
                ErrorUrl: paymentData.errorUrl,
                SuccessUrl: paymentData.successUrl,
                NotifyUrl: paymentData.notifyUrl,
                IsTest: this.isTest ? 'true' : 'false',
                Customer: {
                    FirstName: paymentData.customer.firstName,
                    LastName: paymentData.customer.lastName,
                    Email: paymentData.customer.email,
                    Mobile: paymentData.customer.mobile || ''
                },
                Optional1: paymentData.optional1 || '',
                Optional2: paymentData.optional2 || '',
                Optional3: paymentData.optional3 || '',
                Optional4: paymentData.optional4 || '',
                Optional5: paymentData.optional5 || ''
            };
            const hashData = {
                SiteCode: requestData.SiteCode,
                CountryCode: requestData.CountryCode,
                CurrencyCode: requestData.CurrencyCode,
                Amount: requestData.Amount,
                TransactionReference: requestData.TransactionReference,
                BankReference: requestData.BankReference,
                CancelUrl: requestData.CancelUrl,
                ErrorUrl: requestData.ErrorUrl,
                SuccessUrl: requestData.SuccessUrl,
                NotifyUrl: requestData.NotifyUrl,
                IsTest: requestData.IsTest,
                Optional1: requestData.Optional1,
                Optional2: requestData.Optional2,
                Optional3: requestData.Optional3,
                Optional4: requestData.Optional4,
                Optional5: requestData.Optional5
            };
            const hash = this.generateHash(hashData);
            const response = await axios_1.default.post(`${this.baseUrl}/postpaymentrequest`, {
                ...requestData,
                HashCheck: hash
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'ApiKey': this.apiKey
                }
            });
            if (response.data.IsError) {
                throw new Error(`Ozow API Error: ${response.data.ErrorMessage}`);
            }
            return {
                url: response.data.url,
                transactionId: response.data.transactionId,
                status: 'pending'
            };
        }
        catch (error) {
            console.error('Ozow payment creation failed:', error);
            throw new Error('Failed to create payment request');
        }
    }
    verifyWebhook(webhookData) {
        const hashData = {
            SiteCode: webhookData.SiteCode,
            TransactionId: webhookData.TransactionId,
            TransactionReference: webhookData.TransactionReference,
            Amount: webhookData.Amount,
            Status: webhookData.Status,
            Optional1: webhookData.Optional1,
            Optional2: webhookData.Optional2,
            Optional3: webhookData.Optional3,
            Optional4: webhookData.Optional4,
            Optional5: webhookData.Optional5,
            CurrencyCode: webhookData.CurrencyCode,
            IsTest: webhookData.IsTest,
            StatusMessage: webhookData.StatusMessage
        };
        const expectedHash = this.generateHash(hashData);
        return expectedHash === webhookData.Hash.toLowerCase();
    }
    async getPaymentStatus(transactionId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/gettransaction/${transactionId}`, {
                headers: {
                    'ApiKey': this.apiKey
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to get payment status:', error);
            throw new Error('Failed to retrieve payment status');
        }
    }
    generatePaymentReference(eventId, userId) {
        const timestamp = Date.now();
        return `SL-${eventId}-${userId}-${timestamp}`;
    }
    generateBankReference(eventName, customerName) {
        const cleanEventName = eventName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        const cleanCustomerName = customerName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        return `${cleanEventName}-${cleanCustomerName}`.toUpperCase();
    }
}
exports.default = new OzowService();
//# sourceMappingURL=ozowService.js.map