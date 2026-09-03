/**
 * Payment Provider Abstraction Layer for Noléya Marketplace
 *
 * Designed to support Ghanaian payment service providers (e.g. Paystack Ghana, Hubtel, Zeepay)
 * for MTN Mobile Money, Telecel Cash, AT Money, and Visa/Mastercard.
 */

export interface InitializePaymentInput {
  orderId: number;
  amountGhs: number;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  callbackUrl: string;
}

export interface InitializePaymentResult {
  success: boolean;
  reference: string;
  checkoutUrl?: string;
  provider: string;
  message: string;
}

export interface VerifyPaymentResult {
  verified: boolean;
  status: 'success' | 'failed' | 'abandoned' | 'pending';
  amountGhs: number;
  channel?: string; // 'momo_mtn' | 'momo_telecel' | 'card'
  reference: string;
  paidAt?: string;
}

export interface IPaymentGateway {
  name: string;
  isConfigured(): boolean;
  initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult>;
  verifyPayment(reference: string): Promise<VerifyPaymentResult>;
}

/**
 * Default WhatsApp / Offline Order Gateway
 * Current active MVP transaction mode for Noléya Marketplace
 */
export class WhatsAppOrderGateway implements IPaymentGateway {
  name = 'WhatsApp Direct Fulfillment';

  isConfigured(): boolean {
    return true;
  }

  async initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult> {
    return {
      success: true,
      reference: `NL-WA-${input.orderId}-${Date.now()}`,
      provider: this.name,
      message: 'Direct WhatsApp communication and settlement arranged with verified seller.',
    };
  }

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    return {
      verified: true,
      status: 'pending',
      amountGhs: 0,
      reference,
    };
  }
}

/**
 * Paystack Ghana Gateway Abstraction (Staged for future API key integration)
 */
export class PaystackGhanaGateway implements IPaymentGateway {
  name = 'Paystack Ghana (MoMo & Card)';

  isConfigured(): boolean {
    return Boolean(process.env.PAYSTACK_SECRET_KEY);
  }

  async initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        reference: '',
        provider: this.name,
        message: 'Paystack is not currently enabled on this instance. Please use WhatsApp Direct Checkout.',
      };
    }
    // Future integration code hooks here
    throw new Error('Paystack gateway credentials not configured.');
  }

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    throw new Error('Paystack gateway not configured.');
  }
}

export function getActivePaymentGateway(): IPaymentGateway {
  // If Paystack is configured via env, it can be returned here; otherwise WhatsApp gateway
  if (process.env.PAYSTACK_SECRET_KEY) {
    return new PaystackGhanaGateway();
  }
  return new WhatsAppOrderGateway();
}
