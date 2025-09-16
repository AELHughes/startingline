'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Calendar, User, ArrowLeft, Share2, MessageCircle, Tag } from 'lucide-react'
import { articlesApi, type Article } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import AdminAccessButton from '@/components/admin/admin-access-button'

export default function ArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (slug) {
      fetchArticle()
    }
  }, [slug])

  const fetchArticle = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await articlesApi.getArticleBySlug(slug)
      
      if (response.success && response.data) {
        setArticle(response.data)
      } else {
        setError(response.error || 'Article not found')
      }
    } catch (error) {
      console.error('Error fetching article:', error)
      setError('Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Sharing failed:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Article URL copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <img 
                  src="/Logo.png" 
                  alt="StartingLine" 
                  className="h-8 w-auto"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Loading Skeleton */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <img 
                  src="/Logo.png" 
                  alt="StartingLine" 
                  className="h-8 w-auto"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Error State */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">{error}</p>
          <Link href="/articles">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/Logo.png" 
                alt="StartingLine" 
                className="h-8 w-auto"
              />
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/events" className="text-gray-700 hover:text-blue-600 font-medium">
                All Events
              </Link>
              <Link href="/articles" className="text-blue-600 font-medium">
                Articles
              </Link>
              <Link href="/organisers" className="text-gray-700 hover:text-blue-600 font-medium">
                Organisers
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href="/articles" className="text-gray-500 hover:text-gray-700">Articles</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article>
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {article.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-gray-600">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.publishedDate)}</span>
                </div>
                {article.commentCount > 0 && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{article.commentCount} comments</span>
                  </div>
                )}
              </div>
              
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </header>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Article Body */}
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: article.content }}
              className="text-gray-700 leading-relaxed"
            />
          </div>

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200">
            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Articles */}
            <div className="flex justify-between items-center">
              <Link href="/articles">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Articles
                </Button>
              </Link>
              
              <Button onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Article
              </Button>
            </div>
          </footer>
        </article>

        {/* Related Articles Section */}
        <aside className="mt-16">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">More Articles</h2>
              <p className="text-gray-600 mb-4">
                Discover more insights and stories from the world of endurance sports.
              </p>
              <Link href="/articles">
                <Button>Browse All Articles</Button>
              </Link>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/Logo.png" 
                  alt="StartingLine" 
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-gray-400">
                Your premier destination for cycling, running, and triathlon events across South Africa.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Events</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/events" className="hover:text-white">All Events</Link></li>
                <li><Link href="/events?category=road-cycling" className="hover:text-white">Road Cycling</Link></li>
                <li><Link href="/events?category=road-running" className="hover:text-white">Road Running</Link></li>
                <li><Link href="/events?category=mountain-biking" className="hover:text-white">Mountain Biking</Link></li>
                <li><Link href="/events?category=triathlon" className="hover:text-white">Triathlon</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/articles" className="hover:text-white">Articles</Link></li>
                <li><Link href="/organisers" className="hover:text-white">Find Organisers</Link></li>
                <li><Link href="/register" className="hover:text-white">Organise Events</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Starting Line Events. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Discrete Admin Access Button */}
      <AdminAccessButton />
    </div>
  )
}
