#!/bin/bash

# Ensure backups directory exists
mkdir -p /backups

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="/backups/db_backup_$TIMESTAMP.sql"

# Using environment variables from docker-compose
if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_DB" ]; then
    echo "POSTGRES_USER and POSTGRES_DB must be set"
    exit 1
fi

echo "Starting database backup to $BACKUP_FILE..."

# Assuming this runs in a cron container or on the host using docker exec
# pg_dump -U $POSTGRES_USER -d $POSTGRES_DB > $BACKUP_FILE
docker exec -t sim-armada-postgres-1 pg_dump -U $POSTGRES_USER -d $POSTGRES_DB > $BACKUP_FILE

echo "Backup completed successfully."
