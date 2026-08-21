import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request
) {
  try {
    /*
     * ==========================================
     * 1. RÉCUPÉRER LA REQUÊTE
     * ==========================================
     */

    const body = await request.json();

    const jobMatchId =
      body?.job_match_id;

    if (
      jobMatchId === undefined ||
      jobMatchId === null ||
      jobMatchId === ""
    ) {
      return NextResponse.json(
        {
          error:
            "Le champ job_match_id est requis.",
        },
        { status: 400 }
      );
    }

    /*
     * ==========================================
     * 2. SUPABASE SERVER
     * ==========================================
     */

    const supabase =
      await createClient();

    /*
     * ==========================================
     * 3. UTILISATEUR CONNECTÉ
     * ==========================================
     */

    const {
      data: { user },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Erreur auth Supabase :",
        userError
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Utilisateur non authentifié.",
        },
        { status: 401 }
      );
    }

    /*
     * ==========================================
     * 4. VÉRIFIER QUE LE MATCH APPARTIENT
     *    À L'UTILISATEUR
     * ==========================================
     */

    const {
      data: match,
      error: matchError,
    } = await supabase
      .from("job_matches")
      .select(
        `
          id,
          job_id,
          profile_id,
          score
        `
      )
      .eq("id", Number(jobMatchId))
      .eq("profile_id", user.id)
      .maybeSingle();

    if (matchError) {
      console.error(
        "Erreur vérification job_match :",
        matchError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de vérifier la correspondance.",
          details:
            matchError.message,
        },
        { status: 500 }
      );
    }

    if (!match) {
      return NextResponse.json(
        {
          error:
            "Cette correspondance n'appartient pas à votre profil.",
        },
        { status: 403 }
      );
    }

    /*
     * ==========================================
     * 5. URL N8N
     * ==========================================
     */

    const n8nWebhookUrl =
      process.env
        .N8N_PREPARE_APP_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      return NextResponse.json(
        {
          error:
            "N8N_PREPARE_APP_WEBHOOK_URL n'est pas configuré dans .env.local",
        },
        { status: 500 }
      );
    }

    /*
     * ==========================================
     * 6. APPEL N8N
     * ==========================================
     */

    const n8nResponse = await fetch(
      n8nWebhookUrl,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          job_match_id: match.id,
          job_id: match.job_id,
          user_id: user.id,
          profile_id: match.profile_id,
          score: match.score,
        }),

        cache: "no-store",
      }
    );

    const n8nText =
      await n8nResponse.text();

    if (!n8nResponse.ok) {
      console.error(
        "Erreur n8n :",
        n8nResponse.status,
        n8nText
      );

      return NextResponse.json(
        {
          error:
            "Le workflow n8n n'a pas pu être lancé.",
          status:
            n8nResponse.status,
          details: n8nText,
        },
        { status: 502 }
      );
    }

    /*
     * ==========================================
     * 7. SUCCÈS
     * ==========================================
     */

    return NextResponse.json({
      success: true,
      message:
        "Préparation de candidature lancée.",
      job_match_id: match.id,
      job_id: match.job_id,
      user_id: user.id,
      n8n_response: n8nText,
    });
  } catch (error: unknown) {
    console.error(
      "Erreur API prepare application :",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}