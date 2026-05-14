# Biome plugins

Project-local Biome rules live here as GritQL plugins:

- `no-cross-package-alias.grit`
- `lucide-icon-suffix.grit`

They are registered from the root `biome.jsonc`.

Biome's current plugin API can register diagnostics from GritQL patterns, but it
does not support JavaScript rule callbacks, custom fixes, or dynamic message
interpolation like ESLint rule context data.
