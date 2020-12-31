import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constancts';
import { EmailVars, MailModuleOptions } from './mail.interfaces';
import got from 'got';
import FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(@Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions) {
  }

  async sendEmail(subject: string, to: string, template: string, emailVars: EmailVars[]): Promise<boolean> {
    const form = new FormData();
    form.append('from', `Alex from Nuber Eats <mailgun@${this.options.domain}>`);
    // form.append('to', `alexeistrug@gmail.com`);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));

    try {
      await got.post(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString('base64')}`,
        },
        body: form,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'alexeistrug@gmail.com', 'verify-email', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
