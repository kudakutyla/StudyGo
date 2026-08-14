const fs = require('fs');

async function requestJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let body = text;
  try { body = JSON.parse(text); } catch {}
  console.log('URL', url);
  console.log('STATUS', res.status);
  console.log('BODY', JSON.stringify(body, null, 2));
  return { res, body, text };
}

(async () => {
  const cookieJar = [];
  const setCookie = (value) => {
    if (!value) return;
    const parts = value.split(';')[0].split('=');
    cookieJar.push(parts[0] + '=' + parts[1]);
  };

  const loginRes = await requestJson('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ama@example.com', password: 'TestPass123!' }),
    credentials: 'include'
  });

  const rawSetCookie = loginRes.res.headers.get('set-cookie');
  if (rawSetCookie) setCookie(rawSetCookie);

  const dashboardRes = await requestJson('http://localhost:5000/api/dashboard/stats', {
    method: 'GET',
    headers: { Cookie: cookieJar.join('; ') },
    credentials: 'include'
  });

  const assignmentsRes = await requestJson('http://localhost:5000/api/assignments?page=1&limit=8', {
    method: 'GET',
    headers: { Cookie: cookieJar.join('; ') },
    credentials: 'include'
  });
})();
