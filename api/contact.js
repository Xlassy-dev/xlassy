const nodemailer = require("nodemailer");
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLANS = ["Free", "Professional", "Business"];

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
  const plan = typeof body.plan === "string" ? body.plan : "";

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
    message.length > 5000 ||
    (plan && !PLANS.includes(plan))
  ) {
    return res.status(400).json({ error: "Please check your contact details and message." });
  }

  const gmailUser = process.env.GMAIL_USER && process.env.GMAIL_USER.trim();
  const appPassword = process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_APP_PASSWORD.replace(/\s/g, "");

  if (!gmailUser || !appPassword) {
    console.error("Gmail contact service is missing required environment configuration.");
    return res.status(503).json({ error: "The contact service is not configured yet." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: appPassword }
  });
  const planLine = `Selected plan: ${plan || "Not specified"}`;

  try {
    await transporter.sendMail({
      from: { name: "SellerMargin", address: gmailUser },
      to: gmailUser,
      replyTo: email,
      subject: subject
        ? `SellerMargin inquiry${plan ? ` (${plan})` : ""}: ${subject}`
        : `New SellerMargin inquiry${plan ? ` (${plan})` : ""}`,
      text: `Name: ${name}\nEmail: ${email}\n${planLine}\nSubject: ${subject || "(not provided)"}\n\n${message}`
    });
  } catch (error) {
    console.error("Gmail could not deliver the contact notification:", error.message);
    return res.status(502).json({ error: "Email delivery failed. Please try again later." });
  }

  try {
    await transporter.sendMail({
      from: { name: "SellerMargin", address: gmailUser },
      to: email,
      replyTo: gmailUser,
      subject: "We received your SellerMargin message",
      text: `Hi ${name},\n\nThanks for contacting SellerMargin${plan ? ` about the ${plan} plan` : ""}. We received your message and will reply within one business day.\n\nThis is an automatic confirmation.`
    });
    return res.status(200).json({ ok: true, autoReplySent: true });
  } catch (error) {
    console.error("Contact notification was delivered, but the acknowledgement email failed:", error.message);
    return res.status(200).json({ ok: true, autoReplySent: false });
  }
};
