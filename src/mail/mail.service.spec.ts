import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from '../common/common.constancts';
import { MailService } from './mail.service';
import FormData from 'form-data';
import got from 'got';

const TEST_DOMAIN = 'test-domain';

jest.mock('got');
jest.mock('form-data');

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MailService, {
        provide: CONFIG_OPTIONS,
        useValue: {
          apiKey: 'test-apiKey',
          domain: 'test-domain',
          fromEmail: 'test-fromEmail',
        },
      }],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('it should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'code',
      };

      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {
        return true;
      });

      service.sendVerificationEmail(sendVerificationEmailArgs.email, sendVerificationEmailArgs.code);

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith('Verify Your Email', 'alexeistrug@gmail.com', 'verify-email', [
        { key: 'code', value: sendVerificationEmailArgs.code },
        { key: 'username', value: sendVerificationEmailArgs.email },
      ]);

    });
  });

  describe('sendEmail', () => {
    it('it should send email', async () => {
      const result = await service.sendEmail('', '', '', [{ key: 'one', value: '1' }]);

      const formSpy = jest.spyOn(FormData.prototype, 'append');

      expect(formSpy).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(`https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`, expect.any(Object));

      expect(result).toEqual(true);
    });

    it('it should fails on error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });

      const result = await service.sendEmail('', '', '', []);

      expect(result).toEqual(false);
    });
  });
});
