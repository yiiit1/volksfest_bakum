import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'

// Ab Next.js 16 liefert eslint-config-next echte Flat-Config-Exporte;
// der Umweg ueber FlatCompat/@eslint/eslintrc entfaellt.
//
// Geprueft wird das ganze Projekt (`npm run lint` = `eslint .`), nicht nur
// src/. Die Cloudflare Pages Functions unter functions/ sind Produktivcode,
// die Tests unter tests/ und die *.config.ts entscheiden mit, ob ein Build
// ueberhaupt durchlaeuft - ungeprueft gehoert davon nichts.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,
  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    '.wrangler/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Node-Skripte und Konfigurationsdateien laufen ausserhalb des Browsers.
    // Dort ist `console` kein Versehen, sondern die einzige Ausgabe.
    files: ['scripts/**/*.mjs', '*.config.{ts,mjs}', 'vitest.setup.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Pages Functions laufen im Worker, nicht im Browser: keine Next-Regeln
    // zu <Image>/<Link>, dafuer bewusstes Logging fuer Betriebsmeldungen.
    files: ['functions/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
])

export default eslintConfig
