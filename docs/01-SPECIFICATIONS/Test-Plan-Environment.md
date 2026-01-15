# Test Plan - Environment

## 3. Test Environment

### 3.1 Prerequisites

| Component | Requirement |
|-----------|-------------|
| **Browser** | Chrome 100+, Firefox 100+, Safari 15+, Edge 100+ |
| **Audio** | Browser audio enabled, speakers/headphones connected |
| **Network** | Stable internet connection for API calls |
| **Backend Services** | Vabamorf (port 8001), Merlin TTS (port 8002) |

### 3.2 Test Data

Estonian test phrases are documented in [04-TEST-DATA/estonian-phrases.md](04-TEST-DATA/estonian-phrases.md).

Key test phrases:
- Single word: `Tere`, `kooli`, `peeti`
- Simple sentence: `Tere päevast`, `Noormees läks kooli`
- Palatalization: `Mees peeti kinni`
- Compound word: `kolmapäeval`
- Long text: Poems or paragraphs (>100 words)

### 3.3 Test Accounts

| Account Type | Isikukood | Purpose |
|--------------|-----------|---------|
| Test User 1 | `39901010011` | Standard user testing |
| Test User 2 | `49901010012` | Multi-user testing |
| Invalid | `12345678901` | Error handling testing |

---

## Appendix: Quick Reference

### Test Case Execution Checklist

- [ ] Environment ready (app loaded, services running)
- [ ] Audio enabled in browser
- [ ] Test data available
- [ ] Previous session logged out / cleared

### Browser Compatibility Matrix

| Browser | Windows | macOS | Notes |
|---------|---------|-------|-------|
| Chrome | Yes | Yes | Primary test browser |
| Firefox | Yes | Yes | Secondary |
| Safari | N/A | Yes | macOS only |
| Edge | Yes | Yes | Windows primary |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analyze` | POST | Vabamorf morphological analysis |
| `/api/synthesize` | POST | Merlin TTS audio generation |
| `/api/variants` | POST | Pronunciation variants |
| `/api/feedback` | POST | Submit user feedback |

---

**See also:**
- [Test Plan Overview](./Test-Plan-Overview.md)
- [Test Strategy](./Test-Plan-Strategy.md)
- [Test Execution](./Test-Plan-Execution.md)
