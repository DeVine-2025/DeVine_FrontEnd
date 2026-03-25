type ImageModule = Record<string, string>;

const imageModules = import.meta.glob('./*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
}) as ImageModule;

const getFileNameWithoutExt = (path: string) => {
  const fileName = path.split('/').pop() ?? '';
  return fileName.replace(/\.[^/.]+$/, '');
};

export const landingImages = Object.fromEntries(
  Object.entries(imageModules).map(([path, src]) => [getFileNameWithoutExt(path), src]),
) as Record<string, string>;
