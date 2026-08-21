import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ApecService {
  private readonly apiUrl =
    'https://www.apec.fr/cms/webservices/rechercheOffre';

  async searchJobs(keyword?: string) {
    const searchKeyword = keyword?.trim() || 'informatique';

    try {
      const payload = {
        lieux: ['75'],
        fonctions: [],
        statutPoste: [],
        typesContrat: [],
        typesConvention: ['143684', '143685', '143686', '143687'],
        niveauxExperience: [],
        idsEtablissement: [],
        secteursActivite: [],
        typesTeletravail: [],
        idNomZonesDeplacement: [],
        positionNumbersExcluded: [],
        typeClient: 'CADRE',
        sorts: [
          {
            type: 'SCORE',
            direction: 'DESCENDING',
          },
        ],
        pagination: {
          range: 20,
          startIndex: 0,
        },
        activeFiltre: true,
        pointGeolocDeReference: {
          distance: 0,
        },
        motsCles: searchKeyword,
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Accept-Language': 'fr-FR,fr;q=0.9',
          Referer: 'https://www.apec.fr/',
          Origin: 'https://www.apec.fr',
        },
        timeout: 15000,
      });

      const data = response.data;

      const jobs = (data.resultats || []).map((job: any) => ({
        title: job.intitule || null,

        description: job.texteOffre || null,

        location: job.lieuTexte || null,

        contract_type: job.typeContrat
          ? String(job.typeContrat)
          : null,

        remote: job.idNomTeletravail
          ? String(job.idNomTeletravail)
          : null,

        salary_min: null,

        salary_max: null,

        currency: 'EUR',

        experience_level: null,

        skills: '',

        published_at: job.datePublication || null,

        source: 'apec',

        external_id: job.numeroOffre || String(job.id),

        url: job.numeroOffre
          ? `https://www.apec.fr/candidat/recherche-emploi.html/emploi/detail-offre/${job.numeroOffre}`
          : null,

        keyword: searchKeyword,
      }));

      return {
        success: true,
        source: 'apec',
        keyword: searchKeyword,
        count: jobs.length,
        totalCount: data.totalCount || 0,
        jobs,
      };
    } catch (error: any) {
      const details =
        error.response?.data ||
        error.message ||
        'Erreur inconnue';

      console.error('❌ Erreur APEC:', details);

      throw new HttpException(
        `APEC Error: ${
          typeof details === 'object'
            ? JSON.stringify(details)
            : details
        }`,
        error.response?.status ||
          HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}