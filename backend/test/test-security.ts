import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testSecurity() {
  console.log('\n=== TESTS SÉCURITÉ ANSSI ===\n');

  // 1. Mot de passe faible (< 12 chars, pas de majuscule, chiffre, symbole)
  console.log('--- Test 1 : Mot de passe faible → doit retourner 400 ---');
  const resWeakPwd = await fetch('http://localhost:3000/api/utilisateurs/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test.weak@vitalis.fr',
      password: 'abc123',
      nom: 'TestUser',
      prenom: 'Test',
      etablissementId: '73eb2de9-8819-4f47-83b4-ed04c453237e',
    }),
  });
  console.log(`Status: ${resWeakPwd.status} (attendu: 400)`);
  const dataWeak = await resWeakPwd.json();
  console.log('Réponse:', JSON.stringify(dataWeak.message));

  // 2. Test: mot de passe sans majuscule
  console.log('\n--- Test 2 : Sans majuscule → doit retourner 400 ---');
  const resNoUpper = await fetch('http://localhost:3000/api/utilisateurs/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test.noupper@vitalis.fr',
      password: 'password1234!',
      nom: 'Test',
      prenom: 'Test',
      etablissementId: '73eb2de9-8819-4f47-83b4-ed04c453237e',
    }),
  });
  console.log(`Status: ${resNoUpper.status} (attendu: 400)`);
  const dataNoUpper = await resNoUpper.json();
  console.log('Réponse:', JSON.stringify(dataNoUpper.message).substring(0, 100));

  // 3. Bruteforce: 5 tentatives avec mauvais mot de passe → verrouillage
  console.log('\n--- Test 3 : Anti-bruteforce (5 tentatives → verrouillage 403) ---');
  const testEmail = 'admin@vitalis-center.cd';
  for (let i = 1; i <= 6; i++) {
    const res = await fetch('http://localhost:3000/api/utilisateurs/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword9999!' }),
    });
    const data = await res.json();
    console.log(`  Tentative ${i}: HTTP ${res.status} → ${JSON.stringify(data.message).substring(0, 90)}`);
    if (res.status === 403) {
      console.log(`  ✅ Verrouillage déclenché à la tentative ${i}`);
      break;
    }
  }

  // 4. Test: Sans token → 401
  console.log('\n--- Test 4 : Accès sans JWT → doit retourner 401 ---');
  const resNoToken = await fetch('http://localhost:3000/api/apprenant/dashboard');
  console.log(`Status: ${resNoToken.status} (attendu: 401)`);

  // 5. Test: Swagger désactivé → 404
  console.log('\n--- Test 5 : Swagger désactivé en prod → doit retourner 404 ---');
  const resSwagger = await fetch('http://localhost:3000/api/docs');
  console.log(`Status: ${resSwagger.status} (attendu: 404)`);
}

testSecurity().catch(console.error);
