const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const ADMIN_JWT = process.env.FOLAT_ADMIN_JWT;
const ADMIN_EMAIL = process.env.FOLAT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.FOLAT_ADMIN_PASSWORD;
const DRY_RUN = process.argv.includes("--dry-run");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_ANON_KEY/VITE_SUPABASE_ANON_KEY.");
  process.exit(1);
}

if (!ADMIN_JWT && !(ADMIN_EMAIL && ADMIN_PASSWORD) && !DRY_RUN) {
  console.error("Missing authentication for import. Set FOLAT_ADMIN_JWT or both FOLAT_ADMIN_EMAIL and FOLAT_ADMIN_PASSWORD.");
  process.exit(1);
}

async function resolveAdminJwt() {
  if (ADMIN_JWT) return ADMIN_JWT;

  const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  const authResult = await authResponse.json().catch(() => ({}));
  if (!authResponse.ok || !authResult?.access_token) {
    throw new Error(`Failed to authenticate admin user: ${JSON.stringify(authResult)}`);
  }

  return authResult.access_token;
}

const users = [
  // IJEBU IGBO BRANCH
  { branch: "Ijebu Igbo Branch", full_name: "Monshood idayat Tope", email: "monshood.idayat@folatinvestment.com", password: "Monshoodidayat2465" },
  { branch: "Ijebu Igbo Branch", full_name: "Shodeinde Afolake monsurat", email: "shodeinde.afolake@folatinvestment.com", password: "Shodeindeafolake2465" },
  { branch: "Ijebu Igbo Branch", full_name: "Adeleke Joseph", email: "adeleke.joseph@folatinvestment.com", password: "Adelekejoseph2465" },
  { branch: "Ijebu Igbo Branch", full_name: "falola ibroheem olamilekan", email: "falola.ibroheem@folatinvestment.com", password: "Falolaibroheem2465" },
  { branch: "Ijebu Igbo Branch", full_name: "Okanlanwon olamide", email: "okanlanwon.olamide@folatinvestment.com", password: "Okanlanwonolamide2465" },
  { branch: "Ijebu Igbo Branch", full_name: "obajide Victoria omoyemi", email: "obajide.victoria@folatinvestment.com", password: "Obajidevictoria2465" },
  { branch: "Ijebu Igbo Branch", full_name: "shofoluwe Mary Tamilade", email: "shofoluwe.mary@folatinvestment.com", password: "Shofoluwemary2465" },
  { branch: "Ijebu Igbo Branch", full_name: "Ojo Temiloluwa Agnes", email: "ojo.temiloluwa@folatinvestment.com", password: "Ojotemiloluwa2465" },

  // IJEBU ODE BRANCH
  { branch: "Ijebu Ode Branch", full_name: "Joseph Victor", email: "joseph.victor@folatinvestment.com", password: "Josephvictor2465" },
  { branch: "Ijebu Ode Branch", full_name: "Raji Oluwabusayo", email: "raji.oluwabusayo@folatinvestment.com", password: "Rajioluwabusayo2465" },
  { branch: "Ijebu Ode Branch", full_name: "Adenekan Abimbola", email: "adenekan.abimbola@folatinvestment.com", password: "Adenekanabimbola2465" },
  { branch: "Ijebu Ode Branch", full_name: "Daniel Opeyemi", email: "daniel.opeyemi@folatinvestment.com", password: "Danielopeyemi2465" },
  { branch: "Ijebu Ode Branch", full_name: "Olaniyan Titilayo", email: "olaniyan.titilayo@folatinvestment.com", password: "Olaniyantitilayo2465" },
  { branch: "Ijebu Ode Branch", full_name: "Akinnola Ayomide", email: "akinnolaayomide@folatinvestment.com", password: "Akinnolaayomide2465" },

  // SAGAMU BRANCH
  { branch: "Sagamu Branch", full_name: "Olalere Anuoluwapo Gideon", email: "olalereanuoluwapo@folatinvestment.com", password: "Olalereanuoluwapo2465" },
  { branch: "Sagamu Branch", full_name: "Abolaji Segun Gbenga", email: "abolaji.segun@folatinvestment.com", password: "Abolajisegun2465" },
  { branch: "Sagamu Branch", full_name: "Abidogun Oluwaremilekun", email: "abidogun.oluwaremilekun@folatinvestment.com", password: "Abidogunoluwaremilekun2465" },
  { branch: "Sagamu Branch", full_name: "Adeagbo Adam", email: "adeagbo.adam@folatinvestment.com", password: "Adeagboadam2465" },
  { branch: "Sagamu Branch", full_name: "Daramola Adedayo", email: "daramola.adedayo@folatinvestment.com", password: "Daramolaadedayo2465" },

  // ABEOKUTA 1
  { branch: "Abeokuta 1 Branch", full_name: "AYELABOLA IREMIDE ALICE", email: "ayelabola.iremide@folatinvestment.com", password: "Ayelabolairemide2465" },
  { branch: "Abeokuta 1 Branch", full_name: "OGHENEKEWE MADOGWE GIFT", email: "oghenekewe.madogwe@folatinvestment.com", password: "Oghenekewemadogwe2465" },
  { branch: "Abeokuta 1 Branch", full_name: "OGUNKANMI OMOLADE FLORENCE", email: "ogunkanmi.omolade@folatinvestment.com", password: "Ogunkanmiomolade2465" },

  // ABEOKUTA 2
  { branch: "Abeokuta 2 Branch", full_name: "Oyeyemi Esther", email: "oyeyemi.esther@folatinvestment.com", password: "Oyeyemiesther2465" },
  { branch: "Abeokuta 2 Branch", full_name: "Folasele Olubukola Precious", email: "folasele.olubukola@folatinvestment.com", password: "Folaseleolubukola2465" },
  { branch: "Abeokuta 2 Branch", full_name: "Folasele Tope", email: "folaseletope@folatinvestment.com", password: "Folaseletope2465" },
];

const validUsers = users.filter((user) => (user.password || "").trim().length >= 6);
const skippedUsers = users.filter((user) => (user.password || "").trim().length < 6);

console.log(`Prepared ${validUsers.length} users for import.`);
if (skippedUsers.length > 0) {
  console.log(`Skipped ${skippedUsers.length} users due to missing/short password:`);
  for (const skipped of skippedUsers) {
    console.log(`- ${skipped.full_name} <${skipped.email}>`);
  }
}

if (DRY_RUN) {
  console.log("Dry run only. No API call made.");
  process.exit(0);
}

const adminJwt = await resolveAdminJwt();

const response = await fetch(`${SUPABASE_URL}/functions/v1/create-staff-user`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${adminJwt}`,
  },
  body: JSON.stringify({
    role: "staff_member",
    create_staff_record: true,
    continue_on_error: true,
    users: validUsers,
  }),
});

const result = await response.json().catch(() => ({}));

if (!response.ok) {
  console.error("Import failed:", result);
  process.exit(1);
}

console.log("Import completed.");
console.log(JSON.stringify(result, null, 2));
