import React from 'react';
import { ArrowRight, Code, Zap, Bot, Shield, Rocket, CheckCircle, Users, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Code size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">SEI Agents OS</span>
          </div>
          <Link
            to="/app"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            Try Now
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-6">
              🚀 Preview Release - Build the Future of Blockchain
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Build Complete
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Blockchain Apps</span>
            <br />
            on SEI in Minutes
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            The first AI-powered platform that generates full-stack decentralized applications on SEI. 
            Create web apps, smart contracts, and automated agents with simple natural language prompts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/app"
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Start Building Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 border-2 border-gray-600 hover:border-purple-500 text-gray-300 hover:text-white rounded-xl font-semibold text-lg transition-all duration-300">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">10x</div>
              <div className="text-gray-400">Faster Development</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">100%</div>
              <div className="text-gray-400">SEI Native</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">0</div>
              <div className="text-gray-400">Code Required</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need for Full-Stack dApps
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From smart contracts to user interfaces, build complete decentralized applications with AI assistance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Web Apps */}
            <div className="group p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Globe size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Web Applications</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Generate beautiful, responsive web interfaces with React, TypeScript, and Tailwind CSS. 
                Complete with wallet integration and SEI blockchain connectivity.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle size={16} className="text-green-400" />
                  React + TypeScript
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle size={16} className="text-green-400" />
                  Wallet Integration
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle size={16} className="text-green-400" />
                  Responsive Design
                </li>
              </ul>
            </div>

            {/* Smart Contracts */}
            <div className="group p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Shield size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Contracts</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                AI-generated Solidity contracts optimized for SEI's high-performance blockchain. 
                Secure, audited patterns with automatic testing and deployment.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle size={16} className="text-green-400" />
                  SEI Optimized
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle size={16} className="text-green-400" />
                  Security Audited
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle size={16} className="text-green-400" />
                  Auto Testing
                </li>
              </ul>
            </div>

            {/* Automated Agents */}
            <div className="group p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                <Bot size={24} className="text-white" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-2xl font-bold text-white">Automated Agents</h3>
                <span className="px-2 py-1 bg-yellow-600/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-medium">
                  Coming Soon
                </span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Intelligent agents that monitor, execute, and optimize your dApp strategies. 
                From arbitrage to yield farming, automate complex blockchain interactions.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle size={16} className="text-gray-500" />
                  Strategy Automation
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle size={16} className="text-gray-500" />
                  Risk Management
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle size={16} className="text-gray-500" />
                  24/7 Monitoring
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              From Idea to Deployment in 3 Steps
            </h2>
            <p className="text-xl text-gray-400">
              No coding experience required. Just describe what you want to build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Describe Your App</h3>
              <p className="text-gray-400">
                Tell our AI what kind of blockchain application you want to build. 
                Be as detailed or as simple as you like.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">AI Generates Code</h3>
              <p className="text-gray-400">
                Watch as our AI creates your complete application: frontend, 
                smart contracts, and automation agents.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Deploy to SEI</h3>
              <p className="text-gray-400">
                One-click deployment to SEI mainnet or testnet. 
                Your app is live and ready for users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Start building for free, upgrade when you need more power
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="group p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  $0
                  <span className="text-lg text-gray-400 font-normal">/month</span>
                </div>
                <p className="text-gray-400">for getting started</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <span>Daily limits</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <span>Basic AI model</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <span>Create Web and Smart Contracts</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <span>SEI testnet deployment</span>
                </li>
              </ul>
              
              <Link
                to="/app"
                className="w-full block text-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="group relative p-8 bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl border-2 border-purple-500/50 hover:border-purple-400/70 transition-all duration-300 hover:transform hover:scale-105">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold rounded-full">
                  Unlocked in Preview
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  $20
                  <span className="text-lg text-gray-400 font-normal">/month</span>
                </div>
                <p className="text-gray-400">For serious builders</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <span>Higher limits</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <span>Advanced AI models</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <span>Create Web and Smart Contracts</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <span>Create Automated Agents (Coming soon)</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <span>SEI mainnet deployment</span>
                </li>
              </ul>
              
              <button
                disabled
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              All plans include access to our core AI-powered development platform
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Build the Future?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join thousands of developers building the next generation of blockchain applications on SEI
          </p>
          
          <Link
            to="/app"
            className="group inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
          >
            Start Building Now
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </Link>
          
          <p className="text-gray-500 mt-6">
            No credit card required • Free to start • Deploy in minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Code size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">SEI Agents OS</span>
            </div>
            
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; {new Date().getFullYear()} SEI Agents OS. Building the future of blockchain.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}