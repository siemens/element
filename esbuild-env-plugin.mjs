import fs from 'fs';
import path from 'path';

// Check if running in CI environment
const isCI = !!process.env.CI;

// Simple function to parse .env file
function parseEnvFile(filePath) {
  try {
    const envContent = fs.readFileSync(filePath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('#')) return;

      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Remove surrounding quotes if present
        envVars[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    });

    return envVars;
  } catch (error) {
    console.warn(`Could not read .env file: ${error.message}`);
    return {};
  }
}

// Load environment variables from .env file (if not in CI and file exists)
const envPath = path.resolve('./.env');
const envVars = !isCI ? parseEnvFile(envPath) : {};

const envPlugin = {
  name: 'env-plugin',
  setup: build => {
    // Environment variables that should be available in the browser
    const requiredEnvVars = ['MAPTILER_KEY', 'MAPTILER_URL'];

    const defineEnv = {};

    for (const envVar of requiredEnvVars) {
      let value;

      if (isCI) {
        // In CI, get values from system environment variables (secrets)
        value = process.env[envVar];
        console.log(`CI mode: Loading ${envVar} from system environment`);
      } else {
        // In development, prefer .env file, fallback to system env
        value = envVars[envVar] || process.env[envVar];
        console.log(
          `Dev mode: Loading ${envVar} from ${envVars[envVar] ? '.env file' : 'system environment'}`
        );
      }

      if (value) {
        defineEnv[`process.env.${envVar}`] = JSON.stringify(value);
      } else {
        console.warn(`Warning: Environment variable ${envVar} is not set`);
      }
    }

    build.initialOptions.define = {
      ...build.initialOptions.define,
      ...defineEnv
    };
  }
};

export default envPlugin;
