interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
  price: string;
  bookingId: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@bookit.app";

async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL] Resend API key not configured. Would send email:`);
    console.log(`  To: ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[EMAIL] Failed to send email:", error);
      return false;
    }

    console.log(`[EMAIL] Successfully sent email to ${options.to}`);
    return true;
  } catch (error) {
    console.error("[EMAIL] Error sending email:", error);
    return false;
  }
}

export async function sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
  const subject = `Potvrda rezervacije - ${data.businessName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 500px; margin: 0 auto; padding: 24px; }
        .header { background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; }
        .content { background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px; }
        .details { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #6b7280; font-size: 14px; }
        .value { font-weight: 600; color: #1a1a1a; }
        .footer { text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px; }
        .badge { background: #10B981; color: white; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>BookIt - Potvrda rezervacije</h1>
        </div>
        <div class="content">
          <p>Poštovani/a <strong>${data.customerName}</strong>,</p>
          <p>Vaša rezervacija je uspješno kreirana! Evo detalja:</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Biznis</span>
              <span class="value">${data.businessName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Usluga</span>
              <span class="value">${data.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Datum</span>
              <span class="value">${data.date}</span>
            </div>
            <div class="detail-row">
              <span class="label">Vrijeme</span>
              <span class="value">${data.time}</span>
            </div>
            <div class="detail-row">
              <span class="label">Cijena</span>
              <span class="value">${data.price} KM</span>
            </div>
            <div class="detail-row">
              <span class="label">Status</span>
              <span class="badge">Na čekanju</span>
            </div>
          </div>
          
          <p>Sačuvajte broj rezervacije: <strong>#${data.bookingId.slice(-8).toUpperCase()}</strong></p>
          <p>Primit ćete obavještenje kada biznis potvrdi vašu rezervaciju.</p>
          
          <div class="footer">
            <p>BookIt - Vaša platforma za jednostavne rezervacije</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Potvrda rezervacije - ${data.businessName}

Poštovani/a ${data.customerName},

Vaša rezervacija je uspješno kreirana!

Detalji:
- Biznis: ${data.businessName}
- Usluga: ${data.serviceName}
- Datum: ${data.date}
- Vrijeme: ${data.time}
- Cijena: ${data.price} KM

Broj rezervacije: #${data.bookingId.slice(-8).toUpperCase()}

BookIt - Vaša platforma za jednostavne rezervacije
  `;

  return sendEmail({ to: data.customerEmail, subject, html, text });
}

export async function sendBookingStatusUpdate(
  data: BookingEmailData,
  status: "confirmed" | "cancelled"
): Promise<boolean> {
  const statusText = status === "confirmed" ? "POTVRĐENA" : "OTKAZANA";
  const statusColor = status === "confirmed" ? "#10B981" : "#EF4444";
  const subject = `Rezervacija ${statusText} - ${data.businessName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 500px; margin: 0 auto; padding: 24px; }
        .header { background: ${statusColor}; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; }
        .content { background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px; }
        .details { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #6b7280; font-size: 14px; }
        .value { font-weight: 600; color: #1a1a1a; }
        .footer { text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Rezervacija ${statusText}</h1>
        </div>
        <div class="content">
          <p>Poštovani/a <strong>${data.customerName}</strong>,</p>
          <p>${status === "confirmed" 
            ? "Vaša rezervacija je potvrđena! Vidimo se u zakazano vrijeme." 
            : "Nažalost, vaša rezervacija je otkazana. Kontaktirajte nas za više informacija."}
          </p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Biznis</span>
              <span class="value">${data.businessName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Usluga</span>
              <span class="value">${data.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Datum</span>
              <span class="value">${data.date}</span>
            </div>
            <div class="detail-row">
              <span class="label">Vrijeme</span>
              <span class="value">${data.time}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>BookIt - Vaša platforma za jednostavne rezervacije</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Rezervacija ${statusText} - ${data.businessName}

Poštovani/a ${data.customerName},

${status === "confirmed" 
  ? "Vaša rezervacija je potvrđena! Vidimo se u zakazano vrijeme." 
  : "Nažalost, vaša rezervacija je otkazana."}

Detalji:
- Biznis: ${data.businessName}
- Usluga: ${data.serviceName}
- Datum: ${data.date}
- Vrijeme: ${data.time}

BookIt
  `;

  return sendEmail({ to: data.customerEmail, subject, html, text });
}

export async function sendOwnerNotification(
  ownerEmail: string,
  data: BookingEmailData
): Promise<boolean> {
  const subject = `Nova rezervacija - ${data.serviceName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 500px; margin: 0 auto; padding: 24px; }
        .header { background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); color: #1a1a1a; padding: 24px; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; }
        .content { background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px; }
        .details { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #6b7280; font-size: 14px; }
        .value { font-weight: 600; color: #1a1a1a; }
        .footer { text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px; }
        .btn { display: inline-block; background: #1E40AF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nova rezervacija!</h1>
        </div>
        <div class="content">
          <p>Imate novu rezervaciju za <strong>${data.businessName}</strong>.</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Klijent</span>
              <span class="value">${data.customerName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email</span>
              <span class="value">${data.customerEmail}</span>
            </div>
            <div class="detail-row">
              <span class="label">Usluga</span>
              <span class="value">${data.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Datum</span>
              <span class="value">${data.date}</span>
            </div>
            <div class="detail-row">
              <span class="label">Vrijeme</span>
              <span class="value">${data.time}</span>
            </div>
            <div class="detail-row">
              <span class="label">Cijena</span>
              <span class="value">${data.price} KM</span>
            </div>
          </div>
          
          <p>Prijavite se u Admin Panel da potvrdite ili odbijete rezervaciju.</p>
          
          <div class="footer">
            <p>BookIt - Admin obavještenje</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: ownerEmail, subject, html });
}

export function isEmailConfigured(): boolean {
  return !!RESEND_API_KEY;
}
