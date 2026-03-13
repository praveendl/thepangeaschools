<?php get_header(); ?>

	<div id="content">
		
		<?php if (have_posts()) : while (have_posts()) : the_post(); ?>

			<div class="post" id="post-<?php the_ID(); ?>">
				<h1><?php the_title(); ?></h1>
				
				<div class="post_content"><?php the_content(); ?></div>

				<div class="clear"></div>

			</div><!--post -->

		<?php endwhile; endif; ?>
	</div> <!--content -->
	
	<?php include (TEMPLATEPATH . '/sidebar.php'); ?>
	
	<div class="clear"></div><!--clear -->
	
	
<?php get_footer(); ?>      