SENTRY_RELEASE=$(sentry-cli releases propose-version)
sentry-cli releases new "$SENTRY_RELEASE" --org="$SENTRY_ORGANIZATION" --project="$SENTRY_CLOUD_PROJECT"
sentry-cli sourcemaps upload --org="$SENTRY_ORGANIZATION" --project="$SENTRY_CLOUD_PROJECT" --release="$SENTRY_RELEASE" dist
