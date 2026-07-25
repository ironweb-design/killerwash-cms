module.exports = function (eleventyConfig) {
  // Copy static assets straight through to the built site
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");
  // Copy the client's image files (hero, service photos, before/after, etc.)
  // Put those image files in src/images/ and they'll be copied to the site root-relative path.
  eleventyConfig.addPassthroughCopy({ "src/images": "." });
  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
