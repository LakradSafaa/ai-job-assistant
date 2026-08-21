import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class HelloWorkService {
  private readonly baseUrl =
    'https://www.hellowork.com/fr-fr/emploi/recherche.html';

  async searchJobs(keyword?: string) {
    const searchKeyword = keyword?.trim() || 'informatique';

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          k: searchKeyword,
        },

        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0.0.0 Safari/537.36',

          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',

          'Accept-Language': 'fr-FR,fr;q=0.9',
        },

        timeout: 15000,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      const jobs: any[] = [];

      $('a').each((_, element) => {
        const link = $(element);

        const href = link.attr('href');
        const title = link.text().trim();

        if (!href || !title) {
          return;
        }

        if (
          href.includes('/fr-fr/emplois/') ||
          href.includes('/fr-fr/emploi/')
        ) {
          const url = href.startsWith('http')
            ? href
            : `https://www.hellowork.com${href}`;

          const alreadyExists = jobs.some(
            (job) => job.url === url,
          );

          if (!alreadyExists && title.length > 3) {
            jobs.push({
              title,

              description: null,

              location: null,

              contract_type: null,

              remote: null,

              salary_min: null,

              salary_max: null,

              currency: 'EUR',

              experience_level: null,

              skills: '',

              published_at: null,

              source: 'hellowork',

              external_id: url,

              url,

              keyword: searchKeyword,
            });
          }
        }
      });

      return {
        success: true,

        source: 'hellowork',

        keyword: searchKeyword,

        count: jobs.length,

        jobs,
      };
    } catch (error: any) {
      const details =
        error.response?.data ||
        error.message ||
        'Erreur inconnue';

      console.error(
        '❌ Erreur HelloWork:',
        details,
      );

      throw new HttpException(
        `HelloWork Error: ${
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