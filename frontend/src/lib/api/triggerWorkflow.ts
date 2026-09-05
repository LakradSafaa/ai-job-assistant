export async function triggerCvGeneration(jobId: string, profileId: string) {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("NEXT_PUBLIC_N8N_WEBHOOK_URL n'est pas définie dans le fichier .env");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      job_id: jobId,
      profile_id: profileId,
    }),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de l'exécution du workflow n8n");
  }

  return await response.json();
}