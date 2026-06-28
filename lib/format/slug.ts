import slugify from "slugify";

function randomString(length = 5) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

export function generateSlug(title: string) {
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
    locale: "vi",
    trim: true,
  });

  const timestamp = Date.now().toString(36);
  const random = randomString();

  return `${baseSlug}-${timestamp}-${random}`;
}
