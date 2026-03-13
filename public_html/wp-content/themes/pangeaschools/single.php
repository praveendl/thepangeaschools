<?php get_header(); ?>

    <div class="container mt-5 mb-5">

        <div class="row">

            <div id="content" class="col-md-9">

                <?php if (have_posts()) : while (have_posts()) : the_post(); ?>

                    <h2><?php the_title(); ?></h2>

                    <div class="post" id="post-<?php the_ID(); ?>">   
                        
                        <?php if ( has_post_thumbnail() ) { 
                            the_post_thumbnail();
                        } ?>

                        <div class="post_content"><?php the_content(); ?></div>
                        
                        <div class="clear"></div>

                    </div><!--post -->

                <?php endwhile; endif; ?>
                
                <?php comments_template(); ?>
                
            </div><!--content -->

            <?php include (TEMPLATEPATH . '/sidebar.php'); ?>

        </div> <!-- row -->

    </div> <!-- container -->

<?php get_footer(); ?>      