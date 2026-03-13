<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'u569037831_thepangeaschoo' );

/** Database username */
define( 'DB_USER', 'u569037831_tps_admin' );

/** Database password */
define( 'DB_PASSWORD', 'EaJH#NKZ4FVeB' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'BA}H9]HZ~)w8^FB]fR+II{7)tcSPB%nF87,F&$QQH6(?ybps,93>755-[r>j[/FK');
define('SECURE_AUTH_KEY',  '%`FM`Lr<7c,jHPOK!LXnG+/wg>8@%z^uR:~x72*1E[;Wt@9PhyL5*zQ8wz8%Ny9B');
define('LOGGED_IN_KEY',    'RECOc+r.]F2C;mJ~0p~:S*#;$AU^{qfH6$vpq_tIC233EE:/3zh1vh8V%^ukVrv<');
define('NONCE_KEY',        'Em -59+N-HBCrdoDIuF^#.[(pW}=?u{,Cj6UGa)>8H&-0NU<v}hUz^0,QgRr#AW#');
define('AUTH_SALT',        '( 1UZpa`EK~n^Zll8m.9Yo{h.d|=7ut4M=>!|}mAS+}p-0U|[:tgH$dW2#1*p83>');
define('SECURE_AUTH_SALT', 'WO# /q<-Djr~B2TUUQwYtWxwc<?bszUz918B#[5r:M*tsP~D{G&PScYl7-gU+jkZ');
define('LOGGED_IN_SALT',   'gI{9z|rT+%;PG&{^L&4wFyW*X375?[3u5)gz#zXw*15L^#YG:s#IO`)QoH8w}DPL');
define('NONCE_SALT',       '__<|jL?;%_%/-uA]J?I$&)b;XK&fr0U(-{TV< P~J!t@~z3r>?6t`)c*)?4`@I:e');

/**#@-*/
 
/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'ps_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */

define( 'WP_MEMORY_LIMIT', '512M' );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
