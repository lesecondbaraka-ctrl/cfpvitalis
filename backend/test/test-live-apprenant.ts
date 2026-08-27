import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const jwt = new JwtService({ secret: process.env.JWT_SECRET || 'secretKey' });

const userApprenant = {
  id: '89f271ea-06d6-47be-a98a-305bacbbe8b4',
  email: 'lesecondbaraka@gmail.com',
  role: 'APPRENANT',
  etablissementId: '73eb2de9-8819-4f47-83b4-ed04c453237e',
};

const token = jwt.sign({
  sub: userApprenant.id,
  email: userApprenant.email,
  role: userApprenant.role,
  etablissementId: userApprenant.etablissementId,
});

console.log('JWT_TOKEN:', token);

async function testLiveEndpoints() {
  const headers = { Authorization: `Bearer ${token}` };

  console.log('\n--- 1. Testing /api/apprenant/dashboard ---');
  const t0 = performance.now();
  const resDash = await fetch('http://localhost:3000/api/apprenant/dashboard', { headers });
  const timeDash = Math.round(performance.now() - t0);
  const dataDash = await resDash.json();
  console.log(`Status: ${resDash.status} in ${timeDash}ms`);
  console.log('Dashboard Data:', JSON.stringify(dataDash, null, 2));

  console.log('\n--- 2. Testing /api/apprenant/formations ---');
  const t1 = performance.now();
  const resForms = await fetch('http://localhost:3000/api/apprenant/formations', { headers });
  const timeForms = Math.round(performance.now() - t1);
  const dataForms = await resForms.json();
  console.log(`Status: ${resForms.status} in ${timeForms}ms`);
  console.log(`Formations count: ${Array.isArray(dataForms) ? dataForms.length : 'N/A'}`);
  console.log('First formation:', dataForms[0]);

  if (Array.isArray(dataForms) && dataForms.length > 0) {
    const fId = dataForms[0].id;
    console.log(`\n--- 3. Testing /api/apprenant/formations/${fId}/modules ---`);
    const t2 = performance.now();
    const resMods = await fetch(`http://localhost:3000/api/apprenant/formations/${fId}/modules`, { headers });
    const timeMods = Math.round(performance.now() - t2);
    const dataMods = await resMods.json();
    console.log(`Status: ${resMods.status} in ${timeMods}ms`);
    console.log(`Modules count: ${dataMods.modules?.length ?? 0}`);
    console.log(`Progression globale: ${dataMods.formation?.progressionGlobale}%`);
  }

  console.log('\n--- 4. Testing /api/apprenant/certificats ---');
  const t3 = performance.now();
  const resCerts = await fetch('http://localhost:3000/api/apprenant/certificats', { headers });
  const timeCerts = Math.round(performance.now() - t3);
  const dataCerts = await resCerts.json();
  console.log(`Status: ${resCerts.status} in ${timeCerts}ms`);
  console.log(`Certificats count: ${Array.isArray(dataCerts) ? dataCerts.length : 0}`);
}

testLiveEndpoints().catch(console.error);
