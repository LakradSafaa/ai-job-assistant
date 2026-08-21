import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class JobsService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async getJobs() {
    const supabase =
      this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        id,
        created_at,
        company_id,
        title,
        description,
        location,
        contract_type,
        remote,
        salary_min,
        salary_max,
        currency,
        experience_level,
        skills,
        published_at
      `)
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      throw new Error(
        `Erreur récupération offres: ${error.message}`,
      );
    }

    return data ?? [];
  }
}