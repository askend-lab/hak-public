/**
 * Development-only Accessibility Checker
 * 
 * Integrates axe-core to run accessibility checks during development
 * and log violations to the console.
 * 
 * This module is only loaded in development mode.
 */

/**
 * Initialize accessibility checking in development mode
 * 
 * Call this in main.tsx for development builds:
 * 
 * ```tsx
 * if (import.meta.env.DEV) {
 *   import('./utils/a11y-dev').then(({ initA11yDevMode }) => {
 *     initA11yDevMode();
 *   });
 * }
 * ```
 */
export async function initA11yDevMode() {
  if (typeof window === 'undefined') return;
  
  try {
    const React = await import('react');
    const ReactDOM = await import('react-dom');
    const axe = await import('@axe-core/react');
    
    // Run axe after React renders
    axe.default(React.default, ReactDOM.default, 1000, {
      rules: [
        // Focus on WCAG 2.1 AA critical issues
        { id: 'color-contrast', enabled: true },
        { id: 'label', enabled: true },
        { id: 'button-name', enabled: true },
        { id: 'link-name', enabled: true },
        { id: 'image-alt', enabled: true },
        { id: 'aria-roles', enabled: true },
        { id: 'aria-valid-attr', enabled: true },
      ],
    });
    
    console.log('🔍 Accessibility checker enabled (axe-core)');
  } catch (error) {
    console.warn('Failed to initialize accessibility checker:', error);
  }
}

/**
 * Run a one-time accessibility audit on the current page
 * Useful for debugging specific components
 */
export async function runPageAudit() {
  try {
    const axeCore = await import('axe-core');
    
    const results = await axeCore.default.run(document.body, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
    
    if (results.violations.length > 0) {
      console.group('🚨 Accessibility Violations Found');
      results.violations.forEach(violation => {
        console.group(`[${violation.impact?.toUpperCase()}] ${violation.id}`);
        console.log('Description:', violation.description);
        console.log('Help:', violation.helpUrl);
        console.log('Affected elements:', violation.nodes.length);
        violation.nodes.forEach(node => {
          console.log('  -', node.html);
        });
        console.groupEnd();
      });
      console.groupEnd();
    } else {
      console.log('✅ No accessibility violations found!');
    }
    
    return results;
  } catch (error) {
    console.error('Failed to run accessibility audit:', error);
    return null;
  }
}

// Expose to window for manual testing in browser console
if (typeof window !== 'undefined') {
  (window as unknown as { runA11yAudit: typeof runPageAudit }).runA11yAudit = runPageAudit;
}
