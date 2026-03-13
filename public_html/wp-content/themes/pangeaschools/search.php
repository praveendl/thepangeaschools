<?php
/**
 * The template for displaying Search Results pages.
*/
 
get_header();

function excerpt_by_id($post, $length = 43, $tags = '<a><em><strong>', $extra = ' . . .') {

	if(is_int($post)) {
		// get the post object of the passed ID
		$post = get_post($post);
	} elseif(!is_object($post)) {
		return false;
	} 

	if(has_excerpt($post->ID)) {
		$the_excerpt = $post->post_excerpt;
		return apply_filters('the_content', $the_excerpt);
	} else {
		$the_excerpt = $post->post_content;
	} 

	$the_excerpt = strip_shortcodes(strip_tags($the_excerpt), $tags);
	$the_excerpt = preg_split('/\b/', $the_excerpt, $length * 2+1);
	$excerpt_waste = array_pop($the_excerpt);
	$the_excerpt = implode($the_excerpt);
	$the_excerpt .= $extra; 

	return apply_filters('the_content', $the_excerpt);
}

?>	

	<div id="innercontent">		

		<div id="content">			

			<?php if (have_posts()) : while (have_posts()) : the_post(); ?>			

			<div class="post blogpost" id="post-<?php the_ID(); ?>">   

					<h2><a href="<?php the_permalink() ?>"><?php the_title(); ?></a></h2>					

					<div class="post_content">
                        
						<?php echo excerpt_by_id(get_the_ID()); ?>						

                        <p class="author_date">Posted by <?php the_author(); ?> on <?php the_date(); ?></p>

						<h4><a href="<?php the_permalink() ?>" class="readmore">Read More</a></h4>

					</div>	

					<div class="clear"></div>	

			</div><!--post -->	

			<?php endwhile; endif; ?>			

			<div class="post_navigation"><p><?php posts_nav_link('&#8734;','Newer Posts &#187;','&#171; Older Posts'); ?></p></div>

		</div> <!--content -->		

		<?php include (TEMPLATEPATH . '/sidebar-blog.php'); ?>		

		<div class="clear"></div><!--clear -->		

	</div>	

<?php include (TEMPLATEPATH . '/footer-blog.php'); ?>      