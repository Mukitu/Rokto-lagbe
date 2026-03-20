import { supabase } from '@/lib/supabase'
import { Metadata, ResolvingMetadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import ShareButtons from './ShareButtons'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params
  const id = resolvedParams.id

  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single()

  if (!blog) {
    return {
      title: 'Blog Not Found',
    }
  }

  return {
    title: blog.title,
    description: blog.description?.substring(0, 160),
    openGraph: {
      title: blog.title,
      description: blog.description?.substring(0, 160),
      images: [
        {
          url: blog.image_url,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.description?.substring(0, 160),
      images: [blog.image_url],
    },
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const resolvedParams = await params
  const id = resolvedParams.id

  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single()

  if (!blog) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#C0001A] transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            ফিরে যান
          </Link>

          <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Featured Image */}
            <div className="relative h-64 md:h-[450px] w-full">
              <Image
                src={blog.image_url}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="p-6 md:p-12">
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-[#C0001A]" />
                  {new Date(blog.created_at).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <User size={18} className="text-[#C0001A]" />
                  অ্যাডমিন
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                {blog.title}
              </h1>

              {/* Content */}
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap mb-12">
                {blog.description}
              </div>

              {/* Share Section */}
              <ShareButtons title={blog.title} />
            </div>
          </article>

          {/* Ad Placeholder */}
          <div id="adsense-blog-footer" className="mt-12 min-h-[100px] flex items-center justify-center bg-gray-100 rounded-2xl border border-dashed border-gray-300 text-gray-400 text-sm">
            বিজ্ঞাপন এখানে প্রদর্শিত হবে
          </div>
        </div>
      </main>
    </div>
  )
}
