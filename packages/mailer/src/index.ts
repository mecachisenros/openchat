import mjml2html from "mjml";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailer = transporter;

const pincodeTemplate = `
<mjml>
  <mj-body>
    <mj-section background-color="#24283b">
      <mj-column>

        <mj-image width="100px" src="https://openchat.mondoc.dev/openchat.svg"></mj-image>

        <mj-divider border-color="#b4f9f8"></mj-divider>
        <mj-text font-size="24px" align="center" color="#b4f9f8" font-family="helvetica">[[pin_code]]</mj-text>

        <mj-text font-size="14px" align="center" color="#b4f9f8" font-family="helvetica">Your OpenChat pin code</mj-text>

      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

function replaceTemplateTokens(
  template: string,
  tokens: { [key: string]: string },
) {
  Object.entries(tokens).map(([attr, value]) => {
    template = template.replaceAll(`[[${attr}]]`, value);
  });

  return mjml2html(template).html;
}

export async function sendEmail(email: string, code: string) {
  const html = replaceTemplateTokens(pincodeTemplate, { pin_code: code });

  await mailer
    .sendMail({
      from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OpenChat pin code",
      html,
    })
    .catch(console.error);
}
