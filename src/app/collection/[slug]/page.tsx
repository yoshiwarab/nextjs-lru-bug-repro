import Link from "next/link";
import { COLLECTION_COUNT } from "../../constants";

type CollectionData = {
  slug: string;
  sizeBytes: number;
  sizeKB: number;
  data: string;
};

// Generate static params so pages are pre-rendered and can be prefetched
export async function generateStaticParams() {
  return Array.from({ length: COLLECTION_COUNT }, (_, i) => ({
    slug: `collection-${i}`,
  }));
}

// Generate large payload directly (no API call needed for static generation)
function generateLargePayload(slug: string, targetSizeKB: number): string {
  const targetSize = targetSizeKB * 1024;
  const slugHash = slug
    .split("")
    .reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

  let result = `[${slug}]`;
  let seed = slugHash;

  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  while (result.length < targetSize) {
    let chunk = "";
    for (let i = 0; i < 1000; i++) {
      chunk += chars[Math.floor(random() * chars.length)];
    }
    result += chunk + `[${slug}:${result.length}]`;
  }

  return result;
}

function getCollectionData(slug: string): CollectionData {
  const data = generateLargePayload(slug, 1000); // 1MB
  return {
    slug,
    sizeBytes: data.length,
    sizeKB: Math.round(data.length / 1024),
    data,
  };
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;

  // Generate the large payload (done at build time for static pages)
  const collectionData = getCollectionData(slug);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-200 mb-4"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Collections
        </Link>
        <h1 className="text-3xl font-bold mb-2 capitalize">
          {slug.replace(/-/g, " ")}
        </h1>
        <div className="flex items-center gap-4 text-zinc-400 text-sm">
          <span className="bg-emerald-800 px-2 py-1 rounded text-emerald-200">
            API Payload: {collectionData.sizeKB}KB
          </span>
          <span className="bg-zinc-800 px-2 py-1 rounded">Slug: {slug}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
          <h2 className="text-xl font-semibold mb-4">Collection Details</h2>
          <p className="text-zinc-400 mb-6">
            This page fetched {collectionData.sizeKB}KB of data from the API.
            This data is now part of the RSC payload and will be stored in the
            segment cache.
          </p>

          {/* Scrollable container with ALL the data visible */}
          <div className="bg-zinc-950 rounded p-4 mb-4 max-h-64 overflow-auto">
            <h3 className="text-sm font-medium text-zinc-300 mb-2">
              Full Payload ({collectionData.sizeKB}KB):
            </h3>
            <pre className="text-xs text-zinc-500 whitespace-pre-wrap break-all font-mono">
              {collectionData.data}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
