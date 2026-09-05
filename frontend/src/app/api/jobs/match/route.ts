import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const N8N_TIMEOUT_MS = 110_000;

export async function POST(request: Request) {
  try {
    // ============================================================
    // 1. READ REQUEST
    // ============================================================

    let body: any = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // ============================================================
    // 2. SUPABASE SERVER CLIENT
    // ============================================================

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },

          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(
                ({ name, value, options }) => {
                  cookieStore.set(name, value, options);
                }
              );
            } catch {
              // Ignore cookie errors in route handler
            }
          },
        },
      }
    );

    // ============================================================
    // 3. AUTH USER
    // ============================================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.warn(
        "AUTH WARNING:",
        authError.message
      );
    }

    console.log(
      "AUTH USER:",
      user?.id || "NON CONNECTÉ"
    );

    // ============================================================
    // 4. PROFILE ID
    // ============================================================

    const requestedProfileId =
      typeof body?.profile_id === "string"
        ? body.profile_id.trim()
        : "";

    const profileId =
      requestedProfileId ||
      user?.id ||
      "";

    if (!profileId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "profile_id est obligatoire.",
        },
        { status: 400 }
      );
    }

    console.log(
      "PROFILE ID UTILISÉ:",
      profileId
    );

    // ============================================================
    // 5. GET PROFILE
    // ============================================================

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .maybeSingle();

    if (profileError) {
      console.error(
        "PROFILE ERROR:",
        profileError,
        JSON.stringify(
          profileError,
          null,
          2
        )
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de récupérer votre profil.",
          details:
            profileError.message,
        },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Profil introuvable.",
          profile_id: profileId,
        },
        { status: 404 }
      );
    }

    // ============================================================
    // 6. DOMAIN
    // ============================================================

    const domaine = String(
      profile.domaine ||
        profile.domain ||
        profile.job_domain ||
        profile.desired_domain ||
        ""
    ).trim();

    const sousDomaine = String(
      profile.sous_domaine ||
        profile.subdomain ||
        profile.desired_subdomain ||
        ""
    ).trim();

    console.log(
      "PROFILE DOMAINE:",
      domaine || "Non renseigné"
    );

    console.log(
      "PROFILE SOUS-DOMAINE:",
      sousDomaine || "Non renseigné"
    );

    // ============================================================
    // 7. N8N WEBHOOK
    // ============================================================

    const webhookUrl =
      process.env.N8N_JOB_MATCHING_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "N8N_JOB_MATCHING_WEBHOOK_URL n'est pas configurée dans .env.local",
        },
        { status: 500 }
      );
    }

    console.log(
      "N8N WEBHOOK:",
      webhookUrl
    );

    // ============================================================
    // 8. PAYLOAD FOR N8N
    // ============================================================

    const payload = {
      profile_id: profile.id,
      user_id: user?.id || null,
      domaine,
      sous_domaine: sousDomaine,
    };

    console.log(
      "N8N PAYLOAD:",
      payload
    );

    // ============================================================
    // 9. CALL N8N
    // ============================================================

    const controller =
      new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, N8N_TIMEOUT_MS);

    let n8nResponse: Response;

    try {
      n8nResponse = await fetch(
        webhookUrl,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),

          cache: "no-store",

          signal:
            controller.signal,
        }
      );
    } catch (error: any) {
      clearTimeout(timeout);

      if (
        error?.name ===
        "AbortError"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Le matching n8n prend trop de temps.",
            details:
              "n8n n'a pas répondu dans le délai de 110 secondes.",
            profile_id:
              profile.id,
          },
          { status: 504 }
        );
      }

      console.error(
        "N8N FETCH ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de contacter n8n.",
          details:
            error?.message ||
            "fetch failed",
        },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeout);
    }

    // ============================================================
    // 10. READ N8N RESPONSE
    // ============================================================

    const rawText =
      await n8nResponse.text();

    console.log(
      "N8N STATUS:",
      n8nResponse.status
    );

    if (!rawText.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "n8n a répondu avec une réponse vide.",
          profile_id:
            profile.id,
        },
        { status: 502 }
      );
    }

    // ============================================================
    // 11. PARSE JSON
    // ============================================================

    let data: any;

    try {
      data =
        JSON.parse(rawText);
    } catch {
      console.error(
        "N8N NON JSON:",
        rawText
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "n8n a retourné une réponse qui n'est pas du JSON.",
          details: rawText,
        },
        { status: 502 }
      );
    }

    // ============================================================
    // 12. N8N HTTP ERROR
    // ============================================================

    if (!n8nResponse.ok) {
      console.error(
        "N8N HTTP ERROR:",
        data
      );

      return NextResponse.json(
        {
          success: false,

          error:
            data?.error ||
            data?.message ||
            `n8n HTTP ${n8nResponse.status}`,

          details: data,

          profile_id:
            profile.id,
        },
        { status: 502 }
      );
    }

    // ============================================================
    // 13. EXTRACT JOBS
    // ============================================================

    let rawJobs: any[] = [];

    if (
      Array.isArray(
        data?.jobs
      )
    ) {
      rawJobs =
        data.jobs;
    } else if (
      Array.isArray(
        data?.matches
      )
    ) {
      rawJobs =
        data.matches;
    } else if (
      Array.isArray(data)
    ) {
      rawJobs =
        data;
    }

    // ============================================================
    // 14. NORMALIZE JOBS
    // ============================================================

    const normalizedJobs =
      rawJobs
        .map(
          (
            item: any,
            index: number
          ) => {
            /*
             * n8n peut retourner :
             *
             * {
             *   job: {...},
             *   score: 80
             * }
             *
             * OU :
             *
             * {
             *   id: "...",
             *   title: "...",
             *   score: 80
             * }
             */

            const job =
              item?.job &&
              typeof item.job ===
                "object"
                ? item.job
                : item;

            const score = Number(
              item?.score ??
                job?.match_score ??
                job?.classification_score ??
                0
            );

            return {
              ...job,

              id:
                job?.id ??
                item?.job_id ??
                `match-${index}`,

              job_id:
                item?.job_id ??
                job?.id ??
                null,

              profile_id:
                item?.profile_id ??
                profile.id,

              match_score:
                score,

              score:
                score,

              matched_skills:
                item?.matched_skills ??
                job?.matched_skills ??
                "[]",

              missing_skills:
                item?.missing_skills ??
                job?.missing_skills ??
                "[]",

              ai_summary:
                item?.ai_summary ??
                job?.ai_summary ??
                item?.summary ??
                job?.summary ??
                "",

              recommendation:
                item?.recommendation ??
                job?.recommendation ??
                "",

              domaine:
                job?.domaine ??
                domaine,

              sous_domaine:
                job?.sous_domaine ??
                sousDomaine,
            };
          }
        )
        .filter(
          (job: any) =>
            Number(
              job.match_score ??
                job.score ??
                0
            ) >= 60
        )
        .sort(
          (
            a: any,
            b: any
          ) =>
            Number(
              b.match_score ??
                b.score ??
                0
            ) -
            Number(
              a.match_score ??
                a.score ??
                0
            )
        );

    // ============================================================
    // 15. RESPONSE
    // ============================================================

    console.log(
      "TOTAL JOBS REÇUES:",
      data?.total_jobs_received ??
        0
    );

    console.log(
      "TOTAL JOBS MATCHING:",
      normalizedJobs.length
    );

    return NextResponse.json(
      {
        success:
          data?.success !== false,

        profile_id:
          data?.profile_id ??
          profile.id,

        domaine:
          data?.domaine ??
          domaine,

        sous_domaine:
          data?.sous_domaine ??
          sousDomaine,

        total_jobs_received:
          Number(
            data?.total_jobs_received ??
              1000
          ),

        total_jobs_matching:
          normalizedJobs.length,

        total_matches:
          normalizedJobs.length,

        minimum_score:
          Number(
            data?.minimum_score ??
              60
          ),

        candidate_skills:
          Array.isArray(
            data?.candidate_skills
          )
            ? data.candidate_skills
            : [],

        jobs:
          normalizedJobs,

        // Compatibility avec l'ancien frontend
        matches:
          normalizedJobs,

        message:
          data?.message ??
          `Matching terminé : ${normalizedJobs.length} offres correspondent à votre profil.`,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(
      "MATCH API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Erreur serveur.",

        details:
          error?.stack || null,
      },
      {
        status: 500,
      }
    );
  }
}