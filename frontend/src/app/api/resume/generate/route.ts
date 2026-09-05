import { NextRequest, NextResponse } from "next/server";

type GenerateAction = "cv" | "letter" | "both";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const profile_id = String(body?.profile_id || "").trim();
    const job_id = String(body?.job_id || "").trim();
    const action = body?.action as GenerateAction;

    if (!profile_id) {
      return NextResponse.json(
        {
          success: false,
          error: "profile_id est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (!job_id) {
      return NextResponse.json(
        {
          success: false,
          error: "job_id est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (!["cv", "letter", "both"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: "action doit Ãªtre cv, letter ou both.",
        },
        { status: 400 }
      );
    }

    const n8nUrl = process.env.N8N_GENERATE_CV_WEBHOOK_URL;

    if (!n8nUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "N8N_GENERATE_CV_WEBHOOK_URL n'est pas configurÃ©e dans .env.local.",
        },
        { status: 500 }
      );
    }

    console.log("=================================");
    console.log("ENVOI GENERATION VERS N8N");
    console.log({
      profile_id,
      job_id,
      action,
      webhook: n8nUrl,
    });
    console.log("=================================");

    let n8nResponse: Response;

    try {
      n8nResponse = await fetch(n8nUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile_id,
          job_id,
          action,
        }),
        cache: "no-store",
      });
    } catch (error) {
      console.error("Erreur connexion n8n:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Impossible de contacter n8n.",
          details:
            error instanceof Error
              ? error.message
              : String(error),
        },
        { status: 502 }
      );
    }

    const responseText = await n8nResponse.text();

    console.log("N8N STATUS:", n8nResponse.status);
    console.log("N8N RESPONSE:", responseText);

    let data: any = {};

    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = {
          message: responseText,
        };
      }
    }

    if (!n8nResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            data?.error ||
            data?.message ||
            `Erreur n8n HTTP ${n8nResponse.status}`,
          n8n_status: n8nResponse.status,
          n8n_data: data,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Erreur API gÃ©nÃ©ration:", error);

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
