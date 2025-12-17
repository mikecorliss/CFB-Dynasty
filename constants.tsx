
import React from 'react';
import { Team, Position, PlayerYear, Conference, Player } from './types';

export const ICONS = {
  Football: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 17 17 2"/><path d="m2 6 4-4"/><path d="m6 2 4 4"/><path d="m10 6 4-4"/><path d="m14 2 4 4"/><path d="m18 6 4-4"/><path d="m6 22 4-4"/><path d="m10 18 4 4"/><path d="m14 22 4-4"/><path d="m18 18 4 4"/><path d="m18 22 4-4"/></svg>
  ),
  Users: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Clipboard: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
  ),
  Calendar: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  ),
  Trophy: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
  ),
  Play: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="5 3 19 12 5 21 5 3"/></svg>
  ),
  Search: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Filter: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
  ),
  Lightning: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  List: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
  ),
  Briefcase: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
  ChevronUp: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m18 15-6-6-6 6"/></svg>
  ),
  ChevronDown: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6"/></svg>
  ),
  Edit: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
  ),
  Settings: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
};

export const calculateStars = (prestige: number): number => {
  if (prestige >= 90) return 6;
  if (prestige >= 80) return 5;
  if (prestige >= 65) return 4;
  if (prestige >= 50) return 3;
  if (prestige >= 35) return 2;
  return 1;
};

const NAMES = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores"];
const HOMETOWNS = ["Austin, TX", "Miami, FL", "Columbus, OH", "Los Angeles, CA", "Atlanta, GA", "Dallas, TX", "New Orleans, LA", "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Orlando, FL", "Charlotte, NC", "Nashville, TN", "Seattle, WA", "Denver, CO", "Detroit, MI", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Las Vegas, NV", "Tampa, FL", "Jacksonville, FL", "Indianapolis, IN", "San Jose, CA", "Columbus, GA", "Mobile, AL", "Birmingham, AL", "Baton Rouge, LA"];

export const generateRandomPlayer = (id: string, pos?: Position, minRating = 60, maxRating = 90): Player => {
  const positions = Object.values(Position);
  const position = pos || positions[Math.floor(Math.random() * positions.length)];
  const rating = Math.floor(Math.random() * (maxRating - minRating + 1)) + minRating;
  
  return {
    id,
    name: `${NAMES[Math.floor(Math.random() * NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`,
    position,
    year: [PlayerYear.FR, PlayerYear.SO, PlayerYear.JR, PlayerYear.SR][Math.floor(Math.random() * 4)],
    rating,
    hometown: HOMETOWNS[Math.floor(Math.random() * HOMETOWNS.length)],
    stats: { games: 0, yards: 0, touchdowns: 0 },
    potential: Math.floor(Math.random() * 20) + rating
  };
};

export const generateBalancedRoster = (teamId: string, prestige: number): Player[] => {
  const roster: Player[] = [];
  const minR = Math.max(50, prestige - 10);
  const maxR = Math.min(99, prestige + 5);

  const distribution = {
    [Position.QB]: 3, [Position.RB]: 5, [Position.WR]: 8, [Position.OL]: 10,
    [Position.DL]: 8, [Position.LB]: 6, [Position.DB]: 8, [Position.K]: 2
  };

  Object.entries(distribution).forEach(([pos, count]) => {
    for (let i = 0; i < count; i++) {
      roster.push(generateRandomPlayer(`${teamId}-${pos}-${i}`, pos as Position, minR, maxR));
    }
  });

  return roster;
};

const createTeam = (id: string, name: string, nickname: string, abbr: string, color: string, prestige: number, conf: Conference): Team => ({
  id, name, nickname, abbreviation: abbr, color, prestige, stars: calculateStars(prestige), conference: conf,
  stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 0 },
  roster: [], strategy: { offense: 'Balanced', defense: '4-3', aggression: 5, clockManagement: 'Balanced', fourthDownTendency: 'Balanced' }
});

export const INITIAL_LEAGUE: Team[] = [
  // SEC (16)
  createTeam('1', 'Alabama', 'Crimson Tide', 'ALA', 'bg-red-800', 95, 'SEC'),
  createTeam('2', 'Georgia', 'Bulldogs', 'UGA', 'bg-red-600', 96, 'SEC'),
  createTeam('3', 'Texas', 'Longhorns', 'TEX', 'bg-orange-600', 94, 'SEC'),
  createTeam('4', 'Oklahoma', 'Sooners', 'OU', 'bg-red-700', 91, 'SEC'),
  createTeam('5', 'LSU', 'Tigers', 'LSU', 'bg-purple-700', 92, 'SEC'),
  createTeam('6', 'Ole Miss', 'Rebels', 'MISS', 'bg-blue-600', 89, 'SEC'),
  createTeam('7', 'Tennessee', 'Volunteers', 'TENN', 'bg-orange-500', 90, 'SEC'),
  createTeam('8', 'Missouri', 'Tigers', 'MIZZ', 'bg-yellow-600', 86, 'SEC'),
  createTeam('9', 'Texas A&M', 'Aggies', 'TAMU', 'bg-red-900', 87, 'SEC'),
  createTeam('10', 'Auburn', 'Tigers', 'AUB', 'bg-blue-800', 83, 'SEC'),
  createTeam('11', 'Florida', 'Gators', 'FLA', 'bg-blue-700', 84, 'SEC'),
  createTeam('12', 'Kentucky', 'Wildcats', 'UK', 'bg-blue-900', 81, 'SEC'),
  createTeam('13', 'South Carolina', 'Gamecocks', 'USC', 'bg-red-900', 80, 'SEC'),
  createTeam('14', 'Arkansas', 'Razorbacks', 'ARK', 'bg-red-700', 79, 'SEC'),
  createTeam('15', 'Mississippi State', 'Bulldogs', 'MSST', 'bg-red-800', 76, 'SEC'),
  createTeam('16', 'Vanderbilt', 'Commodores', 'VANDY', 'bg-yellow-700', 72, 'SEC'),

  // Big Ten (18)
  createTeam('17', 'Ohio State', 'Buckeyes', 'OSU', 'bg-red-700', 95, 'Big Ten'),
  createTeam('18', 'Oregon', 'Ducks', 'ORE', 'bg-green-700', 94, 'Big Ten'),
  createTeam('19', 'Michigan', 'Wolverines', 'MICH', 'bg-blue-900', 91, 'Big Ten'),
  createTeam('20', 'Penn State', 'Nittany Lions', 'PSU', 'bg-blue-800', 90, 'Big Ten'),
  createTeam('21', 'USC', 'Trojans', 'USC', 'bg-red-600', 89, 'Big Ten'),
  createTeam('22', 'Washington', 'Huskies', 'WASH', 'bg-purple-800', 86, 'Big Ten'),
  createTeam('23', 'Iowa', 'Hawkeyes', 'IOWA', 'bg-yellow-500', 83, 'Big Ten'),
  createTeam('24', 'Wisconsin', 'Badgers', 'WIS', 'bg-red-600', 82, 'Big Ten'),
  createTeam('25', 'Nebraska', 'Cornhuskers', 'NEB', 'bg-red-700', 81, 'Big Ten'),
  createTeam('26', 'Michigan State', 'Spartans', 'MSU', 'bg-green-800', 78, 'Big Ten'),
  createTeam('27', 'UCLA', 'Bruins', 'UCLA', 'bg-blue-500', 79, 'Big Ten'),
  createTeam('28', 'Minnesota', 'Golden Gophers', 'MINN', 'bg-red-800', 77, 'Big Ten'),
  createTeam('29', 'Illinois', 'Fighting Illini', 'ILL', 'bg-orange-600', 76, 'Big Ten'),
  createTeam('30', 'Maryland', 'Terrapins', 'MD', 'bg-red-600', 75, 'Big Ten'),
  createTeam('31', 'Rutgers', 'Scarlet Knights', 'RUT', 'bg-red-700', 74, 'Big Ten'),
  createTeam('32', 'Northwestern', 'Wildcats', 'NW', 'bg-purple-800', 73, 'Big Ten'),
  createTeam('33', 'Purdue', 'Boilermakers', 'PUR', 'bg-yellow-600', 72, 'Big Ten'),
  createTeam('34', 'Indiana', 'Hoosiers', 'IND', 'bg-red-700', 71, 'Big Ten'),

  // Big 12 (16)
  createTeam('35', 'Utah', 'Utes', 'UTAH', 'bg-red-600', 88, 'Big 12'),
  createTeam('36', 'Kansas State', 'Wildcats', 'KSU', 'bg-purple-800', 87, 'Big 12'),
  createTeam('37', 'Oklahoma State', 'Cowboys', 'OKST', 'bg-orange-600', 85, 'Big 12'),
  createTeam('38', 'Kansas', 'Jayhawks', 'KU', 'bg-blue-600', 84, 'Big 12'),
  createTeam('39', 'Arizona', 'Wildcats', 'ARIZ', 'bg-blue-900', 82, 'Big 12'),
  createTeam('40', 'West Virginia', 'Mountaineers', 'WVU', 'bg-blue-800', 81, 'Big 12'),
  createTeam('41', 'Iowa State', 'Cyclones', 'ISU', 'bg-red-700', 80, 'Big 12'),
  createTeam('42', 'UCF', 'Knights', 'UCF', 'bg-yellow-600', 81, 'Big 12'),
  createTeam('43', 'TCU', 'Horned Frogs', 'TCU', 'bg-purple-700', 79, 'Big 12'),
  createTeam('44', 'Texas Tech', 'Red Raiders', 'TTU', 'bg-red-800', 78, 'Big 12'),
  createTeam('45', 'Baylor', 'Bears', 'BAY', 'bg-green-800', 77, 'Big 12'),
  createTeam('46', 'Houston', 'Cougars', 'HOU', 'bg-red-600', 76, 'Big 12'),
  createTeam('47', 'BYU', 'Cougars', 'BYU', 'bg-blue-800', 78, 'Big 12'),
  createTeam('48', 'Cincinnati', 'Bearcats', 'CIN', 'bg-red-700', 75, 'Big 12'),
  createTeam('49', 'Arizona State', 'Sun Devils', 'ASU', 'bg-red-900', 74, 'Big 12'),
  createTeam('50', 'Colorado', 'Buffaloes', 'COLO', 'bg-yellow-700', 83, 'Big 12'),

  // ACC (17)
  createTeam('51', 'Florida State', 'Seminoles', 'FSU', 'bg-red-900', 90, 'ACC'),
  createTeam('52', 'Clemson', 'Tigers', 'CLEM', 'bg-orange-500', 89, 'ACC'),
  createTeam('53', 'Miami', 'Hurricanes', 'MIA', 'bg-green-600', 88, 'ACC'),
  createTeam('54', 'Louisville', 'Cardinals', 'LOU', 'bg-red-600', 85, 'ACC'),
  createTeam('55', 'NC State', 'Wolfpack', 'NCST', 'bg-red-700', 82, 'ACC'),
  createTeam('56', 'Virginia Tech', 'Hokies', 'VT', 'bg-orange-800', 81, 'ACC'),
  createTeam('57', 'SMU', 'Mustangs', 'SMU', 'bg-blue-700', 83, 'ACC'),
  createTeam('58', 'North Carolina', 'Tar Heels', 'UNC', 'bg-blue-300', 80, 'ACC'),
  createTeam('59', 'Georgia Tech', 'Yellow Jackets', 'GT', 'bg-yellow-500', 78, 'ACC'),
  createTeam('60', 'Cal', 'Golden Bears', 'CAL', 'bg-blue-900', 77, 'ACC'),
  createTeam('61', 'Stanford', 'Cardinal', 'STAN', 'bg-red-800', 76, 'ACC'),
  createTeam('62', 'Pitt', 'Panthers', 'PITT', 'bg-blue-800', 77, 'ACC'),
  createTeam('63', 'Boston College', 'Eagles', 'BC', 'bg-red-900', 75, 'ACC'),
  createTeam('64', 'Wake Forest', 'Demon Deacons', 'WAKE', 'bg-yellow-600', 74, 'ACC'),
  createTeam('65', 'Virginia', 'Cavaliers', 'UVA', 'bg-blue-800', 73, 'ACC'),
  createTeam('66', 'Duke', 'Blue Devils', 'DUKE', 'bg-blue-700', 76, 'ACC'),
  createTeam('67', 'Syracuse', 'Orange', 'SYR', 'bg-orange-600', 74, 'ACC'),

  // Pac-12 (2026 Reborn - 7)
  createTeam('68', 'Oregon State', 'Beavers', 'ORST', 'bg-orange-600', 82, 'Pac-12'),
  createTeam('69', 'Washington State', 'Cougars', 'WAST', 'bg-red-800', 81, 'Pac-12'),
  createTeam('70', 'Boise State', 'Broncos', 'BSU', 'bg-blue-700', 84, 'Pac-12'),
  createTeam('71', 'San Diego State', 'Aztecs', 'SDSU', 'bg-red-600', 77, 'Pac-12'),
  createTeam('72', 'Colorado State', 'Rams', 'CSU', 'bg-green-800', 76, 'Pac-12'),
  createTeam('73', 'Fresno State', 'Bulldogs', 'FRES', 'bg-red-700', 78, 'Pac-12'),
  createTeam('74', 'Utah State', 'Aggies', 'USU', 'bg-blue-900', 73, 'Pac-12'),

  // AAC (13)
  createTeam('75', 'Memphis', 'Tigers', 'MEM', 'bg-blue-600', 79, 'AAC'),
  createTeam('76', 'Tulane', 'Green Wave', 'TUL', 'bg-green-700', 80, 'AAC'),
  createTeam('77', 'USF', 'Bulls', 'USF', 'bg-green-800', 76, 'AAC'),
  createTeam('78', 'UTSA', 'Roadrunners', 'UTSA', 'bg-blue-900', 77, 'AAC'),
  createTeam('79', 'FAU', 'Owls', 'FAU', 'bg-blue-700', 72, 'AAC'),
  createTeam('80', 'Charlotte', '49ers', 'CLT', 'bg-green-700', 68, 'AAC'),
  createTeam('81', 'ECU', 'Pirates', 'ECU', 'bg-purple-700', 71, 'AAC'),
  createTeam('82', 'North Texas', 'Mean Green', 'UNT', 'bg-green-600', 70, 'AAC'),
  createTeam('83', 'Rice', 'Owls', 'RICE', 'bg-blue-800', 65, 'AAC'),
  createTeam('84', 'Temple', 'Owls', 'TEMP', 'bg-red-800', 64, 'AAC'),
  createTeam('85', 'UAB', 'Blazers', 'UAB', 'bg-green-900', 69, 'AAC'),
  createTeam('86', 'Navy', 'Midshipmen', 'NAVY', 'bg-blue-900', 72, 'AAC'),
  createTeam('87', 'Army', 'Black Knights', 'ARMY', 'bg-yellow-700', 73, 'AAC'),

  // Sun Belt (14)
  createTeam('88', 'App State', 'Mountaineers', 'APP', 'bg-yellow-500', 78, 'Sun Belt'),
  createTeam('89', 'James Madison', 'Dukes', 'JMU', 'bg-purple-600', 79, 'Sun Belt'),
  createTeam('90', 'Coastal Carolina', 'Chanticleers', 'CCU', 'bg-teal-600', 75, 'Sun Belt'),
  createTeam('91', 'Georgia Southern', 'Eagles', 'GASO', 'bg-blue-900', 73, 'Sun Belt'),
  createTeam('92', 'Georgia State', 'Panthers', 'GAST', 'bg-blue-600', 68, 'Sun Belt'),
  createTeam('93', 'Marshall', 'Thundering Herd', 'MARSH', 'bg-green-700', 74, 'Sun Belt'),
  createTeam('94', 'Old Dominion', 'Monarchs', 'ODU', 'bg-blue-800', 67, 'Sun Belt'),
  createTeam('95', 'Troy', 'Trojans', 'TROY', 'bg-red-900', 76, 'Sun Belt'),
  createTeam('96', 'South Alabama', 'Jaguars', 'USA', 'bg-blue-700', 72, 'Sun Belt'),
  createTeam('97', 'Southern Miss', 'Golden Eagles', 'USM', 'bg-yellow-500', 66, 'Sun Belt'),
  createTeam('98', 'Texas State', 'Bobcats', 'TXST', 'bg-yellow-800', 74, 'Sun Belt'),
  createTeam('99', 'Louisiana', 'Ragin Cajuns', 'UL', 'bg-red-600', 73, 'Sun Belt'),
  createTeam('100', 'ULM', 'Warhawks', 'ULM', 'bg-red-800', 62, 'Sun Belt'),
  createTeam('101', 'Arkansas State', 'Red Wolves', 'ARKST', 'bg-red-700', 68, 'Sun Belt'),

  // MAC (13 - 2026 include UMass)
  createTeam('102', 'Toledo', 'Rockets', 'TOL', 'bg-blue-700', 76, 'MAC'),
  createTeam('103', 'Miami (OH)', 'RedHawks', 'MIOH', 'bg-red-600', 75, 'MAC'),
  createTeam('104', 'Northern Illinois', 'Huskies', 'NIU', 'bg-red-700', 72, 'MAC'),
  createTeam('105', 'Bowling Green', 'Falcons', 'BGSU', 'bg-orange-600', 70, 'MAC'),
  createTeam('106', 'Western Michigan', 'Broncos', 'WMU', 'bg-yellow-900', 69, 'MAC'),
  createTeam('107', 'Central Michigan', 'Chippewas', 'CMU', 'bg-red-800', 68, 'MAC'),
  createTeam('108', 'Eastern Michigan', 'Eagles', 'EMU', 'bg-green-800', 67, 'MAC'),
  createTeam('109', 'Akron', 'Zips', 'AKR', 'bg-blue-800', 61, 'MAC'),
  createTeam('110', 'Buffalo', 'Bulls', 'BUFF', 'bg-blue-600', 64, 'MAC'),
  createTeam('111', 'Kent State', 'Golden Flashes', 'KENT', 'bg-blue-900', 60, 'MAC'),
  createTeam('112', 'Ohio', 'Bobcats', 'OHIO', 'bg-green-900', 73, 'MAC'),
  createTeam('113', 'Ball State', 'Cardinals', 'BALL', 'bg-red-600', 63, 'MAC'),
  createTeam('114', 'UMass', 'Minutemen', 'UMASS', 'bg-red-800', 62, 'MAC'),

  // Mountain West (Remaining 7)
  createTeam('115', 'Air Force', 'Falcons', 'AF', 'bg-blue-600', 74, 'Mountain West'),
  createTeam('116', 'Nevada', 'Wolf Pack', 'NEV', 'bg-blue-800', 66, 'Mountain West'),
  createTeam('117', 'New Mexico', 'Lobos', 'UNM', 'bg-red-600', 64, 'Mountain West'),
  createTeam('118', 'San Jose State', 'Spartans', 'SJSU', 'bg-yellow-500', 71, 'Mountain West'),
  createTeam('119', 'UNLV', 'Rebels', 'UNLV', 'bg-red-700', 78, 'Mountain West'),
  createTeam('120', 'Wyoming', 'Cowboys', 'WYO', 'bg-yellow-900', 72, 'Mountain West'),
  createTeam('121', 'Hawaii', 'Rainbow Warriors', 'HAW', 'bg-green-700', 67, 'Mountain West'),

  // CUSA (11 - 2026 include Delaware)
  createTeam('122', 'Liberty', 'Flames', 'LIB', 'bg-red-700', 81, 'CUSA'),
  createTeam('123', 'WKU', 'Hilltoppers', 'WKU', 'bg-red-600', 75, 'CUSA'),
  createTeam('124', 'Jacksonville State', 'Gamecocks', 'JSU', 'bg-red-800', 74, 'CUSA'),
  createTeam('125', 'MTSU', 'Blue Raiders', 'MTSU', 'bg-blue-600', 66, 'CUSA'),
  createTeam('126', 'NMSU', 'Aggies', 'NMSU', 'bg-red-900', 68, 'CUSA'),
  createTeam('127', 'SHSU', 'Bearkats', 'SHSU', 'bg-orange-600', 67, 'CUSA'),
  createTeam('128', 'FIU', 'Panthers', 'FIU', 'bg-blue-900', 63, 'CUSA'),
  createTeam('129', 'Louisiana Tech', 'Bulldogs', 'LTECH', 'bg-blue-700', 68, 'CUSA'),
  createTeam('130', 'UTEP', 'Miners', 'UTEP', 'bg-orange-700', 62, 'CUSA'),
  createTeam('131', 'Kennesaw State', 'Owls', 'KSU', 'bg-yellow-500', 60, 'CUSA'),
  createTeam('132', 'Delaware', 'Blue Hens', 'DEL', 'bg-blue-600', 65, 'CUSA'),

  // Independents (2)
  createTeam('133', 'Notre Dame', 'Fighting Irish', 'ND', 'bg-blue-800', 92, 'Independent'),
  createTeam('134', 'UConn', 'Huskies', 'CONN', 'bg-blue-900', 68, 'Independent'),
];
