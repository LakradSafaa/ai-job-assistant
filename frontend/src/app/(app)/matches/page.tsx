const loadMatches = useCallback(async () => {
  setError(null);
  setSuccess(null);

  try {
    /* ------------------------------------------------------
       PROFILE
    ------------------------------------------------------ */

    const currentProfileId = await getProfileId();

    setProfileId(currentProfileId);

    console.log("========================================");
    console.log("🚀 START MATCHING");
    console.log("PROFILE ID:", currentProfileId);
    console.log("========================================");

    /* ------------------------------------------------------
       CALL MATCHING API
    ------------------------------------------------------ */

    const response = await fetch("/api/jobs/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile_id: currentProfileId,
      }),
      cache: "no-store",
    });

    const raw = await response.text();

    console.log("📥 MATCH API STATUS:", response.status);
    console.log("📥 MATCH API RAW:", raw);

    let data: any = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error(
        "La réponse du matching n'est pas un JSON valide."
      );
    }

    console.log("📦 MATCH API DATA:", data);

    /* ------------------------------------------------------
       HTTP ERROR
    ------------------------------------------------------ */

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          data?.details ||
          `Erreur HTTP ${response.status}`
      );
    }

    /* ------------------------------------------------------
       API ERROR
    ------------------------------------------------------ */

    if (data?.success === false) {
      throw new Error(
        data?.error ||
          data?.message ||
          "Le matching a échoué."
      );
    }

    /* ------------------------------------------------------
       DEBUG RESPONSE
    ------------------------------------------------------ */

    console.log(
      "🔎 data.jobs:",
      data?.jobs
    );

    console.log(
      "🔎 data.jobs length:",
      Array.isArray(data?.jobs)
        ? data.jobs.length
        : "NOT ARRAY"
    );

    console.log(
      "🔎 data.matches:",
      data?.matches
    );

    console.log(
      "🔎 data.matches length:",
      Array.isArray(data?.matches)
        ? data.matches.length
        : "NOT ARRAY"
    );

    console.log(
      "🔎 total_jobs_received:",
      data?.total_jobs_received
    );

    console.log(
      "🔎 total_jobs_matching:",
      data?.total_jobs_matching
    );

    /* ------------------------------------------------------
       GET JOBS
    ------------------------------------------------------ */

    let returnedJobs: any[] = [];

    /*
      PRIORITY:
      1. data.jobs
      2. data.matches
      3. data directement comme array
    */

    if (Array.isArray(data?.jobs)) {
      returnedJobs = data.jobs;
    } else if (Array.isArray(data?.matches)) {
      returnedJobs = data.matches;
    } else if (Array.isArray(data)) {
      returnedJobs = data;
    }

    console.log(
      "✅ RETURNED JOBS BEFORE NORMALIZATION:",
      returnedJobs.length
    );

    /* ------------------------------------------------------
       NORMALIZE JOB STRUCTURE
    ------------------------------------------------------ */

    returnedJobs = returnedJobs.map(
      (item: any, index: number) => {
        /*
          Structure possible :

          {
            id,
            title,
            score
          }

          OU :

          {
            job: {
              id,
              title
            },
            score
          }
        */

        const nestedJob =
          item?.job &&
          typeof item.job === "object"
            ? item.job
            : null;

        const job =
          nestedJob || item;

        const score = Number(
          item?.score ??
            item?.match_score ??
            job?.score ??
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

          score,

          match_score: score,

          classification_score:
            job?.classification_score ??
            score,

          matched_skills:
            item?.matched_skills ??
            job?.matched_skills ??
            null,

          missing_skills:
            item?.missing_skills ??
            job?.missing_skills ??
            null,

          ai_summary:
            item?.ai_summary ??
            job?.ai_summary ??
            item?.summary ??
            job?.summary ??
            null,

          recommendation:
            item?.recommendation ??
            job?.recommendation ??
            null,

          domaine:
            job?.domaine ?? null,

          sous_domaine:
            job?.sous_domaine ?? null,
        };
      }
    );

    console.log(
      "✅ JOBS AFTER NORMALIZATION:",
      returnedJobs.length
    );

    /* ------------------------------------------------------
       VALIDATE
    ------------------------------------------------------ */

    const validJobs = returnedJobs.filter(
      (job: any) =>
        job &&
        job.id
    );

    console.log(
      "✅ VALID JOBS:",
      validJobs.length
    );

    /* ------------------------------------------------------
       DO NOT FILTER AGAIN
       
       IMPORTANT:
       n8n already applies minimum_score = 60.
       Therefore the frontend must NOT remove jobs.
    ------------------------------------------------------ */

    validJobs.sort(
      (a: any, b: any) => {
        const scoreA = Number(
          a.score ??
            a.match_score ??
            a.classification_score ??
            0
        );

        const scoreB = Number(
          b.score ??
            b.match_score ??
            b.classification_score ??
            0
        );

        return scoreB - scoreA;
      }
    );

    console.log(
      "🏆 TOP JOB:",
      validJobs[0]
    );

    console.log(
      "🏆 TOP SCORE:",
      validJobs.length > 0
        ? Number(
            validJobs[0].score ??
              validJobs[0].match_score ??
              0
          )
        : 0
    );

    /* ------------------------------------------------------
       COMPANIES
    ------------------------------------------------------ */

    const companyIds = [
      ...new Set(
        validJobs
          .map(
            (job: any) =>
              job.company_id
          )
          .filter(Boolean)
          .map(String)
      ),
    ];

    let companies: Company[] = [];

    if (companyIds.length > 0) {
      const {
        data: companyData,
        error: companyError,
      } = await supabase
        .from("companies")
        .select("id, name")
        .in("id", companyIds);

      if (companyError) {
        console.warn(
          "⚠️ Erreur chargement entreprises:",
          companyError.message
        );
      }

      companies =
        (companyData || []) as Company[];
    }

    /* ------------------------------------------------------
       MERGE
    ------------------------------------------------------ */

    const result: MatchItem[] =
      validJobs.map(
        (job: any) => {
          const company =
            job.company_id
              ? companies.find(
                  (item) =>
                    String(item.id) ===
                    String(
                      job.company_id
                    )
                ) || null
              : null;

          return {
            job: {
              ...job,

              score:
                job.score ??
                job.match_score ??
                0,

              match_score:
                job.match_score ??
                job.score ??
                0,
            } as Job,

            company,
          };
        }
      );

    console.log(
      "========================================"
    );

    console.log(
      "🎯 FINAL MATCHING RESULT"
    );

    console.log(
      "TOTAL:",
      result.length
    );

    console.log(
      "FIRST 5:",
      result.slice(0, 5)
    );

    console.log(
      "========================================"
    );

    /* ------------------------------------------------------
       SET RESULTS
    ------------------------------------------------------ */

    setMatches(result);

    /* ------------------------------------------------------
       EMPTY
    ------------------------------------------------------ */

    if (result.length === 0) {
      setSuccess(
        data?.total_jobs_matching === 0
          ? "Le matching est terminé, mais aucune offre n'atteint le seuil de compatibilité."
          : "Les offres ont été récupérées, mais aucune offre valide n'a pu être affichée."
      );
    } else {
      setSuccess(null);
    }

  } catch (err) {
    console.error(
      "❌ Erreur loadMatches:",
      err
    );

    setMatches([]);

    setError(
      err instanceof Error
        ? err.message
        : "Erreur lors du chargement des correspondances."
    );
  }
}, [
  getProfileId,
  supabase,
]);
