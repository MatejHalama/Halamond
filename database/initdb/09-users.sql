CREATE USER "app_user" WITH PASSWORD 'Silneheslo1';

GRANT pg_read_all_data TO app_user;
GRANT pg_write_all_data TO app_user;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;
