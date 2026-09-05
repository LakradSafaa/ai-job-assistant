import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FranceTravailService {
  private readonly logger = new Logger(FranceTravailService.name);

  /**
   * URL OAuth France Travail
   */
  private readonly authUrl =
    'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire';

  /**
   * API Offres d'emploi v2
   */
  private readonly jobsUrl =
    'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search';

  /**
   * Cache pour le token OAuth
   */
  private cachedToken: string | null = null;
  private tokenExpiry: number | null = null;

  /**
   * Obtenir un token OAuth 2.0 avec mise en cache
   */
  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiry && now < this.tokenExpiry) {
      return this.cachedToken;
    }

    const clientId = process.env.FRANCE_TRAVAIL_CLIENT_ID;
    const clientSecret = process.env.FRANCE_TRAVAIL_CLIENT_SECRET;

    const scope =
      process.env.FRANCE_TRAVAIL_SCOPE ||
      'api_offresdemploiv2 o2dsoffre';

    if (!clientId || !clientSecret) {
      throw new HttpException(
        'Identifiants France Travail manquants dans le .env',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const params = new URLSearchParams();

    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId.trim());
    params.append('client_secret', clientSecret.trim());
    params.append('scope', scope.trim());

    try {
      const response = await axios.post(
        this.authUrl,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        },
      );

      const accessToken: string = response.data?.access_token;

      if (!accessToken) {
        throw new Error(
          'France Travail n’a retourné aucun access_token',
        );
      }

      this.cachedToken = accessToken;
      this.tokenExpiry = now + ((response.data?.expires_in || 1499) - 60) * 1000;

      this.logger.log('✅ Token France Travail obtenu avec succès');

      return accessToken;
    } catch (error: any) {
      const errorDetails =
        error.response?.data || error.message;

      this.logger.error(
        '❌ Erreur OAuth France Travail:',
        errorDetails,
      );

      throw new HttpException(
        `France Travail OAuth ${
          error.response?.status || 500
        }: ${
          typeof errorDetails === 'object'
            ? JSON.stringify(errorDetails)
            : errorDetails
        }`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Rechercher des offres d'emploi
   */
  async searchJobs(
    params: {
      motsCles?: string;
      commune?: string;
      range?: string;
    } = {},
  ) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        this.jobsUrl,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },

          params: {
            motsCles:
              params.motsCles || 'développeur',

            range:
              params.range || '0-9',

            ...(params.commune
              ? {
                  commune: params.commune,
                }
              : {}),
          },
        },
      );

      // Si France Travail renvoie un statut HTTP 204 (Aucun contenu)
      if (response.status === 204) {
        return {
          success: true,
          count: 0,
          jobs: [],
        };
      }

      const resultats =
        response.data?.resultats || [];

      return {
        success: true,
        count: resultats.length,
        jobs: resultats,
      };
    } catch (error: any) {
      // Gestion spécifique si HTTP 204 est capturé comme exception
      if (error.response?.status === 204) {
        return {
          success: true,
          count: 0,
          jobs: [],
        };
      }

      const errorDetails =
        error.response?.data || error.message;

      this.logger.error(
        '❌ Erreur API Offres France Travail:',
        errorDetails,
      );

      throw new HttpException(
        `France Travail Jobs API Error ${
          error.response?.status || 500
        }: ${
          typeof errorDetails === 'object'
            ? JSON.stringify(errorDetails)
            : errorDetails
        }`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}