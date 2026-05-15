const fs = require('fs');

const files = [
  'index.html',
  'App.tsx',
  'components/FinancialPanel.tsx',
  'components/PlayerCard.tsx',
  'components/RecruitingBoard.tsx',
  'components/StrategyPanel.tsx',
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf-8');
  content = content.replace(/dark:bg-slate-900/g, 'dark:bg-[#111111]');
  content = content.replace(/dark:bg-slate-800/g, 'dark:bg-[#1a1a1a]');
  content = content.replace(/dark:border-slate-800/g, 'dark:border-[#2a2a2a]');
  content = content.replace(/dark:border-slate-700/g, 'dark:border-[#333333]');
  
  // They explicitly said change bg-slate-900 to a dark gray color
  content = content.replace(/\bbg-slate-900\b/g, 'bg-[#111111]');
  
  fs.writeFileSync(f, content, 'utf-8');
});

console.log("Done replace");
