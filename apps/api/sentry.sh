SENTRY_RELEASE=$(sentry-cli releases propose-version)
sentry-cli releases new "$SENTRY_RELEASE" --org="$SENTRY_ORGANIZATION" --project="$SENTRY_API_PROJECT"
sentry-cli sourcemaps upload --org="$SENTRY_ORGANIZATION" --project="$SENTRY_API_PROJECT" --release="$SENTRY_RELEASE" --strip-prefix="dist/.." dist
