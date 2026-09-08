FROM flyway/flyway:13.2.0@sha256:cbd95910e0175318456b6e9927b04dd31f51c0e153ab573bf546964978bd3e30

# Bake SQL into the image; no Docker Desktop source bind mounts are required.
COPY migrations /flyway/sql
ENV FLYWAY_LOCATIONS=filesystem:/flyway/sql \
    FLYWAY_DEFAULT_SCHEMA=startrack \
    FLYWAY_SCHEMAS=startrack,public \
    FLYWAY_BASELINE_ON_MIGRATE=false \
    FLYWAY_CLEAN_DISABLED=true \
    FLYWAY_VALIDATE_MIGRATION_NAMING=true
CMD ["migrate"]
