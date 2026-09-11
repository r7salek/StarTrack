const baseUrl = process.env.STARTRACK_API_URL ?? 'http://127.0.0.1:8080';
const adminEmail = process.env.STARTRACK_BOOTSTRAP_ADMIN_EMAIL;
const sharedSyntheticPassword = process.env.STARTRACK_BOOTSTRAP_ADMIN_PASSWORD;
const userEmail = 'ordinary-user@startrack.test';
const caseVariantEmail = 'ORDINARY-USER@startrack.test';

if (!adminEmail || !sharedSyntheticPassword) {
  throw new Error('Synthetic local credentials are missing');
}

async function expectStatus(response, expected, label) {
  if (response.status !== expected) {
    throw new Error(`${label} returned HTTP ${response.status}; expected ${expected}`);
  }
  return response;
}

async function signIn(email) {
  const response = await expectStatus(
    await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: sharedSyntheticPassword }),
    }),
    200,
    `Sign-in for ${email}`,
  );
  return response.json();
}

const adminLogin = await signIn(adminEmail);
const adminHeaders = {
  Authorization: `Bearer ${adminLogin.accessToken}`,
  'content-type': 'application/json',
};

const oauthResponse = await fetch(`${baseUrl}/oauth2/authorization/google`, {
  redirect: 'manual',
});
await expectStatus(oauthResponse, 401, 'Disabled OAuth authorization route');
if (oauthResponse.headers.has('location')) {
  throw new Error('Disabled OAuth authorization route attempted a redirect');
}

await expectStatus(
  await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Ordinary',
      lastName: 'User',
      email: userEmail,
      password: sharedSyntheticPassword,
      matchingPassword: sharedSyntheticPassword,
    }),
  }),
  200,
  'Synthetic ordinary-user registration',
);

const managedUsersResponse = await expectStatus(
  await fetch(`${baseUrl}/sybeUser/userData`, { headers: adminHeaders }),
  200,
  'Administrator user listing',
);
const managedUsers = await managedUsersResponse.json();
const ordinaryUser = managedUsers.find((user) => user.email === userEmail);
if (!ordinaryUser?.id) {
  throw new Error('Synthetic ordinary user was not returned to the administrator');
}

await expectStatus(
  await fetch(`${baseUrl}/sybeUser/activate/${encodeURIComponent(userEmail)}`, {
    method: 'PUT',
    headers: adminHeaders,
  }),
  200,
  'Administrator user activation',
);

const userLogin = await signIn(userEmail);
const userHeaders = {
  Authorization: `Bearer ${userLogin.accessToken}`,
  'content-type': 'application/json',
};

// The inherited database treats these as distinct addresses. Authorization
// must not collapse them, even though they differ only in letter case.
await expectStatus(await fetch(`${baseUrl}/api/auth/signup`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Case', lastName: 'Variant', email: caseVariantEmail,
    password: sharedSyntheticPassword, matchingPassword: sharedSyntheticPassword,
  }),
}), 200, 'Synthetic case-variant registration');
await expectStatus(await fetch(`${baseUrl}/sybeUser/deleteRequest/${encodeURIComponent(caseVariantEmail)}`, {
  method: 'PUT', headers: userHeaders,
}), 403, 'Case-variant cross-account deletion request');

const ownDeletion = await expectStatus(await fetch(`${baseUrl}/sybeUser/deleteRequest/${encodeURIComponent(userEmail)}`, {
  method: 'PUT', headers: userHeaders,
}), 200, 'Own deletion request');
const ownDeletionBody = await ownDeletion.json();
if (String(ownDeletionBody.id) !== String(ordinaryUser.id) || ownDeletionBody.delete !== true
    || Object.hasOwn(ownDeletionBody, 'password')) {
  throw new Error('Own deletion request returned the wrong account or unsafe response');
}

await expectStatus(
  await fetch(`${baseUrl}/sybeUser/all`, { headers: userHeaders }),
  403,
  'Ordinary-user administrator access',
);
await expectStatus(
  await fetch(`${baseUrl}/role/all`, { headers: userHeaders }),
  403,
  'Ordinary-user role access',
);
await expectStatus(
  await fetch(`${baseUrl}/sybeUser/${adminLogin.user.id}`, { headers: userHeaders }),
  403,
  'Cross-account profile access',
);
await expectStatus(
  await fetch(`${baseUrl}/sybeUser/passwordUpdate/${adminLogin.user.id}`, {
    method: 'POST',
    headers: userHeaders,
    body: JSON.stringify({ password: sharedSyntheticPassword }),
  }),
  403,
  'Cross-account password update',
);
await expectStatus(
  await fetch(`${baseUrl}/sybeUser/deleteRequest/${encodeURIComponent(adminEmail)}`, {
    method: 'PUT',
    headers: userHeaders,
  }),
  403,
  'Cross-account deletion request',
);

const adminUsersResponse = await expectStatus(
  await fetch(`${baseUrl}/sybeUser/all`, { headers: adminHeaders }),
  200,
  'Administrator account access',
);
const adminUsers = await adminUsersResponse.json();
const caseVariantUser = adminUsers.find((user) => user.email === caseVariantEmail);
if (!caseVariantUser || String(caseVariantUser.id) === String(ordinaryUser.id) || caseVariantUser.delete !== false) {
  throw new Error('The distinct case-variant account was not preserved');
}
if (JSON.stringify(adminUsers).includes('password')) {
  throw new Error('A user response exposed a password field');
}

await expectStatus(
  await fetch(`${baseUrl}/role/all`, { headers: adminHeaders }),
  200,
  'Administrator role access',
);
await expectStatus(
  await fetch(`${baseUrl}/sybeUser/activate/${encodeURIComponent(userEmail)}`, {
    headers: adminHeaders,
  }),
  405,
  'Legacy state-changing GET',
);
await expectStatus(
  await fetch(`${baseUrl}/sybeUser/resetPassword/${encodeURIComponent(userEmail)}`, {
    method: 'PUT',
    headers: adminHeaders,
  }),
  404,
  'Removed password reset route',
);

const allowedOrigin = process.env.STARTRACK_CORS_ALLOWED_ORIGINS ?? 'http://127.0.0.1:4200';
const allowedPreflight = await fetch(`${baseUrl}/sybeUser/all`, {
  method: 'OPTIONS',
  headers: {
    Origin: allowedOrigin,
    'Access-Control-Request-Method': 'GET',
  },
});
if (allowedPreflight.headers.get('access-control-allow-origin') !== allowedOrigin) {
  throw new Error('Configured CORS origin was not allowed');
}

const rejectedPreflight = await fetch(`${baseUrl}/sybeUser/all`, {
  method: 'OPTIONS',
  headers: {
    Origin: 'https://unapproved.example',
    'Access-Control-Request-Method': 'GET',
  },
});
if (rejectedPreflight.headers.has('access-control-allow-origin')) {
  throw new Error('Unapproved CORS origin received an allow-origin header');
}

console.log(JSON.stringify({
  oauthDisabled: 'pass',
  administratorAuthorization: 'pass',
  ordinaryUserIsolation: 'pass',
  caseSensitiveDeletionIsolation: 'pass',
  passwordSerialization: 'pass',
  removedLegacyRoutes: 'pass',
  corsAllowlist: 'pass',
}));
