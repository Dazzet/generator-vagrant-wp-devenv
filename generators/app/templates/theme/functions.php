<?php

include_once( get_template_directory() . '/lib/init.php' );

define( 'CHILD_THEME_NAME', '<%= projectName %>' );
define( 'CHILD_THEME_URL', 'http://dazzet.co/' );
define( 'CHILD_THEME_VERSION', '0.1.0' );

//* Enqueue scripts and styles
add_action( 'wp_enqueue_scripts', function() {
    wp_enqueue_style( 'google-fonts', 'https://fonts.googleapis.com/css?family=Roboto', array(), CHILD_THEME_VERSION );
    wp_enqueue_script( 'theme-js', get_stylesheet_directory_uri() . '/script.min.js', array('jquery'), CHILD_THEME_VERSION, true);
    wp_deregister_script( 'superfish'  ); // Remove superfish on genesis
    wp_deregister_script( 'superfish-args'  );
}, 999);

//* Habilitar opciones de genesis
add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ) );
add_theme_support( 'genesis-accessibility', array( '404-page', 'drop-down-menu', 'headings', 'rems', 'search-form' )  );
add_theme_support( 'genesis-menus', array( 'primary' => __( 'Primary Navigation Menu', 'genesis'  )  )  );
add_theme_support( 'custom-background' );
add_theme_support( 'genesis-responsive-viewport' );
add_theme_support( 'genesis-footer-widgets', 3 );

//* Creamos nuevos tamaños de imágenes
add_image_size( 'featured-page', 1140, 400, TRUE );
add_image_size( 'blog-image-md', 640, 480, TRUE );
add_image_size( 'blog-image-lg', 800, 600, TRUE );
add_filter('image_size_names_choose', function($sizes) {
    $sizes['featured-page'] = __('Hero Image', '<%= projectName %>');
    $sizes['blog-image-md'] = __('Medium blog image', '<%= projectName %>');
    $sizes['blog-image-lg'] = __('Semi-large blog image', '<%= projectName %>');
    return $sizes;
});

//* Eliminamos layouts no usados
genesis_unregister_layout( 'content-sidebar-sidebar' );
genesis_unregister_layout( 'sidebar-content-sidebar' );
genesis_unregister_layout( 'sidebar-sidebar-content' );
unregister_sidebar( 'sidebar-alt' );

//* Permitimos imágen en el encabezado
add_theme_support( 'custom-header', array(
	'flex-height'     => true,
	'width'           => 360,
	'height'          => 222, // Golden Ratio: http://www.miniwebtool.com/golden-section-calculator/
	'header-selector' => '.site-title a',
	'header-text'     => false,
) );

//* Add support for structural wraps
add_theme_support( 'genesis-structural-wraps', array(
	'header',
	'nav',
	'subnav',
	'footer-widgets',
	'footer',
) );

//* Habilitamos widgets al final de los posts
add_theme_support( 'genesis-after-entry-widget-area' );

//* Creamos más areas de widgets para la página principal
for ($i = 1; $i < 2; $i++) {
    genesis_register_sidebar( array(
        'id' => 'front-page-'.$i,
        'name' => 'Front Page '.$i,
    ) );
}

//* Eliminar emojis ya que ponen lenta la página y no se usan
add_action( 'init', function() {
  // all actions related to emojis
  remove_action( 'admin_print_styles', 'print_emoji_styles' );
  remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
  remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
  remove_action( 'wp_print_styles', 'print_emoji_styles' );
  remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
  remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
  remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );

} );

//* Agregar menu de fuentes a tinymce
add_filter( 'tiny_mce_before_init', function( $initArray ) {
    $theme_advanced_fonts = 'Anton=Anton;Questrial=Questrial;Roboto=Roboto;';
    $initArray['font_formats'] .= $theme_advanced_fonts;
    return $initArray;
});

//* Agregar colores de Dazzet a tinymce
add_filter('tiny_mce_before_init', function($init) {
    $custom_colours = '
        "B1B1B1", "Gris",
        "343434", "Negro",
        "27A9FF", "Azul Primary",
        "67C067", "Verde Success",
        "90CAF9", "Azul Info",
        "FFAE00", "Amarillo Warning",
        "EC5840", "Rojo Danger",
        "FF5722", "Naranja Headers",
        "2196F3", "Azul Rey",
        "FFFFFF", "Blanco"
        ';
    $init['textcolor_map'] = '['.$custom_colours .']';
    $init['textcolor_rows'] = 6; // expand colour grid to 6 rows
    $init['block_formats'] = 'Paragraph=p;Heading 2=h2;Heading 3=h3;Heading 4=h4;Heading 5=h5;Heading 6=h6;Preformateado=pre;Codigo=code';

    return $init;
});

