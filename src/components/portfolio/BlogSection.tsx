import React from 'react';
import type { ProfileDTO, BlogPostDTO } from '@/types/portfolio';
import { buildCloudinaryImageUrl } from '@/lib/cloudinary/url';

interface BlogSectionProps {
  isActive: boolean;
  profile: ProfileDTO;
  blogPosts: BlogPostDTO[];
}

export function BlogSection({
  isActive,
  profile,
  blogPosts,
}: BlogSectionProps) {
  const publishedPosts = [...blogPosts]
    .filter((post) => post.status === 'published')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <article className={`blog${isActive ? ' active' : ''}`} data-page="blog">
      <header>
        <h2 className="h2 article-title">{profile.blogHeading}</h2>
      </header>

      <section className="blog-posts">
        <ul className="blog-posts-list">
          {publishedPosts.map((post) => (
            <li key={post.id} className="blog-post-item">
              <a href={post.externalUrl}>
                <figure className="blog-banner-box">
                  <img
                    src={buildCloudinaryImageUrl(post.bannerUrl, {
                      width: 800,
                    })}
                    alt={post.bannerAlt}
                    loading="lazy"
                  />
                </figure>

                <div className="blog-content">
                  <div className="blog-meta">
                    <p className="blog-category">{post.category}</p>
                    <span className="dot" />
                    <time dateTime={post.publishedDateISO}>
                      {post.publishedDateDisplay}
                    </time>
                  </div>

                  <h3 className="h3 blog-item-title">{post.title}</h3>
                  <p className="blog-text">{post.excerpt}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
