<?php get_header(); ?>
    <div class="container mt-5 mb-5">

        <div class="row">

            <div id="content" class="col-md-9">
                
                <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
                
                <div class="post" id="post-<?php the_ID(); ?>">   
                        <h1><a href="<?php the_permalink() ?>" class="post-title"><?php the_title(); ?></a></h1>
                        <div class="post_meta">Posted by <?php echo get_the_author(); ?> on <?php echo get_the_date(); ?> in 
                            <?php
                                $categories = get_the_category();
                                $separator = ' / ';
                                $output = '';
                                if($categories){
                                    foreach($categories as $category) {
                                        $output .= '<a href="'.get_category_link( $category->term_id ).'" title="' . esc_attr( sprintf( __( "View all posts in %s" ), $category->name ) ) . '">'.$category->cat_name.'</a>'.$separator;
                                    }
                                echo trim($output, $separator);
                                }
                            ?>
                        </div>
                        
                        <?php if ( has_post_thumbnail() ) { ?>
                            <div class="featuredimage"><a href="<?php the_permalink() ?>"><?php the_post_thumbnail(); ?></a></div>
                        <?php } ?>
                        
                        <div class="post_content">
                            <?php the_excerpt(); ?>
                            <a href="<?php the_permalink() ?>" class="readmorelink">Click to read more</a>
                        </div>

                        <div class="clear"></div>

                </div><!--post -->

                <?php endwhile; endif; ?>
                
                <div class="navigation row">
                    <div class="text-left col-md-6"><?php previous_posts_link( '&laquo; Previous Entries' ); ?></div>
                    <div class="text-right col-md-6"><?php next_posts_link( 'Next Entries &raquo;', '' ); ?></div>
                </div>
            </div> <!--content -->
	
	        <?php include (TEMPLATEPATH . '/sidebar.php'); ?> <!-- sidebar -->
	
	</div> <!-- row -->

    </div> <!-- container -->

<?php get_footer(); ?>      