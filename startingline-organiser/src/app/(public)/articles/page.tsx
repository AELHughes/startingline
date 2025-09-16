'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Calendar, User, Tag, ChevronRight } from 'lucide-react'
import { articlesApi, type Article, type ArticleCategory } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AdminAccessButton from '@/components/admin/admin-access-button'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<ArticleCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0
  })

  // Fetch articles and categories
  useEffect(() => {
    fetchArticles()
    fetchCategories()
  }, [currentPage, selectedCategory])

  // Handle search with debounce
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchTerm !== '') {
        fetchArticles()
      }
    }, 500)

    return () => clearTimeout(debounceTimeout)
  }, [searchTerm])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: currentPage,
        limit: 12
      }

      if (searchTerm) params.search = searchTerm
      if (selectedCategory) params.category = selectedCategory

      const response = await articlesApi.getAllArticles(params)
      
      if (response.success) {
        setArticles(response.data)
        setPagination(response.pagination)
      } else {
        console.error('Failed to fetch articles:', response.error)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await articlesApi.getCategories()
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchArticles()
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
    setSearchTerm('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Articles & Resources</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Discover insights, tips, and stories from the world of cycling, running, and triathlon events
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange('')}
              >
                All Articles
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.slug}
                  variant={selectedCategory === category.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(category.slug)}
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : articles.length === 0 ? (
            // No articles found
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Articles Found</h3>
              <p className="text-gray-600 mb-8">
                {searchTerm || selectedCategory
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Articles are being migrated from WordPress. Check back soon!'}
              </p>
              {(searchTerm || selectedCategory) && (
                <Button onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                  setCurrentPage(1)
                }}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            // Articles grid
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      {article.featuredImage ? (
                        <Image
                          src={article.featuredImage}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-6xl font-bold">
                            {article.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {article.categories.slice(0, 2).map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link href={`/articles/${article.slug}`} className="hover:text-blue-600">
                          {article.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {stripHtml(article.excerpt)}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(article.publishedDate)}</span>
                          </div>
                        </div>
                        
                        <Link 
                          href={`/articles/${article.slug}`}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Read More
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {currentPage} of {Math.ceil(pagination.total / pagination.limit)}
                    </span>
                    
                    <Button
                      variant="outline"
                      disabled={currentPage >= Math.ceil(pagination.total / pagination.limit)}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
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
