import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';
import { BookingStatus } from '@shared/schema';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string, uuid: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    
    const stripe = await getUncachableStripeClient();
    const webhooks = await stripe.webhookEndpoints.list({ limit: 100 });
    const managedWebhook = webhooks.data.find(wh => wh.url?.includes(uuid));
    
    if (!managedWebhook) {
      throw new Error('Managed webhook not found');
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      managedWebhook.secret!
    );

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await WebhookHandlers.handleCheckoutCompleted(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await WebhookHandlers.handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    await sync.processWebhook(payload, signature, uuid);
  }

  static async handleCheckoutCompleted(session: any): Promise<void> {
    console.log(`[Stripe] Checkout completed for session: ${session.id}`);
    
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      console.error('[Stripe] No bookingId in session metadata');
      return;
    }

    const booking = await storage.getBookingById(parseInt(bookingId));
    if (!booking) {
      console.error(`[Stripe] Booking not found: ${bookingId}`);
      return;
    }

    await storage.updateBookingPayment(parseInt(bookingId), {
      stripePaymentIntentId: session.payment_intent,
      paymentStatus: 'paid',
      status: BookingStatus.CONFIRMED,
    });

    if (booking.availabilityId) {
      await storage.incrementBookedSpots(booking.availabilityId, booking.guests);
    }

    console.log(`[Stripe] Booking ${bookingId} confirmed and spots reserved`);
  }

  static async handlePaymentFailed(paymentIntent: any): Promise<void> {
    console.log(`[Stripe] Payment failed for intent: ${paymentIntent.id}`);
    
    const booking = await storage.getBookingByPaymentIntent(paymentIntent.id);
    if (!booking) {
      console.log('[Stripe] No booking found for failed payment intent');
      return;
    }

    await storage.updateBookingPayment(booking.id, {
      paymentStatus: 'failed',
      status: BookingStatus.CANCELLED,
      cancelReason: 'Pago fallido',
    });

    console.log(`[Stripe] Booking ${booking.id} marked as failed`);
  }
}
