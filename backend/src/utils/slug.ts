import Article from "../models/Article";

const baseSlugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const generateUniqueSlug = async (
  title: string,
  articleId?: string
): Promise<string> => {
  const base = baseSlugify(title) || "article";
  let slug = base;
  let count = 1;

  while (true) {
    const existing = await Article.findOne({ slug });
    if (!existing || existing._id.toString() === articleId) {
      return slug;
    }
    count += 1;
    slug = `${base}-${count}`;
  }
};
