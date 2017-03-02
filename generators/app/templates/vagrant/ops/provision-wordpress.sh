#!/bin/bash

INDIR=/var/www/wp               # Directorio donde reside Wordpress
DBHOST=localhost                # Servidor donde está la base de datos
DBNAME="<%= projectName %>"       # Base de datos para Wordpress
DBUSER="<%= projectName %>"       # Usuario de la base de datos de Wordpress
DBPASS="<%= projectName %>"       # Contraseña de la base de datos
DBRPASS=root                    # Contraseña de root para la base de datos (ver provision-vagrant.sh)
DOMAIN="<%= projectName %>.dev" # Dominio para wordpress
TITLE="SLOGAN"                  # Nombre del blog
DEVEL=1                         # 0 Para producción (instala más plugins)

#  Ejecuta un comando como www-data
function runAs() {
    sudo -H -u www-data bash -c "$*"
}

#  Crear la base de datos de Wordpress
mysql -u root -p${DBRPASS} -e "CREATE DATABASE ${DBNAME};"
mysql -u root -p${DBRPASS} -e "GRANT ALL PRIVILEGES ON ${DBNAME}.* TO ${DBUSER}@'%' IDENTIFIED BY '${DBPASS}';"
mysql -u root -p${DBRPASS} -e "FLUSH PRIVILEGES;"

sudo mkdir -p ${INDIR}
cd $INDIR
# Instalar el comando wp-cli de wp-cli.org
if [ ! -x $INDIR/wp ]; then
    echo "Installing wp cli since it could not be found"
    wget -O wp -nvc https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
    chmod 755 wp
fi

# Configuración de Wordpress si no se encuentra el archivo wp-config.php
if [ ! -f $INDIR/wp-config.php ]; then
    echo Installing Wordpress
    runAs ./wp core download --locale=es_ES
    rm -rf wp-config.php
    runAs ./wp core config --dbname=$DBNAME --dbhost=$DBHOST --dbuser=$DBUSER \
        --dbpass=$DBPASS  --locale=es_ES --skip-check --extra-php <<PHP
//define( 'WP_DEBUG', true  );
//define( 'WP_DEBUG_LOG', true  );
PHP
    runAs ./wp core install --url=${DOMAIN} --title=${TITLE} \
        --admin_user=admin --admin_password=admin  \
        --admin_email=mario.yepes@dazzet.co
fi

# Lo require W3 Total Cache para configurar el cache de páginas de Wordpress
touch ${INDIR}/nginx.conf && chmod 777 ${INDIR}/nginx.conf

# Install remote plugins
runAs ./wp plugin install better-font-awesome
runAs ./wp plugin install caldera-forms
runAs ./wp plugin install enhanced-media-library
runAs ./wp plugin install image-widget
runAs ./wp plugin install recent-posts-widget-extended
runAs ./wp plugin install tinymce-advanced
runAs ./wp plugin install widget-css-classes

# Install Genesis plugins (UNcomment if your are using Genesis Framework)
# runAs ./wp plugin install genesis-404-page
# runAs ./wp plugin install genesis-translations
# runAs ./wp plugin install genesis-simple-edits
# runAs ./wp plugin install genesis-visual-hook-guide

# SiteOrigin plugins
runAs ./wp plugin install siteorigin-panels
runAs ./wp plugin install so-widgets-bundle

# Install import/export plugins
runAs ./wp plugin install options-importer
runAs ./wp plugin install wordpress-importer
runAs ./wp plugin install widget-settings-importexport
runAs ./wp plugin install better-search-replace


# Remove default plugins and themes
runAs ./wp plugin uninstall akismet
runAs ./wp plugin uninstall hello

# Install local themes
runAs ./wp theme install --force /tmp/installers/themes/*.zip

# Install local plugins
runAs ./wp theme install --force /tmp/installers/plugins/*.zip

# Update language
runAs ./wp core language update

# Activate themes
#runAs ./wp theme activate "<%= projectName %>-<%= projectYear %>"

# Activate plugins
runAs ./wp plugin activate --all

# Remove Wordpress default widgets
# runAs ./wp widget delete `runAs ./wp widget list header-right`

sudo service nginx restart

echo "Installation done. Access your server on http://<%= hostIP %>"



# vim: ts=4 sw=4 sts=4 sr et
