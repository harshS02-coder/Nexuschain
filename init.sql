-- Allow root from any host
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'rootpass';
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'rootpass';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Create app user with proper host permissions
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED WITH mysql_native_password BY 'pass';
CREATE USER IF NOT EXISTS 'user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pass';
GRANT ALL PRIVILEGES ON nexuschain.* TO 'user'@'%';
GRANT ALL PRIVILEGES ON nexuschain.* TO 'user'@'localhost';

FLUSH PRIVILEGES;
