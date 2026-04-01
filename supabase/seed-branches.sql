-- Run this in the Supabase SQL Editor to seed the 5 FOLAT branches.

INSERT INTO public.branches (name, code, address, city, state, status)
VALUES
  (
    'Ijebu Igbo Branch',
    'BR-IJEBU-IGBO',
    '162 Adeboye Road, Opposite Abeshin Mosque',
    'Ijebu Igbo',
    'Ogun',
    'active'
  ),
  (
    'Ijebu Ode Branch',
    'BR-IJEBU-ODE',
    'No 100a Italapo, Opposite Ita Alapo Mosque',
    'Ijebu Ode',
    'Ogun',
    'active'
  ),
  (
    'Sagamu Branch',
    'BR-SAGAMU',
    'No 5, Lakunle Folarin Street, GRA Road',
    'Sagamu',
    'Ogun',
    'active'
  ),
  (
    'Abeokuta 1 Branch',
    'BR-ABEOKUTA-1',
    'Opposite Technical School, Olobe Street, Idi-Aba',
    'Abeokuta',
    'Ogun',
    'active'
  ),
  (
    'Abeokuta 2 Branch',
    'BR-ABEOKUTA-2',
    'No 1, Somorin Street, Obantoko',
    'Abeokuta',
    'Ogun',
    'active'
  )
ON CONFLICT (code) DO NOTHING;
