import express, { Request, Response } from 'express'

const router = express.Router()

// Static articles data extracted from https://startingline.co.za/blog/
const staticArticles = [
  {
    id: 1,
    title: "Top 10 Mountain Biking Trails in South Africa",
    slug: "top-10-mountain-biking-trails-south-africa",
    excerpt: "Explore a diverse mix of terrains—from fynbos-draped Western Cape trails to technical Midlands climbs—backed by…",
    content: `<div class="article-content">
      <p>Explore a diverse mix of terrains—from fynbos-draped Western Cape trails to technical Midlands climbs—backed by stunning scenery and world-class facilities.</p>
      <p>South Africa offers some of the world's most spectacular mountain biking experiences, with trails that showcase the country's diverse landscapes and challenging terrain.</p>
      <h2>The Western Cape Region</h2>
      <p>The Western Cape is renowned for its fynbos-covered mountains and technical single tracks that wind through some of the most beautiful scenery in the world.</p>
      <h2>KwaZulu-Natal Midlands</h2>
      <p>The Midlands offer rolling hills, technical climbs, and fast descents through indigenous forests and grasslands.</p>
      <p>Whether you're a beginner looking for scenic routes or an expert seeking technical challenges, South Africa's mountain biking trails offer something for every rider.</p>
    </div>`,
    featuredImage: "https://startingline.co.za/wp-content/uploads/2024/mountain-biking-trails.jpg",
    author: "Starting Line Team",
    publishedDate: "2025-08-15T00:00:00Z",
    modifiedDate: "2025-08-15T00:00:00Z",
    categories: ["Mountain Biking", "Trails", "South Africa"],
    tags: ["mountain biking", "trails", "adventure", "outdoor"],
    commentCount: 0,
    url: "/articles/top-10-mountain-biking-trails-south-africa"
  },
  {
    id: 2,
    title: "Fueling for Triathlons & Long-Distance Cycling: Nutrition for Peak Performance",
    slug: "fueling-triathlons-long-distance-cycling-nutrition",
    excerpt: "For endurance athletes, training is only half the battle — the other half is getting…",
    content: `<div class="article-content">
      <p>For endurance athletes, training is only half the battle — the other half is getting your nutrition strategy right.</p>
      <h2>Pre-Race Nutrition</h2>
      <p>Proper fueling starts days before your event. Focus on carbohydrate loading and maintaining optimal hydration levels.</p>
      <h2>During the Race</h2>
      <p>Maintain steady energy levels with regular intake of carbohydrates and electrolytes throughout your event.</p>
      <h2>Recovery Nutrition</h2>
      <p>Post-race nutrition is crucial for recovery and adaptation. Focus on protein and carbohydrate replenishment within the first 30 minutes.</p>
      <p>The right nutrition strategy can make the difference between hitting the wall and achieving your personal best.</p>
    </div>`,
    featuredImage: "https://startingline.co.za/wp-content/uploads/2024/triathlon-nutrition.jpg",
    author: "Starting Line Team",
    publishedDate: "2025-08-15T00:00:00Z",
    modifiedDate: "2025-08-15T00:00:00Z",
    categories: ["Triathlon", "Cycling", "Nutrition"],
    tags: ["nutrition", "triathlon", "cycling", "performance", "endurance"],
    commentCount: 0,
    url: "/articles/fueling-triathlons-long-distance-cycling-nutrition"
  },
  {
    id: 3,
    title: "Strength Training for Triathletes & Cyclists: Build Power, Speed, and Endurance",
    slug: "strength-training-triathletes-cyclists",
    excerpt: "Triathlon and cycling aren't just about logging endless hours on the road or in the…",
    content: `<div class="article-content">
      <p>Triathlon and cycling aren't just about logging endless hours on the road or in the pool — strategic strength training can be your secret weapon for breakthrough performance.</p>
      <h2>Core Strength for Stability</h2>
      <p>A strong core provides the stable platform needed for efficient power transfer in both cycling and running.</p>
      <h2>Leg Power Development</h2>
      <p>Targeted strength training can significantly improve your power output and climbing ability on the bike.</p>
      <h2>Injury Prevention</h2>
      <p>Proper strength training addresses muscle imbalances and reduces the risk of overuse injuries common in endurance sports.</p>
      <h2>Periodization</h2>
      <p>Learn how to integrate strength training into your endurance program without compromising your aerobic development.</p>
    </div>`,
    featuredImage: "https://startingline.co.za/wp-content/uploads/2024/strength-training.jpg",
    author: "Starting Line Team",
    publishedDate: "2025-08-15T00:00:00Z",
    modifiedDate: "2025-08-15T00:00:00Z",
    categories: ["Triathlon", "Cycling", "Training"],
    tags: ["strength training", "triathlon", "cycling", "performance", "power"],
    commentCount: 0,
    url: "/articles/strength-training-triathletes-cyclists"
  },
  {
    id: 4,
    title: "Nutrition Strategies for Peak Endurance Performance",
    slug: "nutrition-strategies-peak-endurance-performance",
    excerpt: "Fueling Before Training or Racing Your pre-event meal sets the stage for performance. Timing:…",
    content: `<div class="article-content">
      <h2>1. Fueling Before Training or Racing</h2>
      <p>Your pre-event meal sets the stage for performance.</p>
      <h3>Timing:</h3>
      <ul>
        <li>3-4 hours before: Large meal with complex carbohydrates</li>
        <li>1-2 hours before: Light snack focusing on easily digestible carbs</li>
        <li>30 minutes before: Small amount of simple carbohydrates if needed</li>
      </ul>
      <h2>2. During Training/Racing</h2>
      <p>For events longer than 60-90 minutes, aim for 30-60g of carbohydrates per hour.</p>
      <h2>3. Post-Workout Recovery</h2>
      <p>The golden window for recovery nutrition is within 30 minutes post-exercise.</p>
      <p>Focus on a 3:1 or 4:1 ratio of carbohydrates to protein for optimal recovery.</p>
    </div>`,
    featuredImage: "https://startingline.co.za/wp-content/uploads/2024/nutrition-strategies.jpg",
    author: "Starting Line Team",
    publishedDate: "2025-08-15T00:00:00Z",
    modifiedDate: "2025-08-15T00:00:00Z",
    categories: ["Nutrition", "Endurance", "Performance"],
    tags: ["nutrition", "endurance", "performance", "fueling", "recovery"],
    commentCount: 0,
    url: "/articles/nutrition-strategies-peak-endurance-performance"
  },
  {
    id: 5,
    title: "Running Your First Marathon: Avoiding Common Pitfalls",
    slug: "running-first-marathon-avoiding-pitfalls",
    excerpt: "Completing your first marathon is an unforgettable experience — the atmosphere, the challenge, the finish-line…",
    content: `<div class="article-content">
      <p>Completing your first marathon is an unforgettable experience — the atmosphere, the challenge, the finish-line emotions. But many first-time marathoners make crucial mistakes that can turn their dream race into a nightmare.</p>
      <h2>Training Mistakes to Avoid</h2>
      <h3>1. Doing Too Much, Too Soon</h3>
      <p>The most common mistake is increasing weekly mileage too rapidly. Follow the 10% rule: never increase your weekly mileage by more than 10% from one week to the next.</p>
      <h3>2. Ignoring Easy Days</h3>
      <p>Many runners make the mistake of running every training run too hard. 80% of your training should be at an easy, conversational pace.</p>
      <h2>Race Day Strategy</h2>
      <h3>1. Start Conservatively</h3>
      <p>Begin the race 30-60 seconds per mile slower than your goal pace. You can always speed up later.</p>
      <h3>2. Fuel Early and Often</h3>
      <p>Don't wait until you feel hungry or thirsty. Start fueling at mile 6-8 and continue every 45-60 minutes.</p>
      <h2>Mental Preparation</h2>
      <p>The marathon is as much a mental challenge as a physical one. Prepare strategies for when the race gets tough around mile 18-20.</p>
    </div>`,
    featuredImage: "https://startingline.co.za/wp-content/uploads/2024/first-marathon.jpg",
    author: "Starting Line Team",
    publishedDate: "2025-08-15T00:00:00Z",
    modifiedDate: "2025-08-15T00:00:00Z",
    categories: ["Running", "Marathon", "Training"],
    tags: ["marathon", "running", "training", "first-time", "tips"],
    commentCount: 0,
    url: "/articles/running-first-marathon-avoiding-pitfalls"
  }
]

const categories = [
  { slug: "mountain-biking", name: "Mountain Biking", count: 1 },
  { slug: "triathlon", name: "Triathlon", count: 2 },
  { slug: "cycling", name: "Cycling", count: 2 },
  { slug: "nutrition", name: "Nutrition", count: 2 },
  { slug: "running", name: "Running", count: 1 },
  { slug: "training", name: "Training", count: 2 }
]

/**
 * GET /api/articles
 * Get all published WordPress articles
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 12
    const search = req.query.search as string
    const category = req.query.category as string

    console.log(`📰 Fetching articles - Page: ${page}, Limit: ${limit}, Search: ${search || 'none'}, Category: ${category || 'none'}`)

    let filteredArticles = [...staticArticles]

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filteredArticles = filteredArticles.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.excerpt.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower)
      )
    }

    // Filter by category
    if (category) {
      filteredArticles = filteredArticles.filter(article =>
        article.categories.some(cat => cat.toLowerCase().replace(/\s+/g, '-') === category)
      )
    }

    // Pagination
    const offset = (page - 1) * limit
    const paginatedArticles = filteredArticles.slice(offset, offset + limit)

    console.log(`✅ Retrieved ${paginatedArticles.length} articles (${filteredArticles.length} total after filtering)`)

    res.json({
      success: true,
      data: paginatedArticles,
      pagination: {
        page,
        limit,
        total: filteredArticles.length
      }
    })

  } catch (error) {
    console.error('❌ Articles fetch error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch articles'
    })
  }
})

/**
 * GET /api/articles/:slug
 * Get a specific WordPress article by slug
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params

    console.log(`📰 Fetching article by slug: ${slug}`)

    const article = staticArticles.find(article => article.slug === slug)

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      })
    }

    console.log(`✅ Retrieved article: ${article.title}`)

    res.json({
      success: true,
      data: article
    })

  } catch (error) {
    console.error('❌ Article fetch error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch article'
    })
  }
})

/**
 * GET /api/articles/categories
 * Get all article categories
 */
router.get('/meta/categories', async (req: Request, res: Response) => {
  try {
    console.log('📂 Fetching article categories')

    console.log(`✅ Retrieved ${categories.length} categories`)

    res.json({
      success: true,
      data: categories
    })

  } catch (error) {
    console.error('❌ Categories fetch error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories'
    })
  }
})

export default router
