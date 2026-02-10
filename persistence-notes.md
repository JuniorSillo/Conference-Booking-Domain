# Persistence & Schema Evolution Notes – Assignment 3.2

## Why removing a column is more dangerous than adding one

Removing a column deletes data permanently. If the column had values, they are lost forever unless backed up.  
Adding a column is safe: existing rows get NULL (if nullable) or a default value (if non-nullable with default).  
In production, removing columns usually requires data migration scripts to preserve values elsewhere.

## Why migrations are preferred over manual SQL changes

Migrations are:
- Version-controlled (code = schema history)
- Repeatable (same changes on dev, staging, prod)
- Safe (EF generates SQL and can rollback)
- Team-safe (multiple developers can merge migrations)
Manual SQL is error-prone, not tracked, and breaks when environments differ.

## What could go wrong if two developers modify schema without migrations?

- Migration conflicts (two people add same column differently)
- Out-of-sync databases (dev has column, prod doesn't)
- Data loss (someone drops column manually)
- Production downtime (manual SQL in live DB)
- No audit trail (who changed what, when)

## Which schema changes in this assignment would be risky in production?

- Adding non-nullable columns without default, then fails if table has rows (we made Capacity nullable or added default)
- Changing column types (e.g., int to string) to data conversion errors
- Dropping tables/columns results in permanent data loss (we avoided this)

