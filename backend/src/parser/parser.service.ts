import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class ParserService {
  async downloadPdf(fileUrl: string): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const filePath = path.join(tempDir, 'cv.pdf');

    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
    });

    fs.writeFileSync(filePath, response.data);

    return filePath;
  }

  async extractText(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);

    const parser = new PDFParse({
      data: buffer,
    });

    const result = await parser.getText();

    await parser.destroy();

    return result.text;
  }
}