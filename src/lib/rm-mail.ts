import { logger } from "@/lib/logger";

const RESEND_API_URL = "https://api.resend.com/emails";

type SendTransactionalEmailInput = {
  organizationSlug?: string;
  html: string;
  subject: string;
  text: string;
  to: string;
};

type RequestEmailInput = {
  advisorEmail: string;
  advisorName: string;
  organizationName: string;
  organizationSlug: string;
  recipientEmail: string;
  token: string;
};

type InvitationEmailInput = {
  advisorEmail: string;
  advisorName: string;
  invitedName?: string;
  organizationName: string;
  organizationSlug: string;
  recipientEmail: string;
};

type InvitationRegisteredEmailInput = {
  advisorEmail: string;
  advisorName: string;
  invitedEmail: string;
  invitedName: string;
  organizationName: string;
  organizationSlug: string;
};

type EmailButtonVariant = "primary" | "secondary";

type EmailButton = {
  href: string;
  label: string;
  variant: EmailButtonVariant;
};

type EmailDetailRow = {
  label: string;
  value: string;
};

type EmailShellInput = {
  contentHtml: string;
  footerHtml: string;
  introHtml: string;
  previewText: string;
  title: string;
};

const EMAIL_THEME = {
  bg: "#f3f4f8",
  card: "#ffffff",
  ink: "#111728",
  muted: "#697083",
  primary: "#6e33eb",
  primaryStrong: "#8148ff",
  shadow: "0 10px 24px rgba(17, 23, 40, 0.08)",
  stroke: "#d9dde7",
  surface: "#f7f8fb",
};

const EMAIL_FONT_SANS = '"Inter", "Segoe UI", Arial, sans-serif';
const EMAIL_FONT_DISPLAY = '"Bricolage Grotesque", "Inter", "Segoe UI", Arial, sans-serif';

function getBaseUrl(): string {
  const configuredUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

function getMailerConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.RM_FROM_EMAIL,
  };
}

function ensureMailerConfigured() {
  const { apiKey, from } = getMailerConfig();

  if (!apiKey || !from) {
    throw new Error(
      "RM-mail saknar konfiguration. Lägg till RESEND_API_KEY och RM_FROM_EMAIL i miljövariablerna.",
    );
  }

  return { apiKey, from };
}

function resolveRmFromAddress(baseFromAddress: string, organizationSlug?: string): string {
  const sanitizedSlug = organizationSlug
    ?.trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9-]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");

  if (!sanitizedSlug) {
    return baseFromAddress;
  }

  const match = /^(.*<)?([^<>@\s]+)@([^<>@\s]+)(>)?$/.exec(baseFromAddress.trim());

  if (!match) {
    return baseFromAddress;
  }

  const [, prefix = "", , domain, suffix = ""] = match;

  return `${prefix}${sanitizedSlug}@${domain}${suffix}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderEmailButton({ href, label, variant }: Readonly<EmailButton>) {
  const isPrimary = variant === "primary";
  const backgroundColor = isPrimary ? EMAIL_THEME.primary : EMAIL_THEME.card;
  const borderColor = isPrimary ? EMAIL_THEME.primary : EMAIL_THEME.stroke;
  const textColor = isPrimary ? "#ffffff" : EMAIL_THEME.ink;
  const buttonClassName = isPrimary
    ? "jobi-email-button jobi-email-button-primary"
    : "jobi-email-button jobi-email-button-secondary";
  const shadowStyle = isPrimary
    ? "box-shadow:0 10px 22px rgba(110,51,235,0.26);"
    : "";
  const backgroundImageStyle = isPrimary
    ? `background-image:linear-gradient(${backgroundColor},${backgroundColor});`
    : "";
  const textFillStyle = `color:${textColor} !important;-webkit-text-fill-color:${textColor} !important;mso-style-textfill-type:solid;mso-style-textfill-fill-color:${textColor};text-decoration:none !important;`;

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;">
      <tr>
        <td align="center" bgcolor="${backgroundColor}" style="border-radius:18px;border:1px solid ${borderColor};background-color:${backgroundColor};${backgroundImageStyle}${textFillStyle}${shadowStyle}">
          <a class="${buttonClassName}" href="${href}" style="display:inline-block;padding:13px 18px;background-color:${backgroundColor};${backgroundImageStyle}border-radius:18px;border:0;font-family:${EMAIL_FONT_SANS};font-size:14px;font-weight:700;line-height:1.2;text-align:center;${textFillStyle}${shadowStyle}">
            <span style="${textFillStyle}">${escapeHtml(label)}</span>
          </a>
        </td>
      </tr>
    </table>
  `;
}

function renderEmailButtons(buttons: ReadonlyArray<EmailButton>) {
  const buttonCells = buttons
    .map(
      (button) => `<td style="padding:0 12px 12px 0;vertical-align:top;">${renderEmailButton(button)}</td>`,
    )
    .join("");

  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;border:0px none;border-collapse:collapse;"><tr>${buttonCells}</tr></table>`;
}

function renderEmailSectionLabel(label: string) {
  return `<p style="margin:0 0 10px 0;font-family:${EMAIL_FONT_SANS};font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${EMAIL_THEME.muted};">${escapeHtml(label)}</p>`;
}

function renderEmailPanel(contentHtml: string) {
  return `<div class="jobi-email-panel" style="margin:0 0 20px 0;padding:20px;overflow:hidden;background:${EMAIL_THEME.surface};border:0px none;border-radius:22px;">${contentHtml}</div>`;
}

function renderEmailBulletList(items: ReadonlyArray<string>) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:0 0 10px 0;vertical-align:top;width:12px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:${EMAIL_THEME.primary};margin-top:8px;"></span>
          </td>
          <td style="padding:0 0 10px 12px;font-family:${EMAIL_FONT_SANS};font-size:14px;line-height:1.7;color:${EMAIL_THEME.muted};">${item}</td>
        </tr>
      `,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>`;
}

function renderEmailDetails(rows: ReadonlyArray<EmailDetailRow>) {
  const detailRows = rows
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:0 0 12px 0;vertical-align:top;width:38%;font-family:${EMAIL_FONT_SANS};font-size:13px;font-weight:600;color:${EMAIL_THEME.muted};">${escapeHtml(label)}</td>
          <td style="padding:0 0 12px 16px;vertical-align:top;font-family:${EMAIL_FONT_SANS};font-size:14px;line-height:1.6;color:${EMAIL_THEME.ink};">${escapeHtml(value)}</td>
        </tr>
      `,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;overflow:hidden;">${detailRows}</table>`;
}

function renderEmailShell({ contentHtml, footerHtml, introHtml, previewText, title }: Readonly<EmailShellInput>) {
  return `
    <style>
      :root {
        color-scheme: light only;
        supported-color-schemes: light only;
      }

      .jobi-email-body,
      .jobi-email-card,
      .jobi-email-panel,
      .jobi-email-button {
        color-scheme: light only !important;
        supported-color-schemes: light only !important;
      }

      .jobi-email-button,
      .jobi-email-button:link,
      .jobi-email-button:visited,
      .jobi-email-button:hover,
      .jobi-email-button:active {
        text-decoration: none !important;
      }

      .jobi-email-button-primary,
      .jobi-email-button-primary:link,
      .jobi-email-button-primary:visited,
      .jobi-email-button-primary:hover,
      .jobi-email-button-primary:active,
      .jobi-email-button-primary *,
      .jobi-email-button-primary span,
      .jobi-email-button-primary font,
      #MessageViewBody a.jobi-email-button-primary,
      #MessageViewBody a.jobi-email-button-primary *,
      a[x-apple-data-detectors].jobi-email-button-primary,
      a[x-apple-data-detectors].jobi-email-button-primary *,
      u + .jobi-email-body a.jobi-email-button-primary,
      u + .jobi-email-body a.jobi-email-button-primary * {
        background-color: ${EMAIL_THEME.primary} !important;
        background-image: linear-gradient(${EMAIL_THEME.primary}, ${EMAIL_THEME.primary}) !important;
        border-color: ${EMAIL_THEME.primary} !important;
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
        text-decoration: none !important;
      }

      .jobi-email-button-secondary,
      .jobi-email-button-secondary:link,
      .jobi-email-button-secondary:visited,
      .jobi-email-button-secondary:hover,
      .jobi-email-button-secondary:active,
      .jobi-email-button-secondary *,
      .jobi-email-button-secondary span,
      .jobi-email-button-secondary font,
      #MessageViewBody a.jobi-email-button-secondary,
      #MessageViewBody a.jobi-email-button-secondary *,
      a[x-apple-data-detectors].jobi-email-button-secondary,
      a[x-apple-data-detectors].jobi-email-button-secondary *,
      u + .jobi-email-body a.jobi-email-button-secondary,
      u + .jobi-email-body a.jobi-email-button-secondary * {
        background-color: ${EMAIL_THEME.card} !important;
        border-color: ${EMAIL_THEME.stroke} !important;
        color: ${EMAIL_THEME.ink} !important;
        -webkit-text-fill-color: ${EMAIL_THEME.ink} !important;
        text-decoration: none !important;
      }
    </style>
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(previewText)}</div>
    <div class="jobi-email-body" style="width:100%;overflow:hidden;max-width:100%;margin:0;padding:24px 12px;background:${EMAIL_THEME.bg};font-family:${EMAIL_FONT_SANS};color:${EMAIL_THEME.ink};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:0px none;overflow:hidden;border-collapse:collapse;">
        <tr>
          <td align="center" bgcolor="${EMAIL_THEME.bg}" style="background:${EMAIL_THEME.bg};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:0px none;overflow:hidden;max-width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:0 0 14px 0;font-family:Arial;font-size:32px;line-height:1;font-weight:bold;letter-spacing:-0.04em;">
                  <span style="display:inline-block;color:${EMAIL_THEME.ink};">Jobi<span style="color:${EMAIL_THEME.primary};">.sh</span></span>
                </td>
              </tr>
              <tr>
                <td class="jobi-email-card" bgcolor="${EMAIL_THEME.card}" style="background:${EMAIL_THEME.card};border:0px none;border-radius:28px;padding:32px;overflow:hidden;">
                  <h1 style="margin:0 0 16px 0;font-family:${EMAIL_FONT_DISPLAY};font-size:36px;line-height:1.04;font-weight:700;color:${EMAIL_THEME.ink};">${escapeHtml(title)}</h1>
                  <p style="margin:0 0 24px 0;font-family:${EMAIL_FONT_SANS};font-size:16px;line-height:1.7;color:${EMAIL_THEME.muted};">${introHtml}</p>
                  ${contentHtml}
                </td>
              </tr>
              <tr>
                <td style="padding:16px 6px 0 6px;overflow:hidden;font-family:${EMAIL_FONT_SANS};font-size:13px;line-height:1.7;color:${EMAIL_THEME.muted};">
                  ${footerHtml}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

async function sendTransactionalEmail(input: SendTransactionalEmailInput): Promise<void> {
  const { apiKey, from } = ensureMailerConfigured();
  const { html, organizationSlug, subject, text, to } = input;
  const resolvedFrom = resolveRmFromAddress(from, organizationSlug);

  const payload = {
    from: resolvedFrom,
    html,
    subject,
    text,
    to: [to],
  };

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    logger.error("Failed to send RM email", { details, subject, to });
    throw new Error("Det gick inte att skicka RM-mailet.");
  }
}

export async function sendRmConnectionRequestEmail({
  advisorEmail,
  advisorName,
  organizationName,
  organizationSlug,
  recipientEmail,
  token,
}: RequestEmailInput): Promise<void> {
  const baseUrl = getBaseUrl();
  const acceptUrl = `${baseUrl}/rm/request/${token}?decision=accept`;
  const declineUrl = `${baseUrl}/rm/request/${token}?decision=decline`;
  const safeAdvisorName = escapeHtml(advisorName);
  const safeOrganizationName = escapeHtml(organizationName);
  const safeRecipientEmail = escapeHtml(recipientEmail);

  const html = renderEmailShell({
    contentHtml: [
      renderEmailPanel(
        `${renderEmailSectionLabel("Så här fungerar det")}${renderEmailBulletList([
          "Svara direkt via knapparna nedan.",
          `Om du inte redan är inloggad får du först logga in med <span style="color:${EMAIL_THEME.ink};font-weight:600;">${safeRecipientEmail}</span>.`,
        ])}`,
      ),
      renderEmailButtons([
        { href: acceptUrl, label: "Acceptera", variant: "primary" },
        { href: declineUrl, label: "Avslå", variant: "secondary" },
      ]),
      renderEmailPanel(
        `${renderEmailSectionLabel("Avsändare")}${renderEmailDetails([
          { label: "Handledare", value: `${advisorName} (${advisorEmail})` },
          { label: "RM-företag", value: organizationName },
        ])}`,
      ),
    ].join(""),
    footerHtml: "Länkarna fortsätter att fungera tills förfrågan besvaras eller dras tillbaka.",
    introHtml: `${safeAdvisorName} på <span style="color:${EMAIL_THEME.ink};font-weight:600;">${safeOrganizationName}</span> vill koppla ditt Jobi.sh-konto till sin handledarpanel.`,
    previewText: `${advisorName} vill koppla ditt Jobi.sh-konto till sin handledarpanel.`,
    title: "Ny kopplingsförfrågan",
  });

  const text = `${advisorName} på ${organizationName} vill koppla ditt Jobi.sh-konto till sin handledarpanel. Acceptera: ${acceptUrl} Avslå: ${declineUrl}`;

  await sendTransactionalEmail({
    html,
    organizationSlug,
    subject: `${advisorName} vill koppla ditt Jobi.sh-konto`,
    text,
    to: recipientEmail,
  });
}

export async function sendRmInvitationEmail({
  advisorEmail,
  advisorName,
  invitedName,
  organizationName,
  organizationSlug,
  recipientEmail,
}: InvitationEmailInput): Promise<void> {
  const baseUrl = getBaseUrl();
  const normalizedInvitedName = invitedName?.trim() ?? "";
  const nextPath = normalizedInvitedName
    ? `/account/create-profile?name=${encodeURIComponent(normalizedInvitedName)}`
    : "/account/create-profile";
  const registerUrl = `${baseUrl}/auth?email=${encodeURIComponent(recipientEmail)}&next=${encodeURIComponent(nextPath)}`;
  const subject = `Du är inbjuden till Jobi.sh av ${advisorName}`;
  const safeAdvisorName = escapeHtml(advisorName);
  const safeInvitedName = escapeHtml(normalizedInvitedName);
  const safeOrganizationName = escapeHtml(organizationName);

  const html = renderEmailShell({
    contentHtml: [
      renderEmailPanel(
        `${renderEmailSectionLabel("Vad som händer sedan")}${renderEmailBulletList([
          "Registrera ditt konto via knappen nedan.",
          "När registreringen är klar får handledaren en notis och kan sedan skicka en kopplingsförfrågan till dig.",
        ])}`,
      ),
      renderEmailButtons([
        { href: registerUrl, label: "Registrera dig", variant: "primary" },
      ]),
      renderEmailPanel(
        `${renderEmailSectionLabel("Inbjudan gäller för")}${renderEmailDetails([
          ...(normalizedInvitedName ? [{ label: "Namn", value: normalizedInvitedName }] : []),
          { label: "E-post", value: recipientEmail },
          { label: "Handledare", value: `${advisorName} (${advisorEmail})` },
          { label: "Företag", value: organizationName },
        ])}`,
      ),
    ].join(""),
    footerHtml: "Har du redan ett Jobi.sh-konto med samma e-postadress kan handledaren i stället skicka en kopplingsförfrågan direkt.",
    introHtml: normalizedInvitedName
      ? `${safeAdvisorName} på <span style="color:${EMAIL_THEME.ink};font-weight:600;">${safeOrganizationName}</span> vill att <span style="color:${EMAIL_THEME.ink};font-weight:600;">${safeInvitedName}</span> registrerar ett Jobi.sh-konto.`
      : `${safeAdvisorName} på <span style="color:${EMAIL_THEME.ink};font-weight:600;">${safeOrganizationName}</span> vill att du registrerar ett Jobi.sh-konto.`,
    previewText: `${advisorName} har bjudit in dig till Jobi.sh.`,
    title: "Du är inbjuden till Jobi.sh",
  });

  const text = `${advisorName} på ${organizationName} har bjudit in dig till Jobi.sh. Registrera dig här: ${registerUrl}`;

  await sendTransactionalEmail({
    html,
    organizationSlug,
    subject,
    text,
    to: recipientEmail,
  });
}

export async function sendRmInvitationRegisteredEmail({
  advisorEmail,
  advisorName,
  invitedEmail,
  invitedName,
  organizationName,
  organizationSlug,
}: InvitationRegisteredEmailInput): Promise<void> {
  const baseUrl = getBaseUrl();
  const rmUrl = `${baseUrl}/rm`;
  const displayName = invitedName.trim() || invitedEmail;
  const safeDisplayName = escapeHtml(displayName);
  const safeOrganizationName = escapeHtml(organizationName);

  const html = renderEmailShell({
    contentHtml: [
      renderEmailPanel(
        `${renderEmailSectionLabel("Nästa steg")}<p style="margin:0;font-family:${EMAIL_FONT_SANS};font-size:14px;line-height:1.7;color:${EMAIL_THEME.muted};">Öppna RM-panelen och skicka en kopplingsförfrågan för att börja följa kandidatens aktivitet.</p>`,
      ),
      renderEmailButtons([
        { href: rmUrl, label: "Öppna RM-panelen", variant: "primary" },
      ]),
      renderEmailPanel(
        `${renderEmailSectionLabel("Registrering")}${renderEmailDetails([
          { label: "Användare", value: displayName },
          { label: "E-post", value: invitedEmail },
          { label: "RM-företag", value: organizationName },
        ])}`,
      ),
    ].join(""),
    footerHtml: `Det här mailet skickades till ${escapeHtml(advisorName)} (${escapeHtml(advisorEmail)}).`,
    introHtml: `<span style="color:${EMAIL_THEME.ink};font-weight:600;">${safeDisplayName}</span> har nu registrerat sig i Jobi.sh för <span style="color:${EMAIL_THEME.ink};font-weight:600;">${safeOrganizationName}</span>.`,
    previewText: `${displayName} har registrerat sig i Jobi.sh för ${organizationName}.`,
    title: "Din inbjudan är nu registrerad",
  });

  const text = `${displayName} har nu registrerat sig i Jobi.sh för ${organizationName}. Öppna RM-panelen och skicka en kopplingsförfrågan: ${rmUrl}`;

  await sendTransactionalEmail({
    html,
    organizationSlug,
    subject: `${displayName} har registrerat sig i Jobi.sh`,
    text,
    to: advisorEmail,
  });
}