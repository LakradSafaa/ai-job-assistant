import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // =========================================================
    // 1. Lire le body
    // =========================================================

    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Le body de la requête doit être un JSON valide.",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // 2. Récupérer les paramètres
    // =========================================================

    const profile_id =
      typeof body?.profile_id === "string"
        ? body.profile_id.trim()
        : "";

    const job_id =
      typeof body?.job_id === "string"
        ? body.job_id.trim()
        : "";

    const action =
      typeof body?.action === "string"
        ? body.action.trim().toLowerCase()
        : "both";

    // =========================================================
    // 3. Validation profile_id
    // =========================================================

    if (!profile_id) {
      return NextResponse.json(
        {
          success: false,
          error: "profile_id est obligatoire.",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // 4. Validation job_id
    // =========================================================

    if (!job_id) {
      return NextResponse.json(
        {
          success: false,
          error: "job_id est obligatoire.",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // 5. Validation action
    // =========================================================

    const allowedActions = ["cv", "letter", "both"];

    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: "action doit être cv, letter ou both.",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // 6. Vérifier la variable d'environnement n8n
    // =========================================================

    const webhookUrl =
      process.env.N8N_GENERATE_CV_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error(
        "N8N_GENERATE_CV_WEBHOOK_URL est absente."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "N8N_GENERATE_CV_WEBHOOK_URL n'est pas configurée dans .env.local.",
        },
        { status: 500 }
      );
    }

    // =========================================================
    // 7. Préparer la requête n8n
    // =========================================================

    const payload = {
      action,
      profile_id,
      job_id,
      requested_at: new Date().toISOString(),
    };

    console.log("➡️ Envoi vers n8n:", {
      action,
      profile_id,
      job_id,
    });

    // =========================================================
    // 8. Timeout
    // =========================================================

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 120000); // 2 minutes

    let n8nResponse: Response;

    try {
      n8nResponse = await fetch(webhookUrl, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify(payload),

        cache: "no-store",

        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);

      console.error(
        "Erreur connexion n8n:",
        error
      );

      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "La génération a dépassé le délai de 2 minutes. Vérifie le workflow n8n et Ollama.",
          },
          { status: 504 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de contacter n8n.",
          details:
            error instanceof Error
              ? error.message
              : "Erreur inconnue.",
        },
        { status: 502 }
      );
    }

    clearTimeout(timeout);

    // =========================================================
    // 9. Lire la réponse n8n
    // =========================================================

    const text = await n8nResponse.text();

    console.log(
      "⬅️ Réponse n8n:",
      {
        status: n8nResponse.status,
        hasBody: Boolean(text),
      }
    );

    // =========================================================
    // 10. Parser la réponse
    // =========================================================

    let data: any = {};

    if (text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          raw: text,
        };
      }
    }

    // =========================================================
    // 11. n8n retourne une erreur HTTP
    // =========================================================

    if (!n8nResponse.ok) {
      console.error(
        "n8n HTTP ERROR:",
        {
          status: n8nResponse.status,
          data,
        }
      );

      return NextResponse.json(
        {
          success: false,

          error:
            data?.error ||
            data?.message ||
            `n8n a retourné une erreur HTTP ${n8nResponse.status}.`,

          details: data,
        },
        { status: 502 }
      );
    }

    // =========================================================
    // 12. Réponse vide de n8n
    // =========================================================

    if (!text.trim()) {
      console.error(
        "n8n a répondu avec un body vide."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "n8n a répondu sans données. Vérifie le dernier nœud 'Respond to Webhook'.",
        },
        { status: 502 }
      );
    }

    // =========================================================
    // 13. n8n a retourné success:false
    // =========================================================

    if (data?.success === false) {
      return NextResponse.json(
        {
          success: false,
          error:
            data?.error ||
            "La génération a échoué dans n8n.",
          details: data,
        },
        { status: 502 }
      );
    }

    // =========================================================
    // 14. Réponse finale
    // =========================================================

    return NextResponse.json(
      {
        success: true,

        profile_id,

        job_id,

        action,

        ...data,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    // =========================================================
    // Erreur générale
    // =========================================================

    console.error(
      "RESUME_GENERATE_ERROR:",
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