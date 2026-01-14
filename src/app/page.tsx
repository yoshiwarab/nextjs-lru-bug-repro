import Link from "next/link";
import { COLLECTION_COUNT } from "./constants";

export default function Home() {
  const collections = Array.from({ length: COLLECTION_COUNT }, (_, i) => ({
    id: i,
    slug: `collection-${i}`,
    name: `Collection ${i}`,
  }));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-2">LRU Cache Bug Reproduction</h1>
        <p className="text-zinc-400 mb-4">
          This page contains {COLLECTION_COUNT} links to collection pages. Each
          collection page returns a ~500KB RSC payload with high-entropy data.
        </p>
        <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 text-amber-200 mb-4">
          <strong>Bug:</strong> The segment cache creates duplicate LRU entries
          for the same route segment. When cleanup runs, lruSize doesn&apos;t
          decrease properly, causing an infinite loop.
        </div>
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-zinc-300">
          <strong>Test:</strong> Each collection page fetches ~500KB from an API
          route. Click links to navigate and fill the 50MB cache limit.
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collection/${collection.slug}`}
              className="block p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 transition-colors"
            >
              <div className="aspect-square bg-gradient-to-br from-indigo-600 to-purple-700 rounded-md mb-3 flex items-center justify-center">
                <span className="text-2xl font-bold text-white/90">
                  {collection.id}
                </span>
              </div>
              <h2 className="font-medium text-sm truncate">
                {collection.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">~1MB payload</p>
            </Link>
          ))}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 pt-8 border-t border-zinc-800 text-zinc-500 text-sm">
        <p>
          Scroll to trigger prefetches. The page should freeze as the LRU cache
          fills and cleanup loops.
        </p>
      </footer>
    </div>
  );
}
