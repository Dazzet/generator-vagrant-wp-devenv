
// Importqamos los plugins de gulp necesarios
var gulp      = require('gulp'),
    sass      = require('gulp-sass'),
    shell     = require('gulp-shell'),
    rucksack  = require('gulp-rucksack'),
    concat    = require('gulp-concat'),
    plumber   = require('gulp-plumber'),
    del       = require('del'),
    rsync     = require('gulp-rsync'),
    bs        = require('browser-sync');

//  Establecemos las variables de BD y rutas
var dbName    = '<%= projectName %>',
    dbUser    = '<%= projectName %>',
    dbPass    = '<%= projectName %>',
    dbRPass   = 'root';

var insDir    = '/var/www/wp',
    domain    = '<%= projectName %>.dev',
    sshServer = 'dev.dazzet.co',
    sshUser   = 'dazzet',
    themeDir  = 'wp/wp-content/themes/<%= projectName %>-<%= projectYear %>';

/**
 * Compila los archivos .scss que hay en  el directioro scss y genera el
 * archivo style.css
 */
gulp.task('scss', function() {

    gulp.src(themeDir + '/scss/*.scss')
        .pipe(plumber())
        .pipe(sass({
          includePaths: 'node_modules/bootstrap-sass/assets/stylesheets'
        }))
        .pipe(rucksack({
          autoprefixer: true
        }))
        .pipe(gulp.dest( themeDir ))
        .pipe(bs.stream());
});

/**
 * Concatena y minifica los archivos de javascript
 */
gulp.task('js', function() {
  gulp.src([ themeDir + '/js/*.js' ])
    .pipe(concat('script.min.js', {newLine: ';'} ))
    .pipe(gulp.dest(themeDir))
});

/**
 * Vigila el directrio scss y compila los archivos si hay un cambio
 */
gulp.task('watch', ['scss', 'js'], function() {
  bs.init({
    proxy: domain,
    port: 8080
  });
  gulp.watch(themeDir + '/scss/**/*.scss', ['scss']);
  gulp.watch(themeDir + '/js/*.js', ['js']);
});


gulp.task('rsync', ['scss', 'js'], function() {
  return gulp.src(themeDir)
    .pipe(rsync({
      root: themeDir + '/',
      destination: '/var/www/' + themeDir,
      hostname: sshServer,
      archive: true,
      compress: true,
      recursive: true,
      username: sshUser,
      exclude: ['scss', 'js', '.DS_Store']
    }))
});

gulp.task('rsync-prod', ['scss', 'js'], function() {
  var themeDirRemote = themeDir.replace('wp/', '');
  return gulp.src(themeDir)
    .pipe(rsync({
          root: themeDir + '/',
          destination: '/home/CHANGE/' + themeDirRemote,
          hostname: 'CHANGE',
          archive: true,
          compress: true,
          recursive: true,
          username: 'CHANGE',
          exclude: ['scss', 'js', '.DS_Store']
        }))
});

/**
 * Borra todos los archivos que no son parte del repositorio con.
 * Reinicia el proyecto rápidamente
 */
gulp.task('clean', function() {
    return del([
        'html',
        'wp/*',
        '!wp/wp-content',
        'wp/wp-content/*',
        '!wp/wp-content/themes',
        '!wp/wp-content/uploads',
        'wp/wp-content/themes/*',
        '!'+themeDir
    ]);
});

/**
 * Descarga el archivo de datos desde dev.dazzet.co y lo importa en el entorno de dsarrollo local
 */
gulp.task('download-data', shell.task([
  'ssh -C '+sshUser+'@'+sshServer+' "rm -f /tmp/'+domain+'*xml && cd /var/www/wp/ && ./wp export --url='+domain+'.dazzet.co --dir=/tmp/ --filename_format='+domain+'.xml"',
  'scp '+sshUser+'@'+sshServer+':/tmp/'+domain+'.xml backups/',
]));

/**
 * Borra posts paginas y productos para luego empezar la importacion
 */
gulp.task('clean-data', shell.task([
  'vagrant ssh -c "cd /var/www/wp && ./wp post delete --force \\\$(./wp post list --post_type=page,post,product,revision,nav_menu_item,wpcf7_contact_form --format=ids) 1 ; echo Borrado"'
]));

/**
 * Importa los datos ya descargados a Wordpress
 */
gulp.task('import-data',  shell.task([
  'vagrant ssh -c "cd /var/www/wp && ./wp plugin activate wordpress-importer && ./wp import --authors=create /var/www/backups/'+domain+'.xml"'
]));

/**
 * Arregla problemas de nombre de dominio cambiado
 */
gulp.task('fix-data', shell.task([
  'vagrant ssh -c "cd /var/www/wp && ./wp search-replace \'/wp-content/uploads/sites/5/\' \'/wp-content/uploads/\' --precise"',
  'vagrant ssh -c "cd /var/www/wp && ./wp search-replace \''+domain+'.dazzet.co\' \''+domain+'\' --precise"'
]));

gulp.task('sync-data', ['download-data', 'clean-data', 'import-data', 'fix-data']);

/**
  * baja datos de wptest.io
*/
gulp.task('import-test-data', shell.task([
  'vagrant ssh -c "cd /tmp/ && wget -c https://github.com/manovotny/wptest/raw/master/wptest.xml"',
  'vagrant ssh -c "cd /var/www/wp && ./wp plugin activate wordpress-importer && ./wp import --authors=create /tmp/wptest.xml"'
]));

/**
 * Reinicia nginx en el servidor local
 */
gulp.task('restart-nginx', shell.task([
  'vagrant ssh -c "sudo service nginx restart"'
]));

/**
 * Solamente por facilidad con vs-code
 */
gulp.task('vagrant-provision', shell.task(['vagrant provision']));
gulp.task('vagrant-up', shell.task(['vagrant up']));
gulp.task('vagrant-reload', shell.task(['vagrant reload']));


// vim: ts=2 sw=2 sts=2  sr et
