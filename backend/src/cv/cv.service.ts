import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ParserService } from '../parser/parser.service';

@Injectable()
export class CvService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly parserService: ParserService,
  ) {}

  async findAll(profileId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('cv_files')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // ===== PDF PARSER + SAVE RESULT =====
    if (data && data.length > 0) {
      const cv = data[0];

      console.log('FILE URL =', cv.file_url);

      // Télécharger le PDF
      const filePath = await this.parserService.downloadPdf(
        cv.file_url,
      );

      // Extraire le texte
      const text = await this.parserService.extractText(filePath);

      console.log('========================');
      console.log('TEXTE DU CV');
      console.log('========================');
      console.log(text);
      console.log('========================');

      // Sauvegarder le texte dans Supabase
      const { error: updateError } = await supabase
        .from('cv_files')
        .update({
          extracted_text: text,
          parsed: true,
        })
        .eq('id', cv.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      console.log('✅ CV parsed and saved');
    } else {
      console.log(
        'Aucun CV trouvé pour le profileId:',
        profileId,
      );
    }

    return data;
  }
}