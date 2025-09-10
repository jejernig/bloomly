import React from 'react'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    business: 'Bloom Boutique',
    location: 'San Francisco, CA',
    content: 'Bloomly.io transformed how we create Instagram content. What used to take hours now takes minutes, and our engagement has increased by 300%!',
    rating: 5,
    avatar: '/testimonials/sarah-chen.jpg',
  },
  {
    name: 'Maria Rodriguez',
    business: 'Elegance Fashion',
    location: 'Miami, FL',
    content: 'The AI-powered captions are incredible. They capture our brand voice perfectly and our followers love the consistent, professional content.',
    rating: 5,
    avatar: '/testimonials/maria-rodriguez.jpg',
  },
  {
    name: 'Emma Thompson',
    business: 'Vintage Vibes',
    location: 'Austin, TX',
    content: 'As a small boutique owner, I dont have time for complex design tools. Bloomly.io makes it so easy to create beautiful posts that actually drive sales.',
    rating: 5,
    avatar: '/testimonials/emma-thompson.jpg',
  },
]

export function TestimonialsSection() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Loved by boutique owners everywhere
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            See how fashion entrepreneurs are growing their businesses with Bloomly.io
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="boutique-card">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <blockquote className="text-gray-900 mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </blockquote>
              
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">
                    {testimonial.business} • {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span>4.9/5 stars from 500+ boutique owners</span>
          </div>
        </div>
      </div>
    </div>
  )
}