#!/usr/bin/env bun

import { spawn } from 'bun';
import { readFile, writeFile } from 'fs/promises';
import { parse } from 'acorn';

// ANSI color codes for terminal flair
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

// ASCII art templates
const asciiTemplates = [
  `
  ${colors.red}💥 BOOM! 💥${colors.reset}
  /\\_/\\
 ( o.o ) 
  > ^ <
Error: ~ERROR~ went nuclear!
  `,
  `
  ${colors.cyan}🔥 CRASH! 🔥${colors.reset}
  ~~~~~
  (x_x)
  ~~~~~
~ERROR~ just yeeted itself!
  `,
  `
  ${colors.green}🦄 UNICORN CRASH! 🦄${colors.reset}
  *-*-*
  >\\/7
~ERROR~ galloped into chaos!
  `,
];

// Meme quips and remixes
const memeQuips = [
  "undefined is not a function, but my vibes are!",
  "YOLO: You Only Leak Objects!",
  "Segmentation Fault? More like Segmentation FUN!",
];
const errorRemixes = [
  "Try adding YOLO() to fix it!",
  "Wrap it in a try-catch hug! 🤗",
  "Delete node_modules and pray 🙏",
];

// Main CLI function
async function crashCraft(filePath: string, chaosMode: boolean = false, superChaos: boolean = false, outputFile?: string) {
  try {
    // Read the input JS file
    const code = await readFile(filePath, 'utf-8');

    // Try parsing to catch syntax errors
    let errorMsg = '';
    try {
      parse(code, { ecmaVersion: 'latest' });
    } catch (syntaxError: any) {
      errorMsg = syntaxError.message;
    }

    // Run the file with Bun and capture stderr
    if (!errorMsg) {
      const proc = spawn(['bun', 'run', filePath], { stderr: 'pipe' });
      const stderr = await new Response(proc.stderr).text();
      await proc.exited;
      if (proc.exitCode !== 0 && stderr) {
        errorMsg = stderr.split('\n')[0];
      }
    }

    if (!errorMsg) {
      return "No crash? Boring! Try breaking it harder! 😜";
    }

    // Fetch a meme quote for superchaos mode
    let apiQuote = '';
    if (superChaos) {
      try {
        const res = await fetch('https://ron-swanson-quotes.herokuapp.com/v2/quotes');
        apiQuote = (await res.json())[0] || 'API crashed, but we keep going!';
      } catch {
        apiQuote = 'API went 404, pure chaos!';
      }
    }

    const output = generateChaosOutput(errorMsg, chaosMode, superChaos, apiQuote);
    
    // Save to file if specified
    if (outputFile) {
      await writeFile(outputFile, output.replace(/\x1b\[[0-9;]*m/g, '')); // Strip ANSI for file
      return `${output}\nSaved chaos to ${outputFile}!`;
    }
    return output;
  } catch (e: any) {
    return generateChaosOutput(e.message, chaosMode, superChaos, '');
  }
}

// Generate chaotic output
function generateChaosOutput(error: string, chaosMode: boolean, superChaos: boolean, apiQuote: string): string {
  const rand = Math.random();
  let output = '';

  // Chaos mode: Scramble error message
  if (chaosMode || superChaos) {
    error = error
      .split('')
      .map((c, i) => (Math.random() < 0.15 ? String.fromCharCode(c.charCodeAt(0) + Math.floor(Math.random() * 3)) : c))
      .join('');
  }

  // Superchaos: Chain outputs and add colors
  if (superChaos) {
    const allTemplates = asciiTemplates.join('\n');
    output = `${colors.cyan}${allTemplates.replace('~ERROR~', error)}${colors.reset}\n`;
    output += `${colors.green}💾 Glitch Poetry 💾${colors.reset}\nError: ${error}\n`;
    output += `Quip: ${memeQuips[Math.floor(Math.random() * memeQuips.length)]}\n`;
    output += `Ron Says: ${apiQuote}\n`;
    output += `Fix?: ${errorRemixes[Math.floor(Math.random() * errorRemixes.length)]}\n`;
    output += 'SUPERCHAOS: Reality imploded! 💥';
  } else {
    // Normal or chaos mode: Pick one output
    const template = asciiTemplates[Math.floor(rand * asciiTemplates.length)];
    if (rand > 0.5) {
      output = template.replace('~ERROR~', error);
    } else {
      output = `${colors.green}💾 Glitch Poetry 💾${colors.reset}\nError: ${error}\n`;
      output += `Quip: ${memeQuips[Math.floor(Math.random() * memeQuips.length)]}\n`;
      if (chaosMode) output += 'CHAOS MODE: Reality corrupted!';
    }
  }

  return output;
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);
  const filePath = args[0];
  const chaosMode = args.includes('--chaos');
  const superChaos = args.includes('--superchaos');
  const outputFile = args.includes('--output') ? args[args.indexOf('--output') + 1] : undefined;

  if (!filePath) {
    console.log('Usage: bun run crashcraft.ts <file.js> [--chaos] [--superchaos] [--output <file>]');
    process.exit(1);
  }

  const output = await crashCraft(filePath, chaosMode, superChaos, outputFile);
  console.log(output);
}

main();