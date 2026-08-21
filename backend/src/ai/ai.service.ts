import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class AiService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly llmService: LlmService,
  ) {}

  async analyzeCv(cvId: string) {
    const supabase = this.supabaseService.getClient();

    // Récupérer le CV
    const { data: cv, error } = await supabase
      .from('cv_files')
      .select('*')
      .eq('id', cvId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!cv.extracted_text) {
      throw new Error('CV not parsed yet');
    }

    const prompt = `
Tu es un expert RH.

Analyse ce CV.

IMPORTANT :

Réponds UNIQUEMENT avec un objet JSON valide.

Ne réponds jamais avec :

"Voici le JSON"

"Analyse"

"Explication"

N'utilise jamais les balises markdown.

Le JSON doit commencer par {

et finir par }

Format attendu :

{
  "candidate":{
    "name":"",
    "email":"",
    "location":""
  },
  "summary":"",
  "skills":[],
  "experience":[],
  "education":[],
  "languages":[],
  "strengths":[],
  "weaknesses":[],
  "score":0,
  "salary_estimation":"",
  "recommended_jobs":[],
  "recommendations":[]
}

CV :

${cv.extracted_text}
`;

    const response = await this.llmService.generate(prompt);

    console.log('\n================ RAW LLM RESPONSE ================\n');
    console.log(response);
    console.log('\n==================================================\n');

    // Extraction automatique du JSON
    const start = response.indexOf('{');
    const end = response.lastIndexOf('}');

    if (start === -1 || end === -1) {
      throw new Error('JSON introuvable dans la réponse du modèle.');
    }

    const jsonString = response.substring(start, end + 1);

    let analysis: any;

    try {
      analysis = JSON.parse(jsonString);
    } catch (err) {
      console.error(jsonString);
      throw new Error('JSON invalide.');
    }

    // Supprimer une ancienne analyse si elle existe
    await supabase
      .from('cv_analysis')
      .delete()
      .eq('cv_id', cvId);

    // Sauvegarder la nouvelle analyse
    const { error: insertError } = await supabase
      .from('cv_analysis')
      .insert({
        cv_id: cvId,
        personal_info: analysis.candidate,
        profile: {
          summary: analysis.summary,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          salary_estimation: analysis.salary_estimation,
          recommended_jobs: analysis.recommended_jobs,
        },
        skills: analysis.skills,
        experience: analysis.experience,
        education: analysis.education,
        languages: analysis.languages,
        score: analysis.score,
        recommendations: analysis.recommendations,
      });

    if (insertError) {
      throw insertError;
    }

    return {
      success: true,
      cvId,
      analysis,
    };
  }

  async getReport(cvId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('cv_analysis')
      .select('*')
      .eq('cv_id', cvId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      report: data,
    };
  }
}