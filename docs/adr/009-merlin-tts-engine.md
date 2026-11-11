# ADR 009: Merlin TTS Engine for Estonian Speech Synthesis

**Status:** Accepted
**Date:** 2026-04-06
**Author:** Kate (AI Agent)

## Context

HAK requires text-to-speech synthesis for Estonian language. The TTS engine must:
- Support Estonian phonetics and prosody
- Produce natural-sounding speech
- Be deployable as a Docker container

## Decision

We use **Merlin TTS** with a pre-trained Estonian model provided by EKI (Institute of the Estonian Language).

## Rationale

### Why Merlin?

1. **Pre-trained Estonian model exists** — EKI trained a Merlin model specifically for Estonian. No other TTS engine has a comparable Estonian model available.

2. **Model training is out of scope** — Training a new TTS model requires:
   - Large Estonian speech corpus (100+ hours)
   - GPU infrastructure for training (weeks/months)
   - Phonetic expertise for Estonian
   - This is research work, not application development.

3. **Quality is acceptable** — The EKI model produces intelligible Estonian speech suitable for language learning.

### Why not modern alternatives?

| Engine | Problem |
|--------|---------|
| Coqui TTS | No pre-trained Estonian model |
| VITS | No pre-trained Estonian model |
| Tacotron 2 | No pre-trained Estonian model |
| Google TTS | Proprietary, no Estonian |
| Amazon Polly | No Estonian voice |
| Azure TTS | Estonian available but proprietary |

All modern open-source TTS engines require training a model from scratch for Estonian.

### Known limitations

- Merlin is from 2016 — older architecture
- Synthesis is slower than modern neural TTS
- Voice quality is not state-of-the-art
- Single voice only (female)

## Consequences

### Positive

- Working Estonian TTS without training infrastructure
- Open-source, no API costs
- Deployable as Docker container on ECS

### Negative

- Legacy codebase (Python 2 → 3 migration done)
- Conda environment required
- Slower than modern alternatives
- Single voice option

### Future considerations

If a better Estonian TTS model becomes available:
1. The `tts-worker` is isolated — can be replaced independently
2. API contract (`/synthesize`, `/status`) remains stable
3. Frontend doesn't need changes

## References

- [Merlin Speech Synthesis](https://github.com/CSTR-Edinburgh/merlin)
- [EKI (Institute of the Estonian Language)](https://www.eki.ee/)
- HAK `packages/tts-worker/` implementation
