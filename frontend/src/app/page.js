'use client';

import Link from 'next/link';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation */}
      <nav className="container-custom py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-neutral-900">
              Art & Language Campus
            </h1>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="btn btn-ghost">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-custom py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl font-display font-bold text-neutral-900 mb-6 leading-tight">
            Transform Your
            <span className="block gradient-primary bg-clip-text text-transparent">
              Learning Experience
            </span>
          </h2>
          <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            A modern learning management system designed for art and language education. 
            Create engaging worksheets, track progress, and inspire students.
          </p>
          <div className="flex gap-6 justify-center">
            <Link href="/register" className="btn btn-primary text-lg px-8 py-4">
              Start Teaching
            </Link>
            <Link href="/login" className="btn btn-outline text-lg px-8 py-4">
              I'm a Student
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-custom py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<BookOpen className="w-8 h-8" />}
            title="Interactive Worksheets"
            description="Create engaging, auto-graded worksheets with multiple question types"
            color="bg-primary-100 text-primary-600"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Group Management"
            description="Organize students into groups and assign targeted content"
            color="bg-secondary-100 text-secondary-600"
          />
          <FeatureCard
            icon={<Award className="w-8 h-8" />}
            title="Auto-Grading"
            description="Save time with automatic grading and instant feedback"
            color="bg-accent-100 text-accent-600"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Progress Tracking"
            description="Monitor student performance and identify areas for improvement"
            color="bg-green-100 text-green-600"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-custom py-20">
        <div className="card gradient-primary text-white text-center max-w-4xl mx-auto">
          <h3 className="text-4xl font-display font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of educators transforming their classrooms
          </p>
          <Link href="/register" className="btn bg-white text-primary-600 hover:bg-neutral-100 text-lg px-8 py-4">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container-custom py-12 border-t border-neutral-200">
        <div className="text-center text-neutral-600">
          <p>&copy; 2026 Art & Language Campus. All rights reserved.</p>
          <p className="mt-2">
            <Link href="https://www.artandlanguage.com.mx" className="hover:text-primary-600 transition-colors">
              Visit Our Website
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <div className="card-interactive group">
      <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold text-neutral-900 mb-3">
        {title}
      </h3>
      <p className="text-neutral-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
