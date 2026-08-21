import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LlmService {
  private readonly ollamaUrl =
    'http://localhost:11434/api/generate';

  async generate(prompt: string): Promise<string> {
    const response = await axios.post(this.ollamaUrl, {
      model: 'llama3.2:3b',
      prompt,
      stream: false,
    });

    return response.data.response;
  }
}