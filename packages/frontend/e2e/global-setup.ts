import { chromium, FullConfig } from '@playwright/test';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const STORAGE_STATE_PATH = 'e2e/.auth/user.json';
const SECRET_ID = 'askend-lab/llm-keys';

async function getTestCredentials(): Promise<{ username: string; password: string }> {
  const client = new SecretsManagerClient({ region: 'eu-west-1' });
  const command = new GetSecretValueCommand({ SecretId: SECRET_ID });
  const response = await client.send(command);
  
  if (!response.SecretString) {
    throw new Error('Secret not found or empty');
  }
  
  const secrets = JSON.parse(response.SecretString) as Record<string, string>;
  const username = secrets['COGNITO_TEST_USER'];
  const password = secrets['COGNITO_TEST_PASSWORD'];
  
  if (!username || !password) {
    throw new Error('COGNITO_TEST_USER or COGNITO_TEST_PASSWORD not found in secret');
  }
  
  return { username, password };
}

async function globalSetup(_config: FullConfig): Promise<void> {
  console.log('🔐 Setting up E2E authentication...');
  
  const { username, password } = await getTestCredentials();
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to tasks page which will redirect to Cognito login
  await page.goto('http://localhost:5180/tasks');
  
  // Wait for Cognito login page
  await page.waitForURL(/cognito/);
  await page.waitForLoadState('networkidle');
  
  // Fill credentials - use filter for visible elements
  await page.locator('input[name="username"]').filter({ visible: true }).fill(username);
  await page.locator('input[name="password"]').filter({ visible: true }).fill(password);
  
  // Submit login form
  await page.locator('input[name="signInSubmitButton"]').filter({ visible: true }).click();
  
  // Wait for redirect back to app and auth callback to complete
  await page.waitForURL(/localhost:5180/, { timeout: 30000 });
  
  // Wait for auth to fully complete (page should be loaded with content)
  await page.waitForLoadState('networkidle');
  
  // Navigate to tasks to ensure we're authenticated
  await page.goto('http://localhost:5180/tasks');
  await page.waitForSelector('h1', { timeout: 10000 });
  
  // Save authentication state (now includes localhost localStorage)
  await page.context().storageState({ path: STORAGE_STATE_PATH });
  
  await browser.close();
  
  console.log('✅ E2E authentication setup complete');
}

export default globalSetup;
