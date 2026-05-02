-- ══════════════════════════════════════════════════════════
--  FOLAT — Bulk Staff User Import
--  Paste this entire file into Supabase SQL Editor and run.
--  Safe to re-run: skips existing emails, skips existing
--  staff records, upserts profiles.
-- ══════════════════════════════════════════════════════════

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH import_data AS (
  SELECT branch_name, full_name, email, password
  FROM (VALUES
    ('Ijebu Igbo Branch','Monshood idayat Tope',         'monshood.idayat@folatinvestment.com',        'Monshoodidayat2465'),
    ('Ijebu Igbo Branch','Shodeinde Afolake monsurat',   'shodeinde.afolake@folatinvestment.com',      'Shodeindeafolake2465'),
    ('Ijebu Igbo Branch','Adeleke Joseph',               'adeleke.joseph@folatinvestment.com',         'Adelekejoseph2465'),
    ('Ijebu Igbo Branch','falola ibroheem olamilekan',   'falola.ibroheem@folatinvestment.com',        'Falolaibroheem2465'),
    ('Ijebu Igbo Branch','Okanlanwon olamide',           'okanlanwon.olamide@folatinvestment.com',     'Okanlanwonolamide2465'),
    ('Ijebu Igbo Branch','obajide Victoria omoyemi',     'obajide.victoria@folatinvestment.com',       'Obajidevictoria2465'),
    ('Ijebu Igbo Branch','shofoluwe Mary Tamilade',      'shofoluwe.mary@folatinvestment.com',         'Shofoluwemary2465'),
    ('Ijebu Igbo Branch','Ojo Temiloluwa Agnes',         'ojo.temiloluwa@folatinvestment.com',         'Ojotemiloluwa2465'),

    ('Ijebu Ode Branch', 'Joseph Victor',                'joseph.victor@folatinvestment.com',          'Josephvictor2465'),
    ('Ijebu Ode Branch', 'Raji Oluwabusayo',             'raji.oluwabusayo@folatinvestment.com',       'Rajioluwabusayo2465'),
    ('Ijebu Ode Branch', 'Adenekan Abimbola',            'adenekan.abimbola@folatinvestment.com',      'Adenekanabimbola2465'),
    ('Ijebu Ode Branch', 'Daniel Opeyemi',               'daniel.opeyemi@folatinvestment.com',         'Danielopeyemi2465'),
    ('Ijebu Ode Branch', 'Olaniyan Titilayo',            'olaniyan.titilayo@folatinvestment.com',      'Olaniyantitilayo2465'),
    ('Ijebu Ode Branch', 'Akinnola Ayomide',             'akinnolaayomide@folatinvestment.com',        'Akinnolaayomide2465'),

    ('Sagamu Branch',    'Olalere Anuoluwapo Gideon',    'olalereanuoluwapo@folatinvestment.com',      'Olalereanuoluwapo2465'),
    ('Sagamu Branch',    'Abolaji Segun Gbenga',         'abolaji.segun@folatinvestment.com',          'Abolajisegun2465'),
    ('Sagamu Branch',    'Abidogun Oluwaremilekun',      'abidogun.oluwaremilekun@folatinvestment.com','Abidogunoluwaremilekun2465'),
    ('Sagamu Branch',    'Adeagbo Adam',                 'adeagbo.adam@folatinvestment.com',           'Adeagboadam2465'),
    ('Sagamu Branch',    'Daramola Adedayo',             'daramola.adedayo@folatinvestment.com',       'Daramolaadedayo2465'),

    ('Abeokuta 1 Branch','AYELABOLA IREMIDE ALICE',      'ayelabola.iremide@folatinvestment.com',      'Ayelabolairemide2465'),
    ('Abeokuta 1 Branch','OGHENEKEWE MADOGWE GIFT',      'oghenekewe.madogwe@folatinvestment.com',     'Oghenekewemadogwe2465'),
    ('Abeokuta 1 Branch','OGUNKANMI OMOLADE FLORENCE',   'ogunkanmi.omolade@folatinvestment.com',      'Ogunkanmiomolade2465'),

    ('Abeokuta 2 Branch','Oyeyemi Esther',               'oyeyemi.esther@folatinvestment.com',         'Oyeyemiesther2465'),
    ('Abeokuta 2 Branch','Folasele Olubukola Precious',  'folasele.olubukola@folatinvestment.com',     'Folaseleolubukola2465'),
    ('Abeokuta 2 Branch','Folasele Tope',                'folaseletope@folatinvestment.com',           'Folaseletope2465')
  ) AS t(branch_name, full_name, email, password)
),

-- ── 1. Normalise input ──────────────────────────────────
normalized AS (
  SELECT
    trim(branch_name)    AS branch_name,
    trim(full_name)      AS full_name,
    lower(trim(email))   AS email,
    password
  FROM import_data
),

-- ── 2. Create auth.users for emails that do not exist ──
inserted_auth AS (
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  SELECT
    '00000000-0000-0000-0000-000000000000'::uuid,
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    n.email,
    crypt(n.password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', n.full_name),
    now(),
    now(),
    '', '', '', ''
  FROM normalized n
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE lower(u.email) = n.email
  )
  RETURNING id, email
),

-- ── 3. Collect ALL matched auth users (new + existing) ─
all_auth AS (
  -- newly created (use RETURNING so snapshot is not an issue)
  SELECT id, lower(email) AS email FROM inserted_auth
  UNION ALL
  -- pre-existing (snapshot excludes inserted_auth rows, so no duplicates)
  SELECT u.id, lower(u.email) AS email
  FROM auth.users u
  JOIN normalized n ON lower(u.email) = n.email
  WHERE NOT EXISTS (
    SELECT 1 FROM inserted_auth ia WHERE lower(ia.email) = lower(u.email)
  )
),

-- ── 4. Create auth.identities (enables email login) ────
inserted_identities AS (
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    a.id,
    jsonb_build_object('sub', a.id::text, 'email', a.email),
    'email',
    a.email,
    now(), now(), now()
  FROM all_auth a
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities i
    WHERE i.user_id = a.id AND i.provider = 'email'
  )
  RETURNING user_id
),

-- ── 5. Join with branches for IDs ──────────────────────
prepared AS (
  SELECT
    n.branch_name,
    n.full_name,
    n.email,
    a.id                                                              AS user_id,
    b.id                                                              AS branch_id,
    split_part(n.full_name, ' ', 1)                                   AS first_name,
    nullif(ltrim(substr(
      n.full_name,
      length(split_part(n.full_name, ' ', 1)) + 1
    )), '')                                                            AS last_name
  FROM normalized n
  JOIN all_auth a ON a.email = n.email
  LEFT JOIN public.branches b ON lower(b.name) = lower(n.branch_name)
),

-- ── 6. Upsert profiles with role = staff_member ────────
upsert_profiles AS (
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    role,
    branch,
    avatar_initials
  )
  SELECT
    p.user_id,
    p.full_name,
    p.email,
    '',
    'staff_member',
    COALESCE(p.branch_id::text, p.branch_name),
    upper(
      left(split_part(p.full_name, ' ', 1), 1) ||
      left(COALESCE(nullif(split_part(p.full_name, ' ', 2), ''), 'X'), 1)
    )
  FROM prepared p
  ON CONFLICT (id) DO UPDATE SET
    full_name        = EXCLUDED.full_name,
    email            = EXCLUDED.email,
    role             = 'staff_member',
    branch           = EXCLUDED.branch,
    avatar_initials  = EXCLUDED.avatar_initials
  RETURNING id
),

-- ── 7. Insert staff records (skips if already exists) ──
insert_staff AS (
  INSERT INTO public.staff (
    profile_id,
    staff_id,
    first_name,
    last_name,
    phone,
    email,
    branch_id,
    job_role,
    employment_type,
    date_joined,
    employment_status
  )
  SELECT
    p.user_id,
    'STF-' || to_char(current_date, 'YYYY') || '-' || upper(substr(md5(p.email), 1, 8)),
    p.first_name,
    COALESCE(p.last_name, 'Member'),
    '',
    p.email,
    p.branch_id,
    'staff_member',
    'full_time',
    current_date,
    'active'
  FROM prepared p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.staff s WHERE s.profile_id = p.user_id
  )
  ON CONFLICT (staff_id) DO NOTHING
  RETURNING id
)

-- ── 8. Summary ─────────────────────────────────────────
SELECT
  (SELECT count(*) FROM normalized)            AS "users in list",
  (SELECT count(*) FROM inserted_auth)         AS "auth accounts created",
  (SELECT count(*) FROM inserted_identities)   AS "identities created",
  (SELECT count(*) FROM upsert_profiles)       AS "profiles upserted",
  (SELECT count(*) FROM insert_staff)          AS "staff records inserted",
  COALESCE(
    (SELECT string_agg(email || '  →  branch not found: ' || branch_name, E'\n')
     FROM prepared WHERE branch_id IS NULL),
    'All branches matched ✓'
  ) AS "branch mismatches";

COMMIT;
