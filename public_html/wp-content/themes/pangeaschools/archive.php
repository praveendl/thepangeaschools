<?php get_header(); ?>

	<div id="content">
		<h2>
			<?php if ( is_day() ) : ?>
			<?php printf( __( 'Daily Archives: <span>%s</span>', 'twentyten' ), get_the_date() ); ?>
			<?php elseif ( is_month() ) : ?>
			<?php printf( __( 'Monthly Archives: <span>%s</span>', 'twentyten' ), get_the_date( _x( 'F Y', 'monthly archives date format', 'twentyten' ) ) ); ?>
			<?php elseif ( is_year() ) : ?>
			<?php printf( __( 'Yearly Archives: <span>%s</span>', 'twentyten' ), get_the_date( _x( 'Y', 'yearly archives date format', 'twentyten' ) ) ); ?>
			<?php else : ?>
			<?php _e( 'Blog Archives', 'twentyten' ); ?>
			<?php endif; ?>
		</h2>
		
		<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
		
		<div class="post" id="post-<?php the_ID(); ?>">   
				<h3><a href="<?php the_permalink() ?>"><?php the_title(); ?></a></h3>

				<div class="clear"></div>

		</div><!--post -->

		<?php endwhile; endif; ?>
	
	<?php include (TEMPLATEPATH . '/sidebar.php'); ?>
	
	<div class="clear"></div><!--clear -->

<?php get_footer(); ?>      