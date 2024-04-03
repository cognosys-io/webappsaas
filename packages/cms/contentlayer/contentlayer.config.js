import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `posts/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      description: 'The title of the post',
      required: true,
    },
    date: {
      type: 'date',
      description: 'The date of the post',
      required: true,
    },
    author: {
      type: 'string',
      description: 'The author of the post',
      required: true,
    },
    live: {
      type: 'boolean',
      description: 'Whether the post is live or not',
      required: true,
      default: false,
    },
    image: {
      type: 'string',
      description: 'The path to the cover image',
    },
    description: {
      type: 'string',
      description: 'The description of the post',
    },
    tags: {
      type: 'list',
      required: false,
      of: {
        type: 'string',
      },
    },
    categories: {
      type: 'list',
      required: false,
      of: {
        type: 'string',
      },
    },
  },
  computedFields: {
    readingTime: {
      type: 'number',
      resolve: (post) => calculateReadingTime(post.body.raw),
    },
    slug: {
      type: 'string',
      resolve: (post) => getSlug(post._raw.sourceFileName),
    },
    url: {
      type: 'string',
      resolve: (post) => `/blog/${getSlug(post._raw.sourceFileName)}`,
    },
    parentId: {
      type: 'string',
      resolve: (doc) => {
        const segments = getPathSegments(doc);
        return segments.length > 1 ? segments.slice(0, -1).join('/') : 'blog';
      },
    },
    structuredData: {
      type: 'object',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: doc.title,
        datePublished: doc.date,
        dateModified: doc.date,
        description: doc.description,
        image: [siteUrl, doc.image].join(''),
        author: {
          '@type': 'Organization',
          name: `Makerkit`,
        },
      }),
    },
  },
}));

export const DocumentationPage = defineDocumentType(() => ({
  name: 'DocumentationPage',
  filePathPattern: `docs/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      description: 'The title of the post',
      required: true,
    },
    label: {
      type: 'string',
      description: 'The label of the page in the sidebar',
      required: true,
    },
    description: {
      type: 'string',
      description: 'The description of the post',
    },
    tags: {
      type: 'list',
      required: false,
      of: {
        type: 'string',
      },
    },
    categories: {
      type: 'list',
      required: false,
      of: {
        type: 'string',
      },
    },
  },
  computedFields: {
    readingTime: {
      type: 'number',
      resolve: (post) => calculateReadingTime(post.body.raw),
    },
    parentId: {
      type: 'string',
      resolve: (doc) => {
        const segments = getPathSegments(doc);

        if (segments.length > 1) {
          const { pathName } = getMetaFromFolderName(segments[0]);

          if (pathName === 'index') {
            return undefined;
          }

          return pathName;
        }

        return undefined;
      },
    },
    order: {
      type: 'number',
      resolve: (doc) => {
        const segments = getPathSegments(doc);
        const { order } = getMetaFromFolderName(segments[segments.length - 1]);

        return order;
      },
    },
    structuredData: {
      type: 'object',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        headline: doc.title,
        datePublished: doc.date,
        dateModified: doc.date,
        description: doc.description,
        image: [siteUrl, doc.image].join(''),
        url: [siteUrl, 'blog', doc._raw.flattenedPath].join('/'),
        author: {
          '@type': 'Organization',
          name: `Makerkit`,
        },
      }),
    },
    path: {
      type: 'string',
      resolve: (doc) => {
        if (doc._id.startsWith('docs/index.md')) {
          return '/docs';
        }

        return urlFromFilePath(doc);
      },
    },
    pathSegments: {
      type: 'json',
      resolve: (doc) => getPathSegments(doc).map(getMetaFromFolderName),
    },
    slug: {
      type: 'string',
      resolve: (doc) =>
        getPathSegments(doc)
          .map(getMetaFromFolderName)
          .map(({ pathName }) => pathName)
          .join('/'),
    },
    url: {
      type: 'string',
      resolve: (doc) => {
        return (
          '/docs/' +
          getPathSegments(doc)
            .map(getMetaFromFolderName)
            .map(({ pathName }) => pathName)
            .join('/')
        );
      },
    },
  },
}));

export default makeSource({
  contentDirPath: './content',
  documentTypes: [Post, DocumentationPage],
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ['anchor'],
          },
        },
      ],
    ],
  },
});

function calculateReadingTime(content) {
  const wordsPerMinute = 235;
  const numberOfWords = content.split(/\s/g).length;
  const minutes = numberOfWords / wordsPerMinute;

  return Math.ceil(minutes);
}

function getSlug(fileName) {
  return fileName.replace('.mdx', '');
}

function urlFromFilePath(doc) {
  let urlPath = doc._raw.flattenedPath.replace(/^app\/?/, '/');

  if (!urlPath.startsWith('/')) {
    urlPath = `/${urlPath}`;
  }

  return urlPath;
}

function getMetaFromFolderName(dirName) {
  const re = /^((\d+)-)?(.*)$/;
  const [, , orderStr, pathName] = dirName.match(re) ?? [];
  const order = orderStr ? parseInt(orderStr) : 0;

  return { order, pathName };
}

function getPathSegments(doc) {
  return (
    urlFromFilePath(doc)
      .split('/')
      // skip `/docs` prefix
      .slice(2)
  );
}
