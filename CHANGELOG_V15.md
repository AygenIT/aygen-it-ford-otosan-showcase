# V15 — Transition Performance Pass

- Replaced the multi-layer moving curtain with a single compositor-friendly cinematic fade.
- Reduced transition lock time from 980 ms to 660 ms and moved the hidden slide commit to 245 ms.
- Removed animated blur filters from slide reveals; transitions now use opacity and transform only.
- Paused continuous decorative animation and disabled backdrop blur during the short chapter change.
- Added background decoding and adjacent-slide prewarming.
- Added optimized JPEG derivatives for all three generated scenes.
- Reduced the active cinematic background payload from 5,482,903 bytes to 602,502 bytes (about 89%).
- Verified forward and reverse navigation without runtime exceptions.
