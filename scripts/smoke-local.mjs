const baseUrl = process.env.STARTRACK_API_URL ?? 'http://127.0.0.1:8080';
const adminEmail = process.env.STARTRACK_BOOTSTRAP_ADMIN_EMAIL;
const adminPassword = process.env.STARTRACK_BOOTSTRAP_ADMIN_PASSWORD;
const browserOrigin = process.env.STARTRACK_BROWSER_ORIGIN;
const originHeaders = browserOrigin ? { Origin: browserOrigin } : {};

if (!adminEmail || !adminPassword) {
  throw new Error('Synthetic bootstrap credentials are missing from the local environment');
}

async function expectOk(response, label) {
  if (!response.ok) {
    throw new Error(`${label} failed with HTTP ${response.status}`);
  }
  return response;
}

const publicResponse = await expectOk(await fetch(`${baseUrl}/api/all`, { headers: originHeaders }), 'Public API');
const publicBody = await publicResponse.text();

const loginResponse = await expectOk(
  await fetch(`${baseUrl}/api/auth/signin`, {
    method: 'POST',
    headers: { ...originHeaders, 'content-type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  }),
  'Synthetic admin sign-in',
);
const loginBody = await loginResponse.json();
if (!loginBody.accessToken) {
  throw new Error('Synthetic admin sign-in returned no access token');
}

const authenticatedHeaders = {
  ...originHeaders,
  Authorization: `Bearer ${loginBody.accessToken}`,
  'content-type': 'application/json',
};

const userResponse = await expectOk(
  await fetch(`${baseUrl}/api/user/me`, { headers: authenticatedHeaders }),
  'Authenticated user lookup',
);
const userBody = await userResponse.json();
if (userBody.email !== adminEmail) {
  throw new Error('Authenticated user does not match the synthetic administrator');
}

const projectName = 'Synthetic Local Baseline';
let projectResponse = await expectOk(
  await fetch(`${baseUrl}/projectCreate/allData`, { headers: authenticatedHeaders }),
  'Project list',
);
let projects = await projectResponse.json();

if (!projects.some((project) => project.projectName === projectName)) {
  const project = {
    projectName,
    lastNamePI: 'Researcher',
    firstNamePI: 'Test',
    emailPI: 'researcher@startrack.test',
    departmentPI: 'Synthetic Data',
    crsidPI: 'test001',
    otherInforPI: 'Local verification only',
    groupMemberRows: [],
    ttoContractName: '',
    ttoContractEmail: '',
    ttoContractOtherInfo: '',
    subContractorsRows: [],
    ppiRows: [],
    funding: [],
    fundingOther: '',
    duration: '',
    grantNumber: '',
    value: '',
    fundingNIHR: '',
    fundingNIHROther: '',
    fundingUKRIMRC: '',
    fundingUKRIMRCOther: '',
    fundingWellcomeTrust: '',
    fundingWellcomeTrustOther: '',
    modality: [],
    modalityOther: '',
    areaOfExpertise: [],
    areaOfExpertiseOther: '',
    readiness: 'Baseline',
    projectBackground: 'Synthetic local smoke test',
    briefDescription: 'Synthetic local smoke test',
    outputRows: [],
    collaborationRows: [],
    externalAdvisorsRows: [],
    fundingRows: [],
    fundingOverviewRows: [],
    otrRows: [],
  };

  await expectOk(
    await fetch(`${baseUrl}/projectCreate/addToProjectCreate/${encodeURIComponent(adminEmail)}`, {
      method: 'POST',
      headers: authenticatedHeaders,
      body: JSON.stringify(project),
    }),
    'Synthetic project creation',
  );

  projectResponse = await expectOk(
    await fetch(`${baseUrl}/projectCreate/allData`, { headers: authenticatedHeaders }),
    'Project list after creation',
  );
  projects = await projectResponse.json();
}

if (!projects.some((project) => project.projectName === projectName)) {
  throw new Error('Synthetic project was not returned by the project list');
}

console.log(JSON.stringify({
  publicApi: publicBody === 'Public content goes here' ? 'pass' : 'unexpected-content',
  syntheticAdminSignIn: 'pass',
  authenticatedUser: 'pass',
  syntheticProject: 'pass',
  projectCount: projects.length,
}));
