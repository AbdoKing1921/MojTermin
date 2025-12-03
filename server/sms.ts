interface SmsOptions {
  to: string;
  message: string;
}

interface BookingSmsData {
  customerPhone: string;
  customerName: string;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
  bookingId: string;
}

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

async function sendSms(options: SmsOptions): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log(`[SMS] Twilio not configured. Would send SMS:`);
    console.log(`  To: ${options.to}`);
    console.log(`  Message: ${options.message}`);
    return false;
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: TWILIO_PHONE_NUMBER,
        To: options.to,
        Body: options.message,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[SMS] Failed to send SMS:", error);
      return false;
    }

    console.log(`[SMS] Successfully sent SMS to ${options.to}`);
    return true;
  } catch (error) {
    console.error("[SMS] Error sending SMS:", error);
    return false;
  }
}

function formatPhoneNumber(phone: string): string | null {
  if (!phone) return null;
  
  let cleaned = phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");
  
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }
  
  if (cleaned.startsWith("0") && !cleaned.startsWith("+")) {
    cleaned = "+387" + cleaned.slice(1);
  }
  
  if (!cleaned.startsWith("+")) {
    cleaned = "+387" + cleaned;
  }
  
  return cleaned;
}

export async function sendBookingConfirmationSms(data: BookingSmsData): Promise<boolean> {
  const phone = formatPhoneNumber(data.customerPhone);
  if (!phone) {
    console.log("[SMS] Invalid or missing phone number, skipping SMS");
    return false;
  }

  const message = `BookIt: Vaša rezervacija kod "${data.businessName}" za ${data.date} u ${data.time} je kreirana. Ref: #${data.bookingId.slice(-6).toUpperCase()}`;

  return sendSms({ to: phone, message });
}

export async function sendBookingStatusSms(
  data: BookingSmsData,
  status: "confirmed" | "cancelled"
): Promise<boolean> {
  const phone = formatPhoneNumber(data.customerPhone);
  if (!phone) {
    console.log("[SMS] Invalid or missing phone number, skipping SMS");
    return false;
  }

  const statusText = status === "confirmed" ? "POTVRĐENA" : "OTKAZANA";
  const message = status === "confirmed"
    ? `BookIt: Vaša rezervacija kod "${data.businessName}" za ${data.date} u ${data.time} je ${statusText}. Vidimo se!`
    : `BookIt: Vaša rezervacija kod "${data.businessName}" za ${data.date} u ${data.time} je ${statusText}. Za više info kontaktirajte biznis.`;

  return sendSms({ to: phone, message });
}

export async function sendOwnerNewBookingSms(
  ownerPhone: string,
  data: BookingSmsData
): Promise<boolean> {
  const phone = formatPhoneNumber(ownerPhone);
  if (!phone) {
    console.log("[SMS] Invalid or missing owner phone number, skipping SMS");
    return false;
  }

  const message = `BookIt: Nova rezervacija! ${data.customerName} za ${data.serviceName}, ${data.date} u ${data.time}. Prijavite se u Admin Panel.`;

  return sendSms({ to: phone, message });
}

export function isSmsConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
}
