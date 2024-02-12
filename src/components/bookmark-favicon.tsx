import { cn } from 'lib/utils';

type CardFaviconProps = {
  url: string;
  title: string;
  className?: string;
};

export default function BookmarkFavicon({
  url,
  title,
  className,
}: CardFaviconProps) {
  return (
    <div className={cn('rounded-full w-6 h-6 bg-white', className)}>
      <img
        src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=128`}
        alt={title}
        className={'rounded-full w-6 h-6'}
      />
    </div>
  );
}
