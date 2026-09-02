export interface League {
  id: string;
  name: string;
  cup: string;
  flag: string;
  clubs: string[];
}

export interface Continent {
  id: 'uefa' | 'conmebol' | 'afc' | 'concacaf' | 'caf';
  name: string;
  flag: string;
  clName: string;
  cupName: string;
  leagues: League[];
}

export const CONTINENTS: Continent[] = [
  {
    id: 'uefa',
    name: 'Yevropa (UEFA)',
    flag: '🇪🇺',
    clName: 'UEFA Chempionlar Ligasi',
    cupName: 'Yevropa Chempionati (YEVRO)',
    leagues: [
      {
        id: 'epl',
        name: 'Angliya (Premier League)',
        cup: 'FA Kubogi',
        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        clubs: ['Manchester City', 'Arsenal', 'Liverpool', 'Chelsea', 'Manchester United', 'Tottenham', 'Aston Villa', 'Newcastle United']
      },
      {
        id: 'laliga',
        name: 'Ispaniya (La Liga)',
        cup: 'Qirol Kubogi (Copa del Rey)',
        flag: '🇪🇸',
        clubs: ['Real Madrid', 'FC Barcelona', 'Atlético Madrid', 'Sevilla', 'Real Sociedad', 'Athletic Bilbao', 'Villarreal']
      },
      {
        id: 'seriea',
        name: 'Italiya (Serie A)',
        cup: 'Italiya Kubogi (Coppa Italia)',
        flag: '🇮🇹',
        clubs: ['Inter Milan', 'Juventus', 'AC Milan', 'Napoli', 'AS Roma', 'Atalanta', 'Lazio', 'Fiorentina']
      },
      {
        id: 'bundesliga',
        name: 'Germaniya (Bundesliga)',
        cup: 'DFB-Pokal',
        flag: '🇩🇪',
        clubs: ['Bayern Munich', 'Bayer Leverkusen', 'Borussia Dortmund', 'RB Leipzig', 'Eintracht Frankfurt', 'Stuttgart']
      },
      {
        id: 'ligue1',
        name: 'Fransiya (Ligue 1)',
        cup: 'Fransiya Kubogi',
        flag: '🇫🇷',
        clubs: ['Paris Saint-Germain', 'Marseille', 'Monaco', 'Lille', 'Lyon', 'Nice', 'Rennes']
      }
    ]
  },
  {
    id: 'conmebol',
    name: 'Janubiy Amerika (CONMEBOL)',
    flag: '🌎',
    clName: 'Copa Libertadores',
    cupName: 'Copa América',
    leagues: [
      {
        id: 'brazil',
        name: 'Braziliya (Brasileirão Série A)',
        cup: 'Braziliya Kubogi',
        flag: '🇧🇷',
        clubs: ['Flamengo', 'Palmeiras', 'São Paulo', 'Santos', 'Fluminense', 'Grêmio', 'Atlético Mineiro', 'Corinthians']
      },
      {
        id: 'arg',
        name: 'Argentina (Liga Profesional)',
        cup: 'Argentina Kubogi',
        flag: '🇦🇷',
        clubs: ['Boca Juniors', 'River Plate', 'Racing Club', 'Independiente', 'San Lorenzo', 'Estudiantes']
      }
    ]
  },
  {
    id: 'afc',
    name: 'Osiyo & Sharq (AFC)',
    flag: '🌏',
    clName: 'OFK Chempionlar Ligasi Elite',
    cupName: 'OFK Osiyo Kubogi',
    leagues: [
      {
        id: 'uzb',
        name: 'O‘zbekiston (Superliga)',
        cup: 'O‘zbekiston Kubogi',
        flag: '🇺🇿',
        clubs: ['Paxtakor', 'Nasaf', 'Navbahor', 'Bunyodkor', 'Neftchi Farg‘ona', 'OKMK', 'So‘g‘diyona', 'Lokomotiv Toshkent']
      },
      {
        id: 'saudi',
        name: 'Saudiya Arabistoni (Roshn Saudi League)',
        cup: 'Qirol Kubogi',
        flag: '🇸🇦',
        clubs: ['Al-Hilal', 'Al-Nassr', 'Al-Ittihad', 'Al-Ahli', 'Al-Ettifaq', 'Al-Shabab']
      },
      {
        id: 'jleague',
        name: 'Yaponiya (J1 League)',
        cup: 'Imperator Kubogi',
        flag: '🇯🇵',
        clubs: ['Vissel Kobe', 'Yokohama F. Marinos', 'Kawasaki Frontale', 'Urawa Red Diamonds', 'Sanfrecce Hiroshima']
      },
      {
        id: 'kleague',
        name: 'Janubiy Koreya (K League 1)',
        cup: 'FA Kubogi',
        flag: '🇰🇷',
        clubs: ['Ulsan HD', 'Jeonbuk Hyundai', 'FC Seoul', 'Pohang Steelers']
      }
    ]
  },
  {
    id: 'concacaf',
    name: 'Shimoliy Amerika (CONCACAF)',
    flag: '🌎',
    clName: 'CONCACAF Chempionlar Kubogi',
    cupName: 'CONCACAF Oltin Kubogi',
    leagues: [
      {
        id: 'mls',
        name: 'AQSH & Kanada (MLS)',
        cup: 'Lamar Hunt U.S. Open Cup',
        flag: '🇺🇸',
        clubs: ['Inter Miami', 'LA Galaxy', 'LAFC', 'Seattle Sounders', 'Columbus Crew', 'Atlanta United', 'New York Red Bulls']
      },
      {
        id: 'ligamx',
        name: 'Meksika (Liga MX)',
        cup: 'Copa MX',
        flag: '🇲🇽',
        clubs: ['Club América', 'Monterrey', 'Tigres UANL', 'Chivas Guadalajara', 'Cruz Azul', 'Toluca']
      }
    ]
  },
  {
    id: 'caf',
    name: 'Afrika (CAF)',
    flag: '🌍',
    clName: 'CAF Chempionlar Ligasi',
    cupName: 'Afrika Millatlar Kubogi (AFCON)',
    leagues: [
      {
        id: 'egypt',
        name: 'Misr (Premier League)',
        cup: 'Misr Kubogi',
        flag: '🇪🇬',
        clubs: ['Al Ahly', 'Zamalek SC', 'Pyramids FC', 'Al Masry']
      },
      {
        id: 'maroc',
        name: 'Marokash (Botola Pro)',
        cup: 'Taxt Kubogi',
        flag: '🇲🇦',
        clubs: ['Wydad AC', 'Raja Casablanca', 'RS Berkane', 'FAR Rabat']
      }
    ]
  }
];
