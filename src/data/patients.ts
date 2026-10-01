import type { Patient } from './types'

/** Fictional patients. Anna and Omar carry the hero scenario. */
export const PATIENTS: Patient[] = [
  {
    id: 'anna',
    name: 'Anna Petrova',
    birthDate: '1993-06-14',
    insurance: 'public',
    insurer: 'TK',
    languages: ['EN', 'RU'],
    email: 'anna.petrova@example.com',
    phone: '+49 151 2345 6789',
  },
  {
    id: 'mia',
    name: 'Mia Petrova',
    birthDate: '2019-09-02',
    insurance: 'public',
    insurer: 'TK',
    languages: ['RU', 'DE'],
    guardianId: 'anna',
    relation: 'child',
  },
  {
    id: 'omar',
    name: 'Omar Khalil',
    birthDate: '1984-11-23',
    insurance: 'public',
    insurer: 'AOK',
    languages: ['EN', 'AR'],
    email: 'omar.khalil@example.com',
    phone: '+49 160 9876 5432',
  },
  {
    id: 'lukas',
    name: 'Lukas Schmidt',
    birthDate: '1979-02-08',
    insurance: 'private',
    insurer: 'DKV',
    languages: ['DE'],
    email: 'lukas.schmidt@example.com',
  },
]

export const INSURERS = {
  public: ['TK', 'AOK', 'Barmer', 'DAK', 'IKK classic'],
  private: ['DKV', 'Allianz', 'Debeka', 'AXA'],
}
