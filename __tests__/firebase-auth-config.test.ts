import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const firebaseConfig = JSON.parse(
  readFileSync('firebase.json', 'utf8')
);

describe('Firebase Authentication configuration', () => {
  it('enables email/password and Google sign-in for the deployed app', () => {
    expect(firebaseConfig.auth.providers).toMatchObject({
      emailPassword: true,
      googleSignIn: {
        oAuthBrandDisplayName: 'HomeoRemedica',
        supportEmail: 'rasagyavatsal1@gmail.com',
        authorizedRedirectUris: expect.arrayContaining([
          'https://homeoremedica-web-dev--homeoremedica-dev.us-central1.hosted.app',
        ]),
      },
    });
  });
});
