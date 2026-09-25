/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // The content/segments/*.md files are read via fs.readdirSync with a
    // path built from process.cwd(), which Next's automatic serverless
    // file-tracing does not always detect. Explicitly including the
    // directory guarantees it ships with the deployed function on Vercel.
    outputFileTracingIncludes: {
      '/api/segments/route': ['./content/segments/**/*'],
      '/api/segments/[id]/route': ['./content/segments/**/*'],
      '/api/segments/[id]/whatif/route': ['./content/segments/**/*'],
      '/api/segments/compare/route': ['./content/segments/**/*'],
      '/': ['./content/segments/**/*'],
      '/compare/page': ['./content/segments/**/*'],
      '/segment/[id]/page': ['./content/segments/**/*']
    }
  }
};

module.exports = nextConfig;
