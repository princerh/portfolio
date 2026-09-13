const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "Method not allowed.",
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const RESEND_API_KEY =
      Deno.env.get("RESEND_API_KEY");

    const CONTACT_TO_EMAIL =
      Deno.env.get("CONTACT_TO_EMAIL");

    if (!RESEND_API_KEY) {
      throw new Error(
        "RESEND_API_KEY is not configured."
      );
    }

    if (!CONTACT_TO_EMAIL) {
      throw new Error(
        "CONTACT_TO_EMAIL is not configured."
      );
    }

    const {
      name,
      email,
      subject,
      message,
    } = await req.json();

    const cleanName =
      String(name || "").trim();

    const cleanEmail =
      String(email || "").trim();

    const cleanSubject =
      String(subject || "").trim();

    const cleanMessage =
      String(message || "").trim();

    if (
      cleanName.length < 2 ||
      cleanName.length > 100
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid name.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(cleanEmail) ||
      cleanEmail.length > 254
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid email address.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (
      cleanSubject.length > 200
    ) {
      return new Response(
        JSON.stringify({
          error: "Subject is too long.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (
      cleanMessage.length < 10 ||
      cleanMessage.length > 5000
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid message.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const safeName =
      escapeHtml(cleanName);

    const safeEmail =
      escapeHtml(cleanEmail);

    const safeSubject =
      escapeHtml(
        cleanSubject ||
          "Portfolio contact message"
      );

    const safeMessage =
      escapeHtml(cleanMessage).replace(
        /\n/g,
        "<br />"
      );

    const resendResponse =
      await fetch(
        "https://api.resend.com/emails",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${RESEND_API_KEY}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            from:
              "Portfolio Contact <onboarding@resend.dev>",

            to: [
              CONTACT_TO_EMAIL,
            ],

            reply_to:
              cleanEmail,

            subject:
              `Portfolio Message: ${
                cleanSubject ||
                cleanName
              }`,

            html: `
              <div
                style="
                  font-family:
                    Arial,
                    Helvetica,
                    sans-serif;
                  max-width: 640px;
                  margin: 0 auto;
                  color: #111827;
                "
              >
                <h2
                  style="
                    margin-bottom: 24px;
                    color: #111827;
                  "
                >
                  New Portfolio Message
                </h2>

                <div
                  style="
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                  "
                >
                  <p>
                    <strong>Name:</strong>
                    ${safeName}
                  </p>

                  <p>
                    <strong>Email:</strong>
                    ${safeEmail}
                  </p>

                  <p>
                    <strong>Subject:</strong>
                    ${safeSubject}
                  </p>
                </div>

                <div
                  style="
                    margin-top: 20px;
                    padding: 20px;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                  "
                >
                  <p
                    style="
                      margin-top: 0;
                      font-weight: 600;
                    "
                  >
                    Message
                  </p>

                  <p
                    style="
                      line-height: 1.7;
                      margin-bottom: 0;
                    "
                  >
                    ${safeMessage}
                  </p>
                </div>

                <p
                  style="
                    margin-top: 20px;
                    color: #64748b;
                    font-size: 13px;
                  "
                >
                  Sent from your portfolio contact form.
                </p>
              </div>
            `,
          }),
        }
      );

    const resendData =
      await resendResponse.json();

    if (!resendResponse.ok) {
      console.error(
        "Resend error:",
        resendData
      );

      return new Response(
        JSON.stringify({
          error:
            "Unable to send email notification.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailId:
          resendData?.id || null,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Contact email function error:",
      error
    );

    return new Response(
      JSON.stringify({
        error:
          "Internal server error.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function escapeHtml(
  value: string
) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}