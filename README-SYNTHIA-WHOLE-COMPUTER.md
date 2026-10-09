# Synthia Whole Computer APK Build

This branch preserves the existing `Apk` repository and adds a separate build path for the assembled Synthia computer.

## Outputs

GitHub Actions builds two APK artifacts:

- **Synthia-Whole-Computer.apk** — Resonance Computer v11 browser/phone shell with the Whole Computer bridge sidecar.
- **SynthWorld-321.apk** — the embodied Godot SynthWorld/Cynthia runtime from `justappgrabbin/SYNTHWORLD-`, branch `synthia-whole-computer-v1-apk`.

The v11 HTML is stored as ordered source chunks because the GitHub connector cannot reliably write a 4.5 MB text file in one request. The workflow concatenates the chunks and verifies the exact assembled SHA-256 before compiling the APK:

`9c920db52181e5386d76f721f8af87569877093589a4504a109e1e140f422b6f`

No existing main-branch files were deleted or overwritten.
