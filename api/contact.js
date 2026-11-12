const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_URL = "https://api.resend.com/emails";

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.replace(/[\r\n]+/g, " ").trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const website = typeof body.website === "string" ? body.website.trim() : "";

  if (website) {
    return res.status(400).json({ error: "Unable to accept this submission." });
  }

  if (
    !name ||
    name.length > 120 ||
    !EMAIL_PATTERN.test(email) ||
    email.length > 254 ||
    subject.length > 160 ||
    !message ||
    message.length > 5000
  ) {
    return res.status(400).json({ error: "Please check your contact details and message." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_TO_EMAIL && process.env.CONTACT_TO_EMAIL.trim();
  const sender = process.env.CONTACT_FROM_EMAIL && process.env.CONTACT_FROM_EMAIL.trim();

  if (!apiKey || !recipient || !sender) {
    console.error("Contact email service is missing required environment configuration.");
    return res.status(503).json({ error: "The contact service is not configured yet." });
  }

  try {
    const resendResponse = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: email,
        subject: subject ? `SellerMargin inquiry: ${subject}` : "New SellerMargin inquiry",
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || "(not provided)"}\n\n${message}`
      })
    });

    if (!resendResponse.ok) {
      console.error(`Resend rejected the contact email with status ${resendResponse.status}.`);
      return res.status(502).json({ error: "Email delivery failed. Please try again later." });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact email request failed:", error.message);
    return res.status(502).json({ error: "Email delivery failed. Please try again later." });
  }
};
