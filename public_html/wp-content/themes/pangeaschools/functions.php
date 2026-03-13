<?php

add_theme_support('menus');

add_theme_support( 'post-thumbnails' );

add_theme_support( 'html5', array( 'search-form' ) );

add_theme_support( 'title-tag' );

//if ( function_exists('register_sidebars') )
//    register_sidebars(2);

if (function_exists('register_sidebar')) {
	register_sidebar(array(
	'name'=>'Blog',
	'before_widget' => '',
	'after_widget' => '',
	'before_title' => '',
	'after_title' => '',
	));
}

function my_scripts() {
	wp_enqueue_style('bootstrap4', 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css');
    wp_enqueue_script( 'boot3','https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js', array( 'jquery' ),'',true );
}
add_action( 'wp_enqueue_scripts', 'my_scripts' );

/**
 * Register Custom Navigation Walker
 */
function register_navwalker(){
	require_once get_template_directory() . '/class-wp-bootstrap-navwalker.php';
}
add_action( 'after_setup_theme', 'register_navwalker' );

register_nav_menus( array(
    'primary' => __( 'Primary Menu', 'THEMENAME' ),
) );

function load_fonts() {
	wp_register_style('googleFonts', 'https://fonts.googleapis.com/css?family=Lato:400,300,700,900');
	wp_enqueue_style( 'googleFonts');
}

add_action('wp_print_styles', 'load_fonts');

function my_search_form( $form ) {
	$form = '<div id="searchformcontainer">
	<form role="search" method="get" id="searchform" class="searchform" action="' . home_url( '/' ) . '" >
	<input type="submit" id="btnsearch" value="'. esc_attr__( '.' ) .'" />
	<input type="text" value="' . get_search_query() . '" name="s" id="s" />
	</form>
	</div>';

	return $form;
}

add_filter( 'get_search_form', 'my_search_form' );

function ds_year_shortcode () {
    $year = date_i18n ('Y');
    return $year;
}

add_shortcode ('ds_year', 'ds_year_shortcode');

?>
