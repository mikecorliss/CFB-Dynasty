
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
  Settings: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  Banknote: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
  ),
  Coins: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7 .71-2.82 2.82"/><path d="m7.38 12 5.71-5.71a1 1 0 0 0 0-1.42l-1.41-1.41a1 1 0 0 0-1.42 0L4.56 9.1"/></svg>
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
};

const FIRST_NAMES = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Chris', 'Daniel', 'Dante', 'Malik', 'Trey', 'Jayden', 'Jordan', 'Cameron', 'Caleb', 'Ty', 'Deion', 'Travis', 'Cooper', 'Arch'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Sanders', 'Manning', 'Hunter', 'Beck', 'Ewers', 'Milroe', 'Gabriel', 'Nussmeier', 'Ward', 'Dart'];
const CITIES = ['Houston, TX', 'Atlanta, GA', 'Miami, FL', 'Dallas, TX', 'Los Angeles, CA', 'New Orleans, LA', 'Bradenton, FL', 'Duncanville, TX', 'Mater Dei, CA', 'Buford, GA', 'St. Louis, MO', 'Chicago, IL', 'Detroit, MI', 'Cleveland, OH'];

export const generateRandomPlayer = (id: string, position?: Position, minRating = 60, maxRating = 99): Player => {
  const pos = position || Object.values(Position)[Math.floor(Math.random() * Object.values(Position).length)];
  const rating = Math.floor(Math.random() * (maxRating - minRating + 1)) + minRating;
  const year = Object.values(PlayerYear)[Math.floor(Math.random() * Object.values(PlayerYear).length)];
  
  return {
    id,
    name: `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`,
    position: pos,
    year,
    rating,
    hometown: CITIES[Math.floor(Math.random() * CITIES.length)],
    stats: {
      games: 0,
      yards: 0,
      touchdowns: 0
    },
    potential: Math.min(99, rating + Math.floor(Math.random() * 10)),
    marketValue: Math.floor(rating * 1000 * (1 + Math.random())),
  };
};

export const calculateStars = (rating: number): number => {
  if (rating >= 95) return 5;
  if (rating >= 85) return 4;
  if (rating >= 75) return 3;
  if (rating >= 65) return 2;
  return 1;
};

export const generateBalancedRoster = (teamId: string, prestige: number): Player[] => {
  const roster: Player[] = [];
  const positions = {
    [Position.QB]: 3,
    [Position.RB]: 4,
    [Position.WR]: 6,
    [Position.OL]: 8,
    [Position.DL]: 6,
    [Position.LB]: 6,
    [Position.DB]: 8,
    [Position.K]: 2
  };

  let idCounter = 1;
  const baseRating = Math.max(60, prestige - 10);
  
  Object.entries(positions).forEach(([pos, count]) => {
    for (let i = 0; i < count; i++) {
      // Starters should be better
      const isStarter = i < (count / 2);
      const ratingBonus = isStarter ? 5 : -5;
      const min = Math.min(99, baseRating + ratingBonus);
      const max = Math.min(99, baseRating + 10 + ratingBonus);
      
      roster.push(generateRandomPlayer(`${teamId}-${pos}-${idCounter++}`, pos as Position, min, max));
    }
  });

  return roster;
};

export const INITIAL_LEAGUE: Team[] = [
  // Power 4
  { id: 't1', name: 'Georgia', nickname: 'Bulldogs', abbreviation: 'UGA', color: '#BA0C2F', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/61.png', prestige: 99, stars: 5, conference: 'SEC', coachHotseat: 0, financials: { budget: 100000000, nilCollective: 15000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 5000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 1, streak: 0 }, roster: [], strategy: { offense: 'Pro-Style', defense: '3-4', aggression: 5, clockManagement: 'Balanced', fourthDownTendency: 'Balanced' } },
  { id: 't2', name: 'Ohio State', nickname: 'Buckeyes', abbreviation: 'OSU', color: '#BB0000', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/194.png', prestige: 97, stars: 5, conference: 'Big Ten', coachHotseat: 10, financials: { budget: 100000000, nilCollective: 15000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 5000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 2, streak: 0 }, roster: [], strategy: { offense: 'Spread', defense: '4-3', aggression: 6, clockManagement: 'Balanced', fourthDownTendency: 'Aggressive' } },
  { id: 't3', name: 'Texas', nickname: 'Longhorns', abbreviation: 'TEX', color: '#BF5700', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/251.png', prestige: 96, stars: 5, conference: 'SEC', coachHotseat: 20, financials: { budget: 100000000, nilCollective: 18000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 5000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 3, streak: 0 }, roster: [], strategy: { offense: 'Spread', defense: '4-2-5', aggression: 7, clockManagement: 'Balanced', fourthDownTendency: 'Balanced' } },
  { id: 't4', name: 'Alabama', nickname: 'Crimson Tide', abbreviation: 'ALA', color: '#9E1B32', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/333.png', prestige: 95, stars: 5, conference: 'SEC', coachHotseat: 15, financials: { budget: 95000000, nilCollective: 14000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 4500000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 4, streak: 0 }, roster: [], strategy: { offense: 'Spread', defense: '3-4', aggression: 6, clockManagement: 'Balanced', fourthDownTendency: 'Balanced' } },
  { id: 't5', name: 'Oregon', nickname: 'Ducks', abbreviation: 'ORE', color: '#154733', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png', prestige: 94, stars: 5, conference: 'Big Ten', coachHotseat: 5, financials: { budget: 90000000, nilCollective: 20000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 6000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 5, streak: 0 }, roster: [], strategy: { offense: 'Spread', defense: 'Balanced', aggression: 8, clockManagement: 'Aggressive', fourthDownTendency: 'Aggressive' } },
  { id: 't6', name: 'Notre Dame', nickname: 'Fighting Irish', abbreviation: 'ND', color: '#0C2340', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/87.png', prestige: 93, stars: 5, conference: 'Independent', coachHotseat: 30, financials: { budget: 90000000, nilCollective: 12000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 4000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 6, streak: 0 }, roster: [], strategy: { offense: 'Pro-Style', defense: '4-3', aggression: 5, clockManagement: 'Balanced', fourthDownTendency: 'Conservative' } },
  { id: 't7', name: 'Florida State', nickname: 'Seminoles', abbreviation: 'FSU', color: '#782F40', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/52.png', prestige: 88, stars: 4, conference: 'ACC', coachHotseat: 40, financials: { budget: 85000000, nilCollective: 10000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 3500000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 10, streak: 0 }, roster: [], strategy: { offense: 'Balanced', defense: '4-2-5', aggression: 6, clockManagement: 'Balanced', fourthDownTendency: 'Balanced' } },
  { id: 't8', name: 'Michigan', nickname: 'Wolverines', abbreviation: 'MICH', color: '#00274C', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/130.png', prestige: 92, stars: 5, conference: 'Big Ten', coachHotseat: 10, financials: { budget: 95000000, nilCollective: 13000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 4500000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 8, streak: 0 }, roster: [], strategy: { offense: 'Run Heavy', defense: '4-3', aggression: 4, clockManagement: 'Conservative', fourthDownTendency: 'Conservative' } },
  { id: 't9', name: 'Clemson', nickname: 'Tigers', abbreviation: 'CLEM', color: '#F56600', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/228.png', prestige: 90, stars: 5, conference: 'ACC', coachHotseat: 35, financials: { budget: 85000000, nilCollective: 8000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 3500000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 12, streak: 0 }, roster: [], strategy: { offense: 'Spread', defense: 'Blitz Heavy', aggression: 6, clockManagement: 'Balanced', fourthDownTendency: 'Balanced' } },
  { id: 't10', name: 'USC', nickname: 'Trojans', abbreviation: 'USC', color: '#990000', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/30.png', prestige: 89, stars: 4, conference: 'Big Ten', coachHotseat: 45, financials: { budget: 90000000, nilCollective: 12000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 5000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 14, streak: 0 }, roster: [], strategy: { offense: 'Air Raid', defense: '3-3-5', aggression: 8, clockManagement: 'Balanced', fourthDownTendency: 'Aggressive' } },
  { id: 't11', name: 'LSU', nickname: 'Tigers', abbreviation: 'LSU', color: '#461D7C', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/99.png', prestige: 91, stars: 5, conference: 'SEC', coachHotseat: 25, financials: { budget: 92000000, nilCollective: 13000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 4000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 11, streak: 0 }, roster: [], strategy: { offense: 'Spread', defense: 'Balanced', aggression: 7, clockManagement: 'Balanced', fourthDownTendency: 'Balanced' } },
  { id: 't12', name: 'Penn State', nickname: 'Nittany Lions', abbreviation: 'PSU', color: '#041E42', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/213.png', prestige: 90, stars: 5, conference: 'Big Ten', coachHotseat: 20, financials: { budget: 88000000, nilCollective: 11000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 4000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 9, streak: 0 }, roster: [], strategy: { offense: 'Balanced', defense: 'Blitz Heavy', aggression: 6, clockManagement: 'Balanced', fourthDownTendency: 'Balanced' } },
  { id: 't13', name: 'Miami', nickname: 'Hurricanes', abbreviation: 'MIA', color: '#005030', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png', prestige: 87, stars: 4, conference: 'ACC', coachHotseat: 50, financials: { budget: 85000000, nilCollective: 15000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 4500000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 15, streak: 0 }, roster: [], strategy: { offense: 'Air Raid', defense: '4-2-5', aggression: 7, clockManagement: 'Balanced', fourthDownTendency: 'Aggressive' } },
  { id: 't14', name: 'Oklahoma', nickname: 'Sooners', abbreviation: 'OU', color: '#841617', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/201.png', prestige: 90, stars: 5, conference: 'SEC', coachHotseat: 15, financials: { budget: 90000000, nilCollective: 12000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 4000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 13, streak: 0 }, roster: [], strategy: { offense: 'Spread', defense: '3-3-5', aggression: 7, clockManagement: 'Aggressive', fourthDownTendency: 'Balanced' } },
  { id: 't15', name: 'Tennessee', nickname: 'Volunteers', abbreviation: 'TENN', color: '#FF8200', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png', prestige: 89, stars: 4, conference: 'SEC', coachHotseat: 10, financials: { budget: 88000000, nilCollective: 13000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 4000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 16, streak: 0 }, roster: [], strategy: { offense: 'Air Raid', defense: '4-2-5', aggression: 9, clockManagement: 'Aggressive', fourthDownTendency: 'Aggressive' } },
  { id: 't16', name: 'Ole Miss', nickname: 'Rebels', abbreviation: 'MISS', color: '#14213D', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/145.png', prestige: 88, stars: 4, conference: 'SEC', coachHotseat: 10, financials: { budget: 80000000, nilCollective: 14000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 3500000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 7, streak: 0 }, roster: [], strategy: { offense: 'Spread', defense: '3-3-5', aggression: 8, clockManagement: 'Aggressive', fourthDownTendency: 'Aggressive' } },
  
  // G5 & Others (For new coaches)
  { id: 't100', name: 'App State', nickname: 'Mountaineers', abbreviation: 'APP', color: '#FFCC00', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2026.png', prestige: 74, stars: 3, conference: 'Sun Belt', coachHotseat: 0, financials: { budget: 30000000, nilCollective: 2000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 1000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 0, streak: 0 }, roster: [], strategy: { offense: 'Spread', defense: '3-3-5', aggression: 6, clockManagement: 'Balanced', fourthDownTendency: 'Aggressive' } },
  { id: 't101', name: 'Boise State', nickname: 'Broncos', abbreviation: 'BSU', color: '#0033A0', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/68.png', prestige: 76, stars: 3, conference: 'Mountain West', coachHotseat: 10, financials: { budget: 40000000, nilCollective: 3000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 1500000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 24, streak: 0 }, roster: [], strategy: { offense: 'Pro-Style', defense: '4-2-5', aggression: 7, clockManagement: 'Balanced', fourthDownTendency: 'Aggressive' } },
  { id: 't102', name: 'Tulane', nickname: 'Green Wave', abbreviation: 'TUL', color: '#006747', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2655.png', prestige: 70, stars: 3, conference: 'AAC', coachHotseat: 0, financials: { budget: 35000000, nilCollective: 2500000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 1200000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 0, streak: 0 }, roster: [], strategy: { offense: 'Spread', defense: '4-3', aggression: 6, clockManagement: 'Balanced', fourthDownTendency: 'Balanced' } },
  { id: 't103', name: 'Liberty', nickname: 'Flames', abbreviation: 'LIB', color: '#071740', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2335.png', prestige: 68, stars: 2, conference: 'CUSA', coachHotseat: 0, financials: { budget: 30000000, nilCollective: 5000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 1000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 0, streak: 0 }, roster: [], strategy: { offense: 'Option', defense: '3-4', aggression: 8, clockManagement: 'Aggressive', fourthDownTendency: 'Aggressive' } },
  { id: 't104', name: 'UNLV', nickname: 'Rebels', abbreviation: 'UNLV', color: '#CF0A2C', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2439.png', prestige: 65, stars: 2, conference: 'Mountain West', coachHotseat: 0, financials: { budget: 28000000, nilCollective: 4000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 2000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 0, streak: 0 }, roster: [], strategy: { offense: 'Air Raid', defense: '4-2-5', aggression: 7, clockManagement: 'Balanced', fourthDownTendency: 'Aggressive' } },
  { id: 't105', name: 'Memphis', nickname: 'Tigers', abbreviation: 'MEM', color: '#003087', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/235.png', prestige: 69, stars: 3, conference: 'AAC', coachHotseat: 20, financials: { budget: 32000000, nilCollective: 3000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 1200000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 0, streak: 0 }, roster: [], strategy: { offense: 'Spread', defense: '4-3', aggression: 6, clockManagement: 'Balanced', fourthDownTendency: 'Balanced' } },
  { id: 't106', name: 'Fresno State', nickname: 'Bulldogs', abbreviation: 'FRES', color: '#DB0032', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/278.png', prestige: 67, stars: 3, conference: 'Mountain West', coachHotseat: 10, financials: { budget: 28000000, nilCollective: 2000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 1000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 0, streak: 0 }, roster: [], strategy: { offense: 'Pro-Style', defense: '4-3', aggression: 5, clockManagement: 'Balanced', fourthDownTendency: 'Balanced' } },
  { id: 't107', name: 'UTSA', nickname: 'Roadrunners', abbreviation: 'UTSA', color: '#0C2340', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2636.png', prestige: 66, stars: 2, conference: 'AAC', coachHotseat: 5, financials: { budget: 27000000, nilCollective: 1500000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 1000000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 0, streak: 0 }, roster: [], strategy: { offense: 'Spread', defense: '3-4', aggression: 7, clockManagement: 'Balanced', fourthDownTendency: 'Balanced' } },
  { id: 't108', name: 'James Madison', nickname: 'Dukes', abbreviation: 'JMU', color: '#450084', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/256.png', prestige: 71, stars: 3, conference: 'Sun Belt', coachHotseat: 0, financials: { budget: 31000000, nilCollective: 2200000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 1100000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 0, streak: 0 }, roster: [], strategy: { offense: 'Spread', defense: '4-2-5', aggression: 6, clockManagement: 'Balanced', fourthDownTendency: 'Aggressive' } },
  { id: 't109', name: 'Coastal Carolina', nickname: 'Chanticleers', abbreviation: 'CCU', color: '#006991', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/324.png', prestige: 68, stars: 2, conference: 'Sun Belt', coachHotseat: 15, financials: { budget: 29000000, nilCollective: 1800000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 900000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 0, streak: 0 }, roster: [], strategy: { offense: 'Option', defense: '3-3-5', aggression: 7, clockManagement: 'Balanced', fourthDownTendency: 'Aggressive' } },
  { id: 't110', name: 'Toledo', nickname: 'Rockets', abbreviation: 'TOL', color: '#15397F', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2649.png', prestige: 64, stars: 2, conference: 'MAC', coachHotseat: 20, financials: { budget: 25000000, nilCollective: 1000000, revenueShareCap: 20000000, revenueShareAllocated: 0, marketingBudget: 800000 }, stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0, rank: 0, streak: 0 }, roster: [], strategy: { offense: 'Spread', defense: '4-3', aggression: 5, clockManagement: 'Balanced', fourthDownTendency: 'Balanced' } },
];
