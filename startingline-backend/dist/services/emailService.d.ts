interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    from: string;
    replyTo: string;
}
interface EventRegistrationEmailData {
    participantName: string;
    participantEmail: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    distanceName: string;
    ticketNumber: string;
    organizerName: string;
    organizerLogo?: string;
    ticketPDF?: Buffer;
    eventSlug?: string;
    orderId?: string;
}
declare class EmailService {
    private transporter;
    private config;
    constructor();
    private initializeTransporter;
    private generateEventRegistrationHTML;
    sendEventRegistrationEmail(data: EventRegistrationEmailData): Promise<boolean>;
    sendTestEmail(to: string): Promise<boolean>;
    updateConfig(newConfig: Partial<EmailConfig>): void;
    getConfig(): EmailConfig;
}
export declare const emailService: EmailService;
export type { EmailConfig, EventRegistrationEmailData };
//# sourceMappingURL=emailService.d.ts.map