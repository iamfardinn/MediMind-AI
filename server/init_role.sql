-- Already created: role and database
-- Run this to fix schema permissions:
GRANT ALL ON SCHEMA public TO "arthur-morgan";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "arthur-morgan";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "arthur-morgan";
