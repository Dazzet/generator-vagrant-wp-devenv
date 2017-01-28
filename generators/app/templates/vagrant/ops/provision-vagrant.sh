#|/bin/bash

# Instalación y configuración de linux

# Variables
DBRPASS=root
DOMAIN="<%= projectName %>.dev"

# Ejecuta un comando como el usuario www-data que es el usuario dueño del servicio nginx
function runAs() {
    sudo -H -u www-data bash -c "$*"
}

# Especificamos usuario y contraseña por defecto para mysql/mariadb
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password password ${DBRPASS}"
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password_again password ${DBRPASS}"
sudo debconf-set-selections <<< "mariadb-server mariadb-server/root_password password ${DBRPASS}"
sudo debconf-set-selections <<< "mariadb-server mariadb-server/root_password_again password ${DBRPASS}"
sudo debconf-set-selections <<< "postfix postfix/mailname string ${DOMAIN}"
sudo debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"

# Add MariaDB repo
sudo apt-get install software-properties-common
sudo apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xcbcb082a1bb943db
sudo add-apt-repository 'deb [arch=amd64,i386,ppc64el] http://mirror.edatel.net.co/mariadb/repo/10.1/ubuntu trusty main'

#  Instalación de paquetes
sudo apt-get update > /dev/null
sudo apt-get -y install nginx nginx-extras mariadb-server php5-fpm php5-mysql \
	php5-mcrypt php5-cli php5-curl php5-gd php5-gd  git postfix unzip \
	php-apc php5-memcached curl

# Copiar archivos de configuración de nginx, php, etc
echo Copy configuration
sudo cp /tmp/ops/nginx-wordpress.conf /etc/nginx/sites-available/wordpress
sudo cp /tmp/ops/nginx-wordpress-inc.conf /etc/nginx/wordpress-inc.conf
ln -sfn /etc/nginx/sites-available/wordpress /etc/nginx/sites-enabled/wordpress
sudo cp /tmp/ops/90-wordpress.ini /etc/php5/fpm/conf.d/90-wordpress.ini
sudo rm -rf /var/www/html
sudo rm /etc/nginx/sites-enabled/default
sudo service nginx restart
sudo service php5-fpm restart


# vim: ts=4 sw=4 noet
