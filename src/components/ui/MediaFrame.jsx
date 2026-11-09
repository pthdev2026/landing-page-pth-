import Image from "next/image";

/**
 * Cadre média unique du site (portrait, vidéo, maquette Origin).
 * Sans `src`, affiche un placeholder sobre qui indique quel média fournir :
 * le layout est ainsi validable avant la livraison des photos/vidéos.
 *
 * Contraintes performance : vidéos courtes, muettes, poster obligatoire, jamais de 4K.
 */
export default function MediaFrame({
  type = "image",
  src,
  poster,
  alt = "",
  label = "Média à fournir",
  aspect = "aspect-[4/5]",
  priority = false,
  className = "",
}) {
  return (
    <figure data-media className={`relative overflow-hidden rounded-[var(--radius-card)] bg-ink-soft ${aspect} ${className}`}>
      {src && type === "image" ? (
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 40vw, 100vw" priority={priority} className="object-cover" />
      ) : null}
      {src && type === "video" ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-label={alt || undefined}
        />
      ) : null}
      {!src ? (
        <div className="grain absolute inset-0 flex items-end bg-[radial-gradient(120%_90%_at_30%_10%,var(--color-crimson),var(--color-blood)_45%,var(--color-ink)_100%)] p-5">
          <p className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-ivory/70">{label}</p>
        </div>
      ) : null}
    </figure>
  );
}
