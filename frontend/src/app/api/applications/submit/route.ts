import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const applicationId = body?.application_id;
    const profileId = body?.profile_id ?? null;
    const jobId = body?.job_id ?? null;

    if (!applicationId) {
      return NextResponse.json(
        {
          success: false,
          error: "application_id est obligatoire.",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // N8N WEBHOOK
    // =========================================================

    const n8nWebhookUrl =
      process.env.N8N_SUBMISSIONS_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error(
        "❌ N8N_SUBMISSIONS_WEBHOOK_URL n'est pas configurée."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "N8N_SUBMISSIONS_WEBHOOK_URL n'est pas configurée dans .env.local.",
        },
        { status: 500 }
      );
    }

    console.log("🚀 Envoi candidature vers n8n");
    console.log("Application ID:", applicationId);
    console.log("Profile ID:", profileId);
    console.log("Job ID:", jobId);
    console.log("Webhook:", n8nWebhookUrl);

    // =========================================================
    // ENVOI À N8N
    // =========================================================

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        application_id: applicationId,
        profile_id: profileId,
        job_id: jobId,
      }),
      cache: "no-store",
    });

    const n8nText = await n8nResponse.text();

    let n8nData: any = null;

    try {
      n8nData = n8nText ? JSON.parse(n8nText) : null;
    } catch {
      n8nData = {
        raw: n8nText,
      };
    }

    console.log("📨 Réponse n8n:", {
      status: n8nResponse.status,
      data: n8nData,
    });

    if (!n8nResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            n8nData?.error ||
            n8nData?.message ||
            `n8n a retourné HTTP ${n8nResponse.status}`,
          application_id: applicationId,
          n8n: n8nData,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Demande de soumission envoyée à n8n.",
      application_id: applicationId,
      n8n: n8nData,
    });
  } catch (error) {
    console.error(
      "❌ Erreur /api/applications/submit:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}