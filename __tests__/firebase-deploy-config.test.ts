import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const firebaseConfig = JSON.parse(readFileSync('firebase.json', 'utf8'));
const packageConfig = JSON.parse(readFileSync('package.json', 'utf8'));
const productionAppHostingConfig = readFileSync(
  'apphosting.production.yaml',
  'utf8'
);

describe('Firebase App Hosting deployments', () => {
  it('scopes each deploy script to its intended project and backend', () => {
    expect(packageConfig.scripts).toMatchObject({
      'deploy-dev':
        'firebase deploy --project development --only apphosting:homeoremedica-web-dev',
      'deploy-prod':
        'firebase deploy --project production --only apphosting:homeoremedica-web',
      'deploy-prod-preview':
        'firebase deploy --project production --only apphosting:homeoremedica-web-preview',
    });
  });

  it('declares every deployable backend', () => {
    expect(
      firebaseConfig.apphosting.map(
        ({ backendId }: { backendId: string }) => backendId
      )
    ).toEqual([
      'homeoremedica-web-dev',
      'homeoremedica-web',
      'homeoremedica-web-preview',
    ]);

    expect(
      firebaseConfig.apphosting.every(
        ({ alwaysDeployFromSource }: { alwaysDeployFromSource: boolean }) =>
          alwaysDeployFromSource
      )
    ).toBe(true);
  });

  it('configures production App Check in monitoring mode', () => {
    expect(productionAppHostingConfig).toContain(
      'variable: NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY'
    );
    expect(productionAppHostingConfig).toContain(
      'value: 6Lc6no4sAAAAANGYbD2ntZItbPksIGo7UD-YRS2J'
    );
    expect(productionAppHostingConfig).toContain(
      'variable: APP_CHECK_ENFORCEMENT_MODE'
    );
    expect(productionAppHostingConfig).toContain('value: monitor');
  });
});
