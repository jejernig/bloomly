import React from 'react'
import Link from 'next/link'
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react'

const navigation = {
  product: [
    { name: 'Templates', href: '/templates' },
    { name: 'AI Tools', href: '/features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Examples', href: '/examples' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
  ],
  resources: [
    { name: 'Help Center', href: '/help' },
    { name: 'Documentation', href: '/docs' },
    { name: 'API', href: '/api' },
    { name: 'Status', href: '/status' },
  ],
  legal: [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Cookies', href: '/cookies' },
    { name: 'Licenses', href: '/licenses' },
  ],
  social: [
    {
      name: 'Instagram',
      href: 'https://instagram.com/bloomly',
      icon: Instagram,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/bloomly',
      icon: Twitter,
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/bloomly',
      icon: Facebook,
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/bloomly',
      icon: Youtube,
    },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 pt-12 sm:pt-16 md:pt-20 lg:pt-24 xl:pt-32">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              <h1 className="text-xl sm:text-2xl font-bold font-fashion">Bloomly.io</h1>
            </div>
            <p className="text-xs sm:text-sm leading-5 sm:leading-6 text-gray-300 pr-4">
              AI-powered Instagram content creation platform designed specifically for fashion boutiques. 
              Create stunning posts in minutes, not hours.
            </p>
            <div className="flex space-x-4 sm:space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-gray-300 transition-colors p-3 -m-3 rounded-md"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${item.name}`}
                >
                  <item.icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-10 sm:mt-12 lg:col-span-2 lg:mt-0">
            <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold leading-6 text-white">Product</h3>
                <ul role="list" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-xs sm:text-sm leading-5 sm:leading-6 text-gray-300 hover:text-white transition-colors block py-1"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold leading-6 text-white">Company</h3>
                <ul role="list" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-xs sm:text-sm leading-5 sm:leading-6 text-gray-300 hover:text-white transition-colors block py-1"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold leading-6 text-white">Resources</h3>
                <ul role="list" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  {navigation.resources.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-xs sm:text-sm leading-5 sm:leading-6 text-gray-300 hover:text-white transition-colors block py-1"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold leading-6 text-white">Legal</h3>
                <ul role="list" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-xs sm:text-sm leading-5 sm:leading-6 text-gray-300 hover:text-white transition-colors block py-1"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 sm:mt-12 lg:mt-16 xl:mt-20 border-t border-gray-900/20 pt-6 sm:pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-gray-400 order-2 sm:order-1">
              &copy; 2024 Bloomly.io. All rights reserved.
            </p>
            <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-400 order-1 sm:order-2">
              <span>Made with ❤️ for fashion boutiques</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}