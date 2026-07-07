const base = 'http://localhost:3000/api';

const loginRes = await fetch(`${base}/utilisateurs/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'apprenant@vitalis-center.fr', password: 'Vitalis2025!' }),
});
const login = await loginRes.json();
if (!loginRes.ok) {
  console.error('login failed', loginRes.status);
  process.exit(1);
}

const headers = { Authorization: `Bearer ${login.accessToken}` };
const [tentativesRes, formationsRes, devoirsRes] = await Promise.all([
  fetch(`${base}/quiz/mes/tentatives`, { headers }),
  fetch(`${base}/pedagogie/formations`, { headers }),
  fetch(`${base}/devoirs/mes/soumissions`, { headers }),
]);

console.log('tentatives status', tentativesRes.status);
console.log('formations status', formationsRes.status);
console.log('devoirs status', devoirsRes.status);

if (tentativesRes.ok) {
  const tentatives = await tentativesRes.json();
  console.log('tentatives count', tentatives.length);
}

if (devoirsRes.ok) {
  const soumissions = await devoirsRes.json();
  console.log('soumissions count', soumissions.length);
}

if (formationsRes.ok) {
  const formations = await formationsRes.json();
  if (formations[0]) {
    const full = await fetch(`${base}/pedagogie/formations/${formations[0].id}`, { headers }).then(r => r.json());
    const moduleId = full.modules?.[0]?.id;
    if (moduleId) {
      const quizRes = await fetch(`${base}/quiz/module/${moduleId}`, { headers });
      console.log('quiz/module status', quizRes.status);
      if (quizRes.ok) {
        const quiz = await quizRes.json();
        console.log('quiz count', quiz.length);
        if (quiz[0]) console.log('quiz titre', quiz[0].titre);
      }
    }
  }
}
