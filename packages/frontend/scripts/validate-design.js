#!/usr/bin/env node

/**
 * Design System Validation Script
 * 
 * Validates frontend code compliance with design system guidelines
 * defined in docs/02-DESIGN-SYSTEM/
 * 
 * Usage: node scripts/validate-design.js [--json] [--fix-suggestions]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  scssComponentsDir: path.join(__dirname, '../src/styles/components'),
  scssTokensDir: path.join(__dirname, '../src/styles/tokens'),
  reactComponentsDir: path.join(__dirname, '../src/components'),
  outputJson: process.argv.includes('--json'),
  showSuggestions: process.argv.includes('--fix-suggestions'),
};

// Severity levels
const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// Results accumulator
const results = {
  violations: [],
  summary: {
    total: 0,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    byType: {},
    filesChecked: 0,
    filesWithViolations: 0,
  },
};

// ============================================================================
// SCSS Validation Rules
// ============================================================================

const SCSS_RULES = [
  {
    id: 'hardcoded-hex-color',
    name: 'Hardcoded Hex Color',
    description: 'Hex color values should use $color-* tokens',
    severity: SEVERITY.CRITICAL,
    // Match hex colors but exclude those in comments or token definitions
    pattern: /(?<!\/\/.*?)(?<!\/\*.*?)(?<!\$color-[\w-]+:\s*)#[0-9a-fA-F]{3,8}\b/g,
    suggestion: 'Replace with $color-* token (e.g., $color-primary, $color-white)',
    // Exclude token definition files
    excludeFiles: ['_colors.scss'],
  },
  {
    id: 'hardcoded-rgba',
    name: 'Hardcoded RGBA Value',
    description: 'RGBA values should use shadow/opacity tokens',
    severity: SEVERITY.MEDIUM,
    pattern: /rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g,
    suggestion: 'Create or use shadow token (e.g., $color-shadow-primary-xs)',
    excludeFiles: ['_colors.scss', '_opacity.scss'],
  },
  {
    id: 'white-keyword',
    name: 'White Keyword Used',
    description: 'Use $color-white instead of "white" keyword',
    severity: SEVERITY.HIGH,
    pattern: /(?<!\/\/.*?)(?<!\/\*.*?):\s*white\s*[;,)]/g,
    suggestion: 'Replace "white" with $color-white',
    excludeFiles: [],
  },
  {
    id: 'black-keyword',
    name: 'Black Keyword Used',
    description: 'Use $color-black or appropriate token instead of "black" keyword',
    severity: SEVERITY.HIGH,
    pattern: /(?<!\/\/.*?)(?<!\/\*.*?):\s*black\s*[;,)]/g,
    suggestion: 'Replace "black" with $color-black or appropriate token',
    excludeFiles: [],
  },
  {
    id: 'hardcoded-breakpoint',
    name: 'Hardcoded Breakpoint',
    description: 'Media queries should use breakpoint tokens or mixins',
    severity: SEVERITY.MEDIUM,
    pattern: /@media\s*\([^)]*(?:max-width|min-width)\s*:\s*\d+px/g,
    suggestion: 'Use @include respond-below($breakpoint-*) or $breakpoint-* variable',
    excludeFiles: ['_breakpoints.scss'],
  },
  {
    id: 'missing-token-import',
    name: 'Missing Token Import',
    description: 'Files using tokens must import them explicitly',
    severity: SEVERITY.CRITICAL,
    // Custom check - not pattern based
    customCheck: checkMissingTokenImports,
    excludeFiles: [],
  },
  {
    id: 'hardcoded-font-size-px',
    name: 'Hardcoded Font Size (px)',
    description: 'Font sizes should use $font-size-* tokens',
    severity: SEVERITY.MEDIUM,
    pattern: /font-size\s*:\s*\d+px/g,
    suggestion: 'Replace with $font-size-* token (xs, sm, md, lg, xl, etc.)',
    excludeFiles: ['_typography.scss'],
  },
  {
    id: 'hardcoded-font-size-rem',
    name: 'Hardcoded Font Size (rem)',
    description: 'Font sizes should use $font-size-* tokens instead of rem',
    severity: SEVERITY.MEDIUM,
    pattern: /font-size\s*:\s*[\d.]+rem/g,
    suggestion: 'Replace with $font-size-* token',
    excludeFiles: ['_typography.scss'],
  },
  {
    id: 'deprecated-scss-function',
    name: 'Deprecated SCSS Function',
    description: 'darken() and lighten() are deprecated, use color tokens',
    severity: SEVERITY.LOW,
    pattern: /(?:darken|lighten)\s*\(/g,
    suggestion: 'Create a color token instead of using darken()/lighten()',
    excludeFiles: [],
  },
];

// ============================================================================
// React Validation Rules
// ============================================================================

const REACT_RULES = [
  {
    id: 'inline-style',
    name: 'Inline Style',
    description: 'Inline styles should be avoided (except library-required)',
    severity: SEVERITY.MEDIUM,
    pattern: /style\s*=\s*\{\s*\{/g,
    suggestion: 'Move styles to SCSS file with BEM class naming',
    // Allow dynamic positioning for tooltips, DnD transforms
    allowedContexts: ['transform', 'top', 'left', 'right', 'bottom', 'position'],
    excludeFiles: [],
  },
  {
    id: 'non-bem-classname',
    name: 'Non-BEM Class Name in className',
    description: 'Class names should follow BEM convention',
    severity: SEVERITY.LOW,
    // Look for camelCase or PascalCase class names
    pattern: /className\s*=\s*["'`]([A-Z][a-zA-Z]+|[a-z]+[A-Z][a-zA-Z]*)\s*["'`]/g,
    suggestion: 'Use BEM naming: .block__element--modifier',
    excludeFiles: [],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

function getAllFiles(dir, extension, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllFiles(fullPath, extension, files);
    } else if (item.endsWith(extension)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

function isInComment(content, index) {
  const beforeMatch = content.substring(0, index);
  
  // Check for single-line comment
  const lastNewline = beforeMatch.lastIndexOf('\n');
  const currentLine = beforeMatch.substring(lastNewline + 1);
  if (currentLine.includes('//')) {
    return true;
  }
  
  // Check for multi-line comment
  const lastCommentStart = beforeMatch.lastIndexOf('/*');
  const lastCommentEnd = beforeMatch.lastIndexOf('*/');
  if (lastCommentStart > lastCommentEnd) {
    return true;
  }
  
  return false;
}

function checkMissingTokenImports(content, filePath) {
  const violations = [];
  const fileName = path.basename(filePath);
  
  // Token usage patterns and their required imports
  const tokenPatterns = [
    { usage: /\$color-/g, import: '@import \'../tokens/colors\'', token: 'colors' },
    { usage: /\$spacing-/g, import: '@import \'../tokens/spacing\'', token: 'spacing' },
    { usage: /\$font-(?:size|weight|family)/g, import: '@import \'../tokens/typography\'', token: 'typography' },
    { usage: /\$line-height-/g, import: '@import \'../tokens/typography\'', token: 'typography' },
    { usage: /\$letter-spacing-/g, import: '@import \'../tokens/typography\'', token: 'typography' },
    { usage: /\$border-radius/g, import: '@import \'../tokens/borders\'', token: 'borders' },
    { usage: /\$border-width/g, import: '@import \'../tokens/borders\'', token: 'borders' },
    { usage: /\$breakpoint-/g, import: '@import \'../tokens/breakpoints\'', token: 'breakpoints' },
    { usage: /\$opacity-/g, import: '@import \'../tokens/opacity\'', token: 'opacity' },
  ];
  
  const checkedTokens = new Set();
  
  for (const { usage, import: importPath, token } of tokenPatterns) {
    if (checkedTokens.has(token)) continue;
    
    const usageMatch = content.match(usage);
    if (usageMatch && usageMatch.length > 0) {
      // Check if import exists (various formats)
      const importPatterns = [
        new RegExp(`@import\\s+['"]\\.\\.\/tokens\\/${token}['"]`),
        new RegExp(`@import\\s+['"]\\.\\.\/tokens\\/_${token}['"]`),
        new RegExp(`@use\\s+['"]\\.\\.\/tokens\\/${token}['"]`),
      ];
      
      const hasImport = importPatterns.some(p => p.test(content));
      
      if (!hasImport) {
        // Check if file relies on cascade (has comment about it)
        const reliesOnCascade = /Token imports removed|using global imports|imports from main\.scss/i.test(content);
        
        violations.push({
          line: 1,
          match: `Uses $${token}-* tokens without explicit import`,
          reliesOnCascade,
        });
        checkedTokens.add(token);
      }
    }
  }
  
  return violations;
}

function addViolation(ruleId, ruleName, severity, filePath, line, match, suggestion) {
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  
  results.violations.push({
    ruleId,
    ruleName,
    severity,
    file: relativePath,
    line,
    match: match.trim().substring(0, 100),
    suggestion,
  });
  
  results.summary.total++;
  results.summary.bySeverity[severity]++;
  results.summary.byType[ruleId] = (results.summary.byType[ruleId] || 0) + 1;
}

// ============================================================================
// Validation Functions
// ============================================================================

function validateScssFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  let fileHasViolations = false;
  
  for (const rule of SCSS_RULES) {
    // Skip excluded files
    if (rule.excludeFiles && rule.excludeFiles.includes(fileName)) {
      continue;
    }
    
    if (rule.customCheck) {
      // Handle custom check
      const violations = rule.customCheck(content, filePath);
      for (const v of violations) {
        // Downgrade severity if file explicitly relies on cascade
        const effectiveSeverity = v.reliesOnCascade ? SEVERITY.MEDIUM : rule.severity;
        addViolation(
          rule.id,
          rule.name,
          effectiveSeverity,
          filePath,
          v.line,
          v.match,
          rule.suggestion || ''
        );
        fileHasViolations = true;
      }
    } else if (rule.pattern) {
      // Handle pattern-based check
      let match;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      
      while ((match = regex.exec(content)) !== null) {
        // Skip matches in comments
        if (isInComment(content, match.index)) {
          continue;
        }
        
        const line = getLineNumber(content, match.index);
        addViolation(
          rule.id,
          rule.name,
          rule.severity,
          filePath,
          line,
          match[0],
          rule.suggestion || ''
        );
        fileHasViolations = true;
      }
    }
  }
  
  if (fileHasViolations) {
    results.summary.filesWithViolations++;
  }
}

function validateReactFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  let fileHasViolations = false;
  
  // Skip test files
  if (fileName.includes('.test.') || fileName.includes('.spec.')) {
    return;
  }
  
  for (const rule of REACT_RULES) {
    if (rule.excludeFiles && rule.excludeFiles.includes(fileName)) {
      continue;
    }
    
    let match;
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    
    while ((match = regex.exec(content)) !== null) {
      const line = getLineNumber(content, match.index);
      
      // For inline styles, check if it's in an allowed context
      if (rule.id === 'inline-style' && rule.allowedContexts) {
        // Get surrounding context (20 chars before and after)
        const start = Math.max(0, match.index - 50);
        const end = Math.min(content.length, match.index + match[0].length + 100);
        const context = content.substring(start, end);
        
        // Skip if context contains allowed properties
        const isAllowed = rule.allowedContexts.some(ctx => 
          context.toLowerCase().includes(ctx.toLowerCase())
        );
        if (isAllowed) {
          continue;
        }
      }
      
      addViolation(
        rule.id,
        rule.name,
        rule.severity,
        filePath,
        line,
        match[0],
        rule.suggestion || ''
      );
      fileHasViolations = true;
    }
  }
  
  if (fileHasViolations) {
    results.summary.filesWithViolations++;
  }
}

// ============================================================================
// BEM Compliance Check
// ============================================================================

function checkBemCompliance() {
  const scssFiles = getAllFiles(CONFIG.scssComponentsDir, '.scss');
  
  for (const filePath of scssFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for PascalCase or camelCase class definitions
    const classPattern = /^\s*\.([A-Z][a-zA-Z]+|[a-z]+[A-Z][a-zA-Z]*)\s*\{/gm;
    let match;
    
    while ((match = classPattern.exec(content)) !== null) {
      if (isInComment(content, match.index)) continue;
      
      const line = getLineNumber(content, match.index);
      addViolation(
        'non-bem-class',
        'Non-BEM Class Definition',
        SEVERITY.LOW,
        filePath,
        line,
        `.${match[1]}`,
        'Use lowercase-hyphen naming: .my-component, .my-component__element'
      );
    }
  }
}

// ============================================================================
// Main Execution
// ============================================================================

function printResults() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║           DESIGN SYSTEM VALIDATION REPORT                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  // Summary
  console.log('📊 SUMMARY');
  console.log('─'.repeat(60));
  console.log(`   Files checked:        ${results.summary.filesChecked}`);
  console.log(`   Files with issues:    ${results.summary.filesWithViolations}`);
  console.log(`   Total violations:     ${results.summary.total}`);
  console.log('');
  
  // By severity
  console.log('📈 BY SEVERITY');
  console.log('─'.repeat(60));
  console.log(`   🔴 Critical:  ${results.summary.bySeverity.critical}`);
  console.log(`   🟠 High:      ${results.summary.bySeverity.high}`);
  console.log(`   🟡 Medium:    ${results.summary.bySeverity.medium}`);
  console.log(`   🔵 Low:       ${results.summary.bySeverity.low}`);
  console.log('');
  
  // By type
  console.log('📋 BY VIOLATION TYPE');
  console.log('─'.repeat(60));
  const sortedTypes = Object.entries(results.summary.byType)
    .sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sortedTypes) {
    console.log(`   ${type}: ${count}`);
  }
  console.log('');
  
  // Top files with most violations
  const fileViolations = {};
  for (const v of results.violations) {
    fileViolations[v.file] = (fileViolations[v.file] || 0) + 1;
  }
  const topFiles = Object.entries(fileViolations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  if (topFiles.length > 0) {
    console.log('🔥 TOP FILES NEEDING ATTENTION');
    console.log('─'.repeat(60));
    for (const [file, count] of topFiles) {
      const severityIcon = results.violations.find(v => v.file === file)?.severity === 'critical' ? '🔴' : '⚠️';
      console.log(`   ${severityIcon} ${file}: ${count} violations`);
    }
    console.log('');
  }
  
  // Critical violations detail
  const criticalViolations = results.violations.filter(v => v.severity === SEVERITY.CRITICAL);
  if (criticalViolations.length > 0) {
    console.log('🚨 CRITICAL VIOLATIONS (Require Immediate Fix)');
    console.log('─'.repeat(60));
    for (const v of criticalViolations.slice(0, 20)) {
      console.log(`   ${v.file}:${v.line}`);
      console.log(`      Rule: ${v.ruleName}`);
      console.log(`      Match: ${v.match}`);
      if (CONFIG.showSuggestions && v.suggestion) {
        console.log(`      Fix: ${v.suggestion}`);
      }
      console.log('');
    }
    if (criticalViolations.length > 20) {
      console.log(`   ... and ${criticalViolations.length - 20} more critical violations\n`);
    }
  }
  
  // High violations summary
  const highViolations = results.violations.filter(v => v.severity === SEVERITY.HIGH);
  if (highViolations.length > 0) {
    console.log('⚠️  HIGH SEVERITY VIOLATIONS');
    console.log('─'.repeat(60));
    for (const v of highViolations.slice(0, 10)) {
      console.log(`   ${v.file}:${v.line} - ${v.ruleName}`);
    }
    if (highViolations.length > 10) {
      console.log(`   ... and ${highViolations.length - 10} more high violations\n`);
    }
    console.log('');
  }
  
  // Compliance grade
  console.log('📊 COMPLIANCE GRADE');
  console.log('─'.repeat(60));
  const criticalCount = results.summary.bySeverity.critical;
  const highCount = results.summary.bySeverity.high;
  const totalViolations = results.summary.total;
  
  let grade, gradeEmoji;
  if (criticalCount === 0 && highCount === 0 && totalViolations <= 5) {
    grade = 'A'; gradeEmoji = '🏆';
  } else if (criticalCount === 0 && highCount <= 5) {
    grade = 'B'; gradeEmoji = '✅';
  } else if (criticalCount <= 5 && highCount <= 10) {
    grade = 'C'; gradeEmoji = '⚠️';
  } else if (criticalCount <= 10) {
    grade = 'D'; gradeEmoji = '❌';
  } else {
    grade = 'F'; gradeEmoji = '🚫';
  }
  
  console.log(`   ${gradeEmoji} Grade: ${grade}`);
  console.log('');
  
  // Pass/Fail
  const passed = criticalCount === 0 && highCount === 0;
  if (passed) {
    console.log('✅ VALIDATION PASSED - No critical or high severity issues\n');
  } else {
    console.log('❌ VALIDATION FAILED - Critical/High severity issues must be fixed\n');
  }
  
  return passed;
}

function main() {
  console.log('🔍 Starting Design System Validation...\n');
  
  // Validate SCSS files
  console.log('Checking SCSS components...');
  const scssFiles = getAllFiles(CONFIG.scssComponentsDir, '.scss');
  results.summary.filesChecked += scssFiles.length;
  
  for (const file of scssFiles) {
    validateScssFile(file);
  }
  console.log(`   ✓ Checked ${scssFiles.length} SCSS files`);
  
  // Validate React files
  console.log('Checking React components...');
  const reactFiles = getAllFiles(CONFIG.reactComponentsDir, '.tsx');
  results.summary.filesChecked += reactFiles.length;
  
  for (const file of reactFiles) {
    validateReactFile(file);
  }
  console.log(`   ✓ Checked ${reactFiles.length} React files`);
  
  // Check BEM compliance
  console.log('Checking BEM naming compliance...');
  checkBemCompliance();
  console.log('   ✓ BEM check complete');
  
  // Output results
  if (CONFIG.outputJson) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    const passed = printResults();
    process.exit(passed ? 0 : 1);
  }
}

main();
