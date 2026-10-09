import media from './media-manifest.json';

export default function ResponsiveImage({ src, sizes, ...props }) {
  const image = media[src];
  return <img src={src} width={image?.width} height={image?.height}
    srcSet={image?.variants.map(variant => `${variant.src} ${variant.width}w`).join(', ')}
    sizes={sizes} decoding="async" {...props} />;
}
