import nodemailer from "nodemailer";

interface ContributorCredentialEmailInput {
  to: string;
  name: string;
  userCode: string;
  password: string;
  profileType: "internship" | "job";
}

interface EmailSendResult {
  sent: boolean;
  reason?: string;
}

const getTransportConfig = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure = String(process.env.SMTP_SECURE ?? "false").toLowerCase() === "true";

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  };
};

export const sendContributorCredentialsEmail = async (
  input: ContributorCredentialEmailInput
): Promise<EmailSendResult> => {
  const transportConfig = getTransportConfig();
  if (!transportConfig) {
    return {
      sent: false,
      reason: "SMTP is not configured"
    };
  }

  const from = process.env.SMTP_FROM ?? '"HamroBichar" <info@hamrobichar.com>';
  if (!from) {
    return {
      sent: false,
      reason: "SMTP_FROM is not configured"
    };
  }

  const portalLabel = input.profileType === "internship" ? "Internship" : "Job Offering";

  const transporter = nodemailer.createTransport(transportConfig);

  try {
    await transporter.sendMail({
      from,
      to: input.to,
      subject: "Congratulations and welcome to HamroBichar",
      text: [
        `Hello ${input.name},`,
        "",
        `Congratulations on being added as a ${portalLabel} contributor at HamroBichar.`,
        "We are glad to have you on board and wish you success in your new role.",
        "",
        "Your contributor account has been created with the following login details:",
        "Use the following credentials to sign in:",
        `Email: ${input.to}`,
        `User_ID: ${input.userCode}`,
        `Password: ${input.password}`,
        "",
        "Please change your password after first login.",
        "",
        "Warm regards,",
        "HamroBichar Team",
        ""
      ].join("\n")
    });

    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email delivery failed";
    return {
      sent: false,
      reason: message
    };
  }
};