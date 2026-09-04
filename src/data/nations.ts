import { Nation } from '../types';

export const NATIONS_DATABASE: Nation[] = [
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', power: 0.96, confederation: 'conmebol' },
  { code: 'FR', name: 'Fransiya', flag: '🇫🇷', power: 0.95, confederation: 'uefa' },
  { code: 'BR', name: 'Braziliya', flag: '🇧🇷', power: 0.95, confederation: 'conmebol' },
  { code: 'ES', name: 'Ispaniya', flag: '🇪🇸', power: 0.94, confederation: 'uefa' },
  { code: 'GB', name: 'Angliya', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', power: 0.93, confederation: 'uefa' },
  { code: 'DE', name: 'Germaniya', flag: '🇩🇪', power: 0.92, confederation: 'uefa' },
  { code: 'PT', name: 'Portugaliya', flag: '🇵🇹', power: 0.91, confederation: 'uefa' },
  { code: 'IT', name: 'Italiya', flag: '🇮🇹', power: 0.90, confederation: 'uefa' },
  { code: 'NL', name: 'Niderlandiya', flag: '🇳🇱', power: 0.88, confederation: 'uefa' },
  { code: 'BE', name: 'Belgiya', flag: '🇧🇪', power: 0.87, confederation: 'uefa' },
  { code: 'UY', name: 'Urugvay', flag: '🇺🇾', power: 0.86, confederation: 'conmebol' },
  { code: 'HR', name: 'Xorvatiya', flag: '🇭🇷', power: 0.85, confederation: 'uefa' },
  { code: 'MA', name: 'Marokash', flag: '🇲🇦', power: 0.84, confederation: 'caf' },
  { code: 'CO', name: 'Kolumbiya', flag: '🇨🇴', power: 0.84, confederation: 'conmebol' },
  { code: 'JP', name: 'Yaponiya', flag: '🇯🇵', power: 0.83, confederation: 'afc' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', power: 0.82, confederation: 'caf' },
  { code: 'KR', name: 'Janubiy Koreya', flag: '🇰🇷', power: 0.81, confederation: 'afc' },
  { code: 'US', name: 'AQSH', flag: '🇺🇸', power: 0.81, confederation: 'concacaf' },
  { code: 'MX', name: 'Meksika', flag: '🇲🇽', power: 0.81, confederation: 'concacaf' },
  { code: 'NG', name: 'Nigeriya', flag: '🇳🇬', power: 0.80, confederation: 'caf' },
  { code: 'EG', name: 'Misr', flag: '🇪🇬', power: 0.80, confederation: 'caf' },
  { code: 'TR', name: 'Turkiya', flag: '🇹🇷', power: 0.80, confederation: 'uefa' },
  { code: 'NO', name: 'Norvegiya', flag: '🇳🇴', power: 0.81, confederation: 'uefa' },
  { code: 'UZ', name: 'O‘zbekiston', flag: '🇺🇿', power: 0.79, confederation: 'afc' },
  { code: 'SA', name: 'Saudiya Arabistoni', flag: '🇸🇦', power: 0.78, confederation: 'afc' },
  { code: 'IR', name: 'Eron', flag: '🇮🇷', power: 0.79, confederation: 'afc' },
  { code: 'CH', name: 'Shveytsariya', flag: '🇨🇭', power: 0.82, confederation: 'uefa' },
  { code: 'AT', name: 'Avstriya', flag: '🇦🇹', power: 0.80, confederation: 'uefa' },
  { code: 'DK', name: 'Daniya', flag: '🇩🇰', power: 0.82, confederation: 'uefa' },
  { code: 'SE', name: 'Shvetsiya', flag: '🇸🇪', power: 0.81, confederation: 'uefa' },
  { code: 'DZ', name: 'Jazoir', flag: '🇩🇿', power: 0.78, confederation: 'caf' },
  { code: 'GH', name: 'Gana', flag: '🇬🇭', power: 0.78, confederation: 'caf' },
  { code: 'CI', name: 'Kot-d’Ivuar', flag: '🇨🇮', power: 0.79, confederation: 'caf' },
  { code: 'CM', name: 'Kamerun', flag: '🇨🇲', power: 0.77, confederation: 'caf' },
  { code: 'EC', name: 'Ekvador', flag: '🇪🇨', power: 0.79, confederation: 'conmebol' },
  { code: 'CL', name: 'Chili', flag: '🇨🇱', power: 0.78, confederation: 'conmebol' },
  { code: 'PY', name: 'Paragvay', flag: '🇵🇾', power: 0.77, confederation: 'conmebol' },
  { code: 'AU', name: 'Avstraliya', flag: '🇦🇺', power: 0.79, confederation: 'afc' },
  { code: 'UA', name: 'Ukraina', flag: '🇺🇦', power: 0.80, confederation: 'uefa' },
  { code: 'PL', name: 'Polsha', flag: '🇵🇱', power: 0.80, confederation: 'uefa' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', power: 0.74, confederation: 'afc' },
  { code: 'AE', name: 'BAA', flag: '🇦🇪', power: 0.74, confederation: 'afc' }
];

export function getNationByName(name: string): Nation {
  return NATIONS_DATABASE.find(n => n.name === name) || NATIONS_DATABASE[0];
}

export function getRandomNation(): Nation {
  return NATIONS_DATABASE[Math.floor(Math.random() * NATIONS_DATABASE.length)];
}
