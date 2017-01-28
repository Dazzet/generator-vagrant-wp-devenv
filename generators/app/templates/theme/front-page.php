<?php

/*
 * Modificacinoes para la página principal
 *
 */
add_filter('body_class', function($classes) {
    $classes[] = 'front-page';
    return $classes;
} );

add_filter( 'genesis_pre_get_option_site_layout', '__genesis_return_full_width_content' );
remove_action( 'genesis_loop', 'genesis_do_loop' );

add_action( 'genesis_loop', function() {
    for ($i = 1; $i < 2; $i++) {
        genesis_widget_area( 'front-page-'.$i, array(
            'before' => '<div id="front-page-'.$i.'" class="front-page-'.$i.' fp-section"><div class="wrap">',
            'after' => '</div></div>'
        ) );
    }
} );

genesis();
