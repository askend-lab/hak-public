# Frontend Performance Audit

**Scope:** Client-side performance, loading speed, rendering, optimization

## Core Web Vitals

- [ ] Largest Contentful Paint (LCP) under 2.5s
- [ ] First Input Delay (FID) under 100ms
- [ ] Cumulative Layout Shift (CLS) under 0.1
- [ ] Interaction to Next Paint (INP) under 200ms
- [ ] Core Web Vitals tracked in monitoring
- [ ] Core Web Vitals meet targets for 75th percentile
- [ ] Performance budget defined for Core Web Vitals

## Loading Performance

- [ ] First Contentful Paint (FCP) under 1.8s
- [ ] Time to Interactive (TTI) under 3.8s
- [ ] Speed Index under 3.4s
- [ ] Total Blocking Time (TBT) under 200ms
- [ ] Page load time under 3s on 3G
- [ ] DOMContentLoaded event timing acceptable
- [ ] Window load event timing acceptable

## Bundle Size

- [ ] Initial bundle size under 200KB (gzipped)
- [ ] Total JavaScript under 500KB (gzipped)
- [ ] Bundle size tracked over time
- [ ] Bundle size budget enforced in CI
- [ ] Vendor bundles separated from app code
- [ ] Bundle analyzer used regularly
- [ ] Unused code eliminated

## Code Splitting

- [ ] Route-based code splitting implemented
- [ ] Component lazy loading implemented
- [ ] Vendor code split into separate chunk
- [ ] Common code extracted into shared chunks
- [ ] Dynamic imports used for heavy components
- [ ] Code splitting strategy documented
- [ ] Chunk sizes reasonable (<100KB each)

## Asset Optimization

- [ ] Images compressed and optimized
- [ ] WebP/AVIF formats used with fallbacks
- [ ] Image dimensions specified (width/height)
- [ ] Responsive images with srcset
- [ ] Image lazy loading implemented
- [ ] SVGs optimized and minified
- [ ] Icon sprites or icon fonts used efficiently
- [ ] Fonts subset and optimized (woff2)
- [ ] Font preloading for critical fonts
- [ ] CSS minified in production
- [ ] JavaScript minified in production

## Caching Strategy

- [ ] Cache-Control headers configured
- [ ] Service Worker for caching (if PWA)
- [ ] Asset versioning/hashing for long-term caching
- [ ] HTML not cached aggressively
- [ ] Static assets cached with long TTL
- [ ] CDN caching configured
- [ ] Cache invalidation strategy defined
- [ ] Stale-while-revalidate used appropriately

## Network Optimization

- [ ] HTTP/2 or HTTP/3 enabled
- [ ] Compression enabled (gzip/brotli)
- [ ] Number of requests minimized
- [ ] Critical resources prioritized
- [ ] Resource hints used (preload, prefetch, preconnect)
- [ ] DNS prefetch for third-party domains
- [ ] Keep-alive connections enabled
- [ ] CDN used for static assets

## Critical Path Optimization

- [ ] Critical CSS inlined
- [ ] Above-the-fold content prioritized
- [ ] Render-blocking resources minimized
- [ ] JavaScript deferred or async
- [ ] Non-critical CSS loaded asynchronously
- [ ] Critical fonts preloaded
- [ ] Progressive enhancement implemented

## JavaScript Performance

- [ ] JavaScript execution time optimized
- [ ] Long tasks under 50ms
- [ ] Heavy computations moved to Web Workers
- [ ] Event listeners optimized (debounce/throttle)
- [ ] Unnecessary re-renders prevented (React.memo, etc.)
- [ ] Virtual scrolling for long lists
- [ ] Infinite scroll pagination optimized
- [ ] Third-party scripts loaded asynchronously
- [ ] Polyfills only loaded when needed

## CSS Performance

- [ ] CSS file size under 50KB (gzipped)
- [ ] Unused CSS removed (PurgeCSS, etc.)
- [ ] CSS-in-JS performance considered
- [ ] Critical CSS extracted and inlined
- [ ] CSS animations use transform/opacity
- [ ] Will-change used sparingly
- [ ] CSS containment used where appropriate

## Rendering Performance

- [ ] 60fps maintained during scrolling
- [ ] 60fps maintained during animations
- [ ] Layout thrashing avoided
- [ ] Forced synchronous layouts avoided
- [ ] Reflows minimized
- [ ] Repaints minimized
- [ ] GPU acceleration used appropriately
- [ ] RequestAnimationFrame for animations
- [ ] Intersection Observer for lazy loading

## React/Vue/Framework Performance

- [ ] Component re-renders minimized
- [ ] Memoization used appropriately
- [ ] Virtual DOM updates optimized
- [ ] Keys used correctly in lists
- [ ] Large lists virtualized
- [ ] Conditional rendering optimized
- [ ] State management efficient
- [ ] Context usage optimized (not over-used)
- [ ] Production build used in deployment

## Third-Party Scripts

- [ ] Third-party scripts loaded asynchronously
- [ ] Third-party script impact measured
- [ ] Unnecessary third-party scripts removed
- [ ] Third-party scripts use defer/async
- [ ] Google Tag Manager used for script management
- [ ] Analytics scripts optimized
- [ ] Chat widgets loaded on-demand
- [ ] Social media widgets optimized

## Font Loading

- [ ] Font loading strategy implemented (FOUT/FOIT)
- [ ] System fonts used as fallback
- [ ] Font-display: swap used
- [ ] Variable fonts considered
- [ ] Font subsetting implemented
- [ ] Only necessary font weights loaded
- [ ] Web fonts preloaded
- [ ] Local fonts checked first

## Mobile Performance

- [ ] Performance tested on real devices
- [ ] Performance acceptable on mid-range devices
- [ ] Touch interactions responsive (<100ms)
- [ ] Scrolling smooth on mobile
- [ ] Mobile network conditions tested (3G/4G)
- [ ] Battery consumption considered
- [ ] Mobile CPU usage optimized
- [ ] Adaptive loading based on connection

## Memory Management

- [ ] Memory leaks identified and fixed
- [ ] Event listeners cleaned up
- [ ] DOM references released
- [ ] Timers/intervals cleared
- [ ] Memory usage profiled
- [ ] Large object disposal optimized
- [ ] Memory growth over time monitored

## Build Optimization

- [ ] Production builds use minification
- [ ] Tree shaking configured
- [ ] Dead code elimination enabled
- [ ] Source maps generated for debugging
- [ ] Build process optimized (<5min)
- [ ] Incremental builds enabled
- [ ] Build cache utilized

## Monitoring & Measurement

- [ ] Real User Monitoring (RUM) implemented
- [ ] Lighthouse CI in pipeline
- [ ] Performance metrics tracked over time
- [ ] Performance regression detected automatically
- [ ] Field data collected and analyzed
- [ ] Lab data (Lighthouse) tracked
- [ ] User journey performance tracked
- [ ] Performance dashboard available

## Performance Budget

- [ ] Performance budget defined
- [ ] Budget includes all critical metrics
- [ ] Budget violations fail CI build
- [ ] Budget reviewed and adjusted regularly
- [ ] Team aware of performance budget
- [ ] Performance impact considered for new features

## Progressive Enhancement

- [ ] Core functionality works without JavaScript
- [ ] Enhanced experience with JavaScript
- [ ] Graceful degradation for old browsers
- [ ] Feature detection used (not browser sniffing)
- [ ] Polyfills loaded conditionally

## Service Worker (if PWA)

- [ ] Service Worker caching strategy optimized
- [ ] Stale-while-revalidate for dynamic content
- [ ] Cache-first for static assets
- [ ] Network-first for API calls (or appropriate strategy)
- [ ] Service Worker updates handled gracefully
- [ ] Offline fallback page provided
- [ ] Background sync for offline actions

## Resource Prioritization

- [ ] Critical resources have high priority
- [ ] Preload for critical assets
- [ ] Prefetch for likely next navigation
- [ ] Preconnect for third-party origins
- [ ] Priority hints used (importance attribute)
- [ ] Lazy loading for below-the-fold content

## API Call Optimization

- [ ] API calls batched where possible
- [ ] API responses cached appropriately
- [ ] Unnecessary API calls eliminated
- [ ] API call waterfalls avoided
- [ ] GraphQL queries optimized (no over-fetching)
- [ ] Debouncing for search/autocomplete
- [ ] Request deduplication implemented

## State Management Performance

- [ ] State updates batched
- [ ] Unnecessary state updates avoided
- [ ] Selectors memoized
- [ ] Large state trees optimized
- [ ] State normalization considered
- [ ] Context splitting for performance

## Animation Performance

- [ ] Animations use transform and opacity
- [ ] Will-change used judiciously
- [ ] Animation frame budget maintained
- [ ] Reduced motion preference respected
- [ ] Animations run on compositor thread
- [ ] Complex animations use Web Animations API

## Profiling & Testing

- [ ] Chrome DevTools Performance profiling regular
- [ ] Lighthouse audits run regularly
- [ ] WebPageTest used for detailed analysis
- [ ] Performance testing automated in CI
- [ ] Slow network conditions tested
- [ ] CPU throttling tested
- [ ] Performance testing on various devices

## Review & Audit

**Date:** ___________  
**Auditor:** ___________  
**Status:** ⬜ Pass ⬜ Pass with Issues ⬜ Fail  
**Next Review:** ___________  

**Lighthouse Score:** _____/100  

**Core Web Vitals:**
- LCP: _____ s
- FID: _____ ms  
- CLS: _____

**Bundle Size:**
- Initial: _____ KB (gzipped)
- Total: _____ KB (gzipped)

**Critical Issues:**
- 

**Optimization Opportunities:**
- 

**Action Items:**
- 
