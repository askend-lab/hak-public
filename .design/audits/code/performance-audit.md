# Performance Audit

**Scope:** Application performance, bottlenecks, optimization

## Performance Metrics

- [ ] Performance metrics defined (response time, throughput, etc.)
- [ ] Performance baselines established
- [ ] Performance targets defined (SLOs)
- [ ] Performance monitored continuously
- [ ] Performance regression detection automated
- [ ] Apdex score tracked (if applicable)
- [ ] Core Web Vitals tracked (frontend)
- [ ] Performance dashboard available

## Backend Performance

- [ ] API response times under target (<200ms for simple queries)
- [ ] Database query performance optimized
- [ ] N+1 query problems eliminated
- [ ] Slow queries identified and optimized
- [ ] Connection pooling configured
- [ ] Caching implemented where appropriate
- [ ] Background jobs for heavy operations
- [ ] Async processing where possible
- [ ] Resource-intensive operations optimized

## Database Performance

- [ ] Indexes created for frequently queried columns
- [ ] Query execution plans reviewed
- [ ] Unnecessary joins eliminated
- [ ] Query result caching implemented
- [ ] Database connection pool sized appropriately
- [ ] Read replicas used for read-heavy workloads
- [ ] Query timeout configured
- [ ] Database statistics updated regularly
- [ ] Partitioning used for large tables (if applicable)
- [ ] Materialized views used where appropriate

## API Performance

- [ ] API endpoints profiled for performance
- [ ] Payload sizes minimized
- [ ] Pagination implemented for large result sets
- [ ] GraphQL query complexity limited
- [ ] Response compression enabled (gzip/brotli)
- [ ] Unnecessary data not returned
- [ ] Eager loading prevents N+1 queries
- [ ] API caching headers configured
- [ ] Rate limiting prevents abuse

## Frontend Performance

- [ ] Bundle size optimized (<250KB initial load target)
- [ ] Code splitting implemented
- [ ] Lazy loading for routes/components
- [ ] Images optimized and compressed
- [ ] Critical CSS inlined
- [ ] JavaScript deferred/async loaded
- [ ] Third-party scripts loaded efficiently
- [ ] Service worker for caching (if PWA)
- [ ] Tree shaking configured
- [ ] Dead code eliminated

## Loading Performance

- [ ] First Contentful Paint (FCP) under 1.8s
- [ ] Largest Contentful Paint (LCP) under 2.5s
- [ ] Time to Interactive (TTI) under 3.8s
- [ ] Total Blocking Time (TBT) under 200ms
- [ ] Cumulative Layout Shift (CLS) under 0.1
- [ ] Page load time acceptable (<3s)
- [ ] Above-the-fold content loads first
- [ ] Loading indicators shown for async operations

## Rendering Performance

- [ ] Render-blocking resources minimized
- [ ] Reflows and repaints minimized
- [ ] Virtual scrolling for long lists
- [ ] Debouncing/throttling for frequent events
- [ ] RequestAnimationFrame used for animations
- [ ] GPU acceleration used appropriately
- [ ] 60fps maintained during interactions
- [ ] Layout thrashing avoided

## Network Performance

- [ ] HTTP/2 or HTTP/3 used
- [ ] Keep-alive connections enabled
- [ ] CDN used for static assets
- [ ] Assets cached with appropriate headers
- [ ] DNS prefetch/preconnect used
- [ ] Resource hints (preload, prefetch) used
- [ ] Minimize number of HTTP requests
- [ ] WebSocket connections managed efficiently

## Caching Strategy

- [ ] Browser caching configured (Cache-Control headers)
- [ ] CDN caching configured
- [ ] Server-side caching implemented (Redis, Memcached)
- [ ] Cache invalidation strategy defined
- [ ] Stale-while-revalidate used where appropriate
- [ ] Cache hit rate monitored
- [ ] Cache warming considered for critical data
- [ ] Cache stampede prevented

## Memory Management

- [ ] Memory leaks identified and fixed
- [ ] Memory usage monitored
- [ ] Garbage collection tuned (if applicable)
- [ ] Large objects released promptly
- [ ] Event listeners cleaned up
- [ ] Heap size appropriate
- [ ] Memory profiling performed regularly

## Compute Optimization

- [ ] CPU-intensive operations profiled
- [ ] Algorithms optimized (O(n) vs O(n²))
- [ ] Unnecessary computations eliminated
- [ ] Results memoized where appropriate
- [ ] Web Workers used for heavy computation (frontend)
- [ ] Batch processing for bulk operations
- [ ] Parallel processing where possible

## Lambda/Serverless Performance

- [ ] Lambda memory allocation optimized
- [ ] Cold start time minimized
- [ ] Lambda execution time optimized
- [ ] Provisioned concurrency for critical functions
- [ ] Lambda layers used for shared dependencies
- [ ] VPC configuration necessary (or removed for speed)
- [ ] Lambda timeout appropriate

## Asset Optimization

- [ ] Images compressed and optimized
- [ ] Modern image formats used (WebP, AVIF)
- [ ] Responsive images with srcset
- [ ] Image lazy loading implemented
- [ ] SVGs optimized and minified
- [ ] Fonts optimized (subset, woff2)
- [ ] Font loading strategy implemented (FOUT/FOIT)
- [ ] Unnecessary assets removed

## Build Optimization

- [ ] Production builds minified
- [ ] Source maps generated for debugging
- [ ] Vendor bundles separated
- [ ] Long-term caching with content hashes
- [ ] Build time acceptable (<5 min)
- [ ] Incremental builds configured
- [ ] Build artifacts cached

## Third-Party Performance

- [ ] Third-party scripts impact measured
- [ ] Third-party scripts loaded asynchronously
- [ ] Third-party script alternatives evaluated
- [ ] Unnecessary third-party scripts removed
- [ ] Self-hosting considered for critical scripts
- [ ] Third-party content cached locally

## Mobile Performance

- [ ] Performance tested on mobile devices
- [ ] Performance acceptable on 3G networks
- [ ] Touch interactions responsive
- [ ] Battery consumption considered
- [ ] Mobile-specific optimizations applied
- [ ] Adaptive loading based on network conditions

## Load Testing

- [ ] Load tests performed regularly
- [ ] Expected load defined and tested
- [ ] Peak load tested
- [ ] Load test results documented
- [ ] Bottlenecks identified under load
- [ ] Auto-scaling triggers tested
- [ ] System capacity known

## Profiling & Benchmarking

- [ ] Performance profiling done regularly
- [ ] Profiling tools used (Chrome DevTools, etc.)
- [ ] Bottlenecks identified via profiling
- [ ] Benchmarks for critical operations
- [ ] Performance comparisons before/after changes
- [ ] Continuous benchmarking in CI

## Monitoring & Alerting

- [ ] Real User Monitoring (RUM) implemented
- [ ] Synthetic monitoring configured
- [ ] Performance metrics in dashboard
- [ ] Slow query alerts configured
- [ ] Performance degradation alerts configured
- [ ] Apdex alerts configured
- [ ] Performance trends analyzed

## Review & Audit

**Date:** ___________  
**Auditor:** ___________  
**Status:** ⬜ Pass ⬜ Pass with Issues ⬜ Fail  
**Next Review:** ___________  

**Performance Metrics:**
- Average Response Time: _____ ms
- p95 Response Time: _____ ms
- p99 Response Time: _____ ms
- Throughput: _____ req/s
- Error Rate: _____%

**Bottlenecks Identified:**
- 

**Optimization Opportunities:**
- 

**Action Items:**
- 
