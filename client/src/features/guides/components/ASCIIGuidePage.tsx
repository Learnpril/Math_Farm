import React, { useState } from 'react';
import { Copy, Check, Download, Palette, Grid, Layout } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';

/**
 * ASCII Art Guide Page - Comprehensive guide to creating ASCII diagrams
 * Perfect for communicating layouts, structures, and visual concepts
 */
export function ASCIIGuidePage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(id);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <Button
      variant='outline'
      size='sm'
      onClick={() => copyToClipboard(text, id)}
      className='ml-2'
    >
      {copiedText === id ? (
        <Check className='h-4 w-4 text-green-500' />
      ) : (
        <Copy className='h-4 w-4' />
      )}
    </Button>
  );

  const asciiExamples = {
    basicBox: `┌─────────────────┐
│     Content     │
└─────────────────┘`,

    layoutGrid: `┌─────┬─────┬─────┐
│  A  │  B  │  C  │
├─────┼─────┼─────┤
│  D  │  E  │  F  │
└─────┴─────┴─────┘`,

    mobileDesktop: `Mobile:              Desktop:
┌─────────────┐     ┌─────┬─────────┐
│   Header    │     │Side │ Content │
├─────────────┤     │bar  │         │
│   Content   │     │     │         │
│             │     └─────┴─────────┘
└─────────────┘`,

    flowChart: `Start → Process → Decision
  ↓        ↓         ↓
Input → Validate → Output
  ↓        ↓         ↓
[Form] → [Check] → [Save]`,

    hierarchy: `App
├── Header
│   ├── Logo
│   ├── Navigation
│   └── UserMenu
├── Main
│   ├── Sidebar
│   └── Content
└── Footer`,

    stateFlow: `Loading:     Success:      Error:
┌─────────┐  ┌─────────┐   ┌─────────┐
│ ⏳ Wait │  │ ✅ Done │   │ ❌ Fail │
└─────────┘  └─────────┘   └─────────┘`,

    formLayout: `┌─────────────────────┐
│ [Name Input]        │
│ [Email Input]       │
│ [Message Textarea]  │
│                     │
│     [Submit Btn]    │
└─────────────────────┘`,

    navigation: `┌─────────────────────────────────────┐
│ Logo  [Home] [About] [Contact] [👤] │
└─────────────────────────────────────┘`,
  };

  const characters = {
    corners: '┌ ┐ └ ┘',
    lines: '─ │ ├ ┤ ┬ ┴ ┼',
    arrows: '→ ← ↑ ↓ ↗ ↘ ↙ ↖',
    symbols: '• ○ ● ◦ ★ ☆ ♦ ♠ ♣ ♥',
    emojis: '🏠 ⚙️ 👤 📊 🔍 ✅ ❌ ⏳ 📝 🎯',
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4'>
            <Grid className='w-8 h-8 text-purple-600 dark:text-purple-400' />
          </div>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
            ASCII Art Guide
          </h1>
          <p className='text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
            Master the art of visual communication with ASCII diagrams. Perfect
            for explaining layouts, structures, and concepts to developers and
            AI assistants.
          </p>
        </div>

        {/* Quick Start */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Palette className='w-5 h-5 text-purple-600' />
              Quick Start: Your First ASCII Diagram
            </CardTitle>
            <CardDescription>
              Let's create a simple layout diagram step by step
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-semibold mb-2'>
                  1. Start with a basic box:
                </h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.basicBox}</pre>
                </div>
                <CopyButton text={asciiExamples.basicBox} id='basic-box' />
              </div>
              <div>
                <h4 className='font-semibold mb-2'>
                  2. Add content and structure:
                </h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.formLayout}</pre>
                </div>
                <CopyButton text={asciiExamples.formLayout} id='form-layout' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Essential Characters */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Essential ASCII Characters</CardTitle>
            <CardDescription>
              The building blocks of ASCII art - copy and paste these characters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {Object.entries(characters).map(([category, chars]) => (
                <div key={category} className='space-y-2'>
                  <h4 className='font-semibold capitalize'>
                    {category.replace(/([A-Z])/g, ' $1')}
                  </h4>
                  <div className='bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-lg'>
                    {chars}
                    <CopyButton text={chars} id={category} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Layout Examples */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Layout className='w-5 h-5 text-purple-600' />
              Layout Diagrams
            </CardTitle>
            <CardDescription>
              Common layout patterns for web and mobile interfaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-8'>
              {/* Grid Layout */}
              <div>
                <h4 className='font-semibold mb-3'>Grid Layout</h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.layoutGrid}</pre>
                </div>
                <CopyButton text={asciiExamples.layoutGrid} id='layout-grid' />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Perfect for showing card grids, image galleries, or dashboard
                  layouts
                </p>
              </div>

              {/* Responsive Design */}
              <div>
                <h4 className='font-semibold mb-3'>Responsive Design</h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.mobileDesktop}</pre>
                </div>
                <CopyButton
                  text={asciiExamples.mobileDesktop}
                  id='mobile-desktop'
                />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Show how layouts adapt across different screen sizes
                </p>
              </div>

              {/* Navigation */}
              <div>
                <h4 className='font-semibold mb-3'>Navigation Bar</h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.navigation}</pre>
                </div>
                <CopyButton text={asciiExamples.navigation} id='navigation' />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Header layouts with logo, menu items, and user controls
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flow Diagrams */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Flow Diagrams & Processes</CardTitle>
            <CardDescription>
              Show data flow, user journeys, and system processes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-8'>
              {/* Process Flow */}
              <div>
                <h4 className='font-semibold mb-3'>Process Flow</h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.flowChart}</pre>
                </div>
                <CopyButton text={asciiExamples.flowChart} id='flow-chart' />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Great for showing user workflows or data processing steps
                </p>
              </div>

              {/* State Changes */}
              <div>
                <h4 className='font-semibold mb-3'>State Changes</h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.stateFlow}</pre>
                </div>
                <CopyButton text={asciiExamples.stateFlow} id='state-flow' />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Perfect for showing loading states, success/error conditions
                </p>
              </div>

              {/* Hierarchy */}
              <div>
                <h4 className='font-semibold mb-3'>Component Hierarchy</h4>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm'>
                  <pre>{asciiExamples.hierarchy}</pre>
                </div>
                <CopyButton text={asciiExamples.hierarchy} id='hierarchy' />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Show component structure, file organization, or menu
                  hierarchies
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pro Tips */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Pro Tips & Best Practices</CardTitle>
            <CardDescription>
              Level up your ASCII art with these expert techniques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <h4 className='font-semibold'>✨ Enhancement Tips</h4>
                <ul className='space-y-2 text-sm'>
                  <li>
                    • Use emojis for instant recognition (see Emoji Dictionary
                    below)
                  </li>
                  <li>• Add arrows to show interactions: [Click] → [Result]</li>
                  <li>
                    • Use brackets for interactive elements: [Button], [Input]
                  </li>
                  <li>• Show scroll areas with: ↕️ Scrollable Content</li>
                  <li>• Mark important items: ⭐ Primary Action</li>
                  <li>
                    • Combine emojis with ASCII: 🏠 ┌─────┐ for Home section
                  </li>
                </ul>
              </div>
              <div className='space-y-4'>
                <h4 className='font-semibold'>🎯 Communication Tips</h4>
                <ul className='space-y-2 text-sm'>
                  <li>• Keep diagrams simple and focused</li>
                  <li>• Use consistent spacing and alignment</li>
                  <li>• Add brief explanations below diagrams</li>
                  <li>• Show before/after states for changes</li>
                  <li>• Use colors in descriptions: "Purple header"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Examples */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Interactive Examples</CardTitle>
            <CardDescription>
              Try these examples and modify them for your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              <div className='bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg'>
                <h4 className='font-semibold mb-3'>
                  Example: Mobile App Layout
                </h4>
                <div className='bg-white dark:bg-gray-800 p-4 rounded font-mono text-sm mb-3'>
                  <pre>{`┌─────────────────┐
│ ← Math Farm  ⚙️ │ ← Header
├─────────────────┤
│ 📊 Dashboard    │
│ 📚 Topics       │ ← Navigation
│ 🧮 Tools        │
│ 👤 Profile      │
├─────────────────┤
│                 │
│   Main Content  │ ← Content Area
│                 │
└─────────────────┘`}</pre>
                </div>
                <CopyButton
                  text={`┌─────────────────┐
│ ← Math Farm  ⚙️ │
├─────────────────┤
│ 📊 Dashboard    │
│ 📚 Topics       │
│ 🧮 Tools        │
│ 👤 Profile      │
├─────────────────┤
│                 │
│   Main Content  │
│                 │
└─────────────────┘`}
                  id='mobile-app'
                />
              </div>

              <div className='bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg'>
                <h4 className='font-semibold mb-3'>Example: Data Flow</h4>
                <div className='bg-white dark:bg-gray-800 p-4 rounded font-mono text-sm mb-3'>
                  <pre>{`User Input → Validation → Database → Response
    ↓            ↓           ↓         ↓
  [Form]    [Check Rules] [SQLite] [Success]
    ↓            ↓           ↓         ↓
  📝 Type    ✅ Verify    💾 Save   🎉 Done`}</pre>
                </div>
                <CopyButton
                  text={`User Input → Validation → Database → Response
    ↓            ↓           ↓         ↓
  [Form]    [Check Rules] [SQLite] [Success]
    ↓            ↓           ↓         ↓
  📝 Type    ✅ Verify    💾 Save   🎉 Done`}
                  id='data-flow'
                />
              </div>

              <div className='bg-green-50 dark:bg-green-900/20 p-6 rounded-lg'>
                <h4 className='font-semibold mb-3'>
                  Example: Dashboard with Emojis
                </h4>
                <div className='bg-white dark:bg-gray-800 p-4 rounded font-mono text-sm mb-3'>
                  <pre>{`┌─────────────────────────────────────┐
│ 🏠 Dashboard    👤 Profile  ⚙️ Settings │
├─────────────────────────────────────┤
│ 📊 Analytics    📈 Growth: +15%     │
│ ┌─────────────┐ ┌─────────────────┐ │
│ │ 👥 Users    │ │ 💰 Revenue      │ │
│ │ 1,234       │ │ $12,345         │ │
│ └─────────────┘ └─────────────────┘ │
│                                     │
│ 🔔 Recent Activity:                 │
│ • ✅ New user registered            │
│ • 💾 Data backup completed          │
│ • ⚠️ Server load high               │
└─────────────────────────────────────┘`}</pre>
                </div>
                <CopyButton
                  text={`┌─────────────────────────────────────┐
│ 🏠 Dashboard    👤 Profile  ⚙️ Settings │
├─────────────────────────────────────┤
│ 📊 Analytics    📈 Growth: +15%     │
│ ┌─────────────┐ ┌─────────────────┐ │
│ │ 👥 Users    │ │ 💰 Revenue      │ │
│ │ 1,234       │ │ $12,345         │ │
│ └─────────────┘ └─────────────────┘ │
│                                     │
│ 🔔 Recent Activity:                 │
│ • ✅ New user registered            │
│ • 💾 Data backup completed          │
│ • ⚠️ Server load high               │
└─────────────────────────────────────┘`}
                  id='emoji-dashboard'
                />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  Perfect example of how emojis make complex interfaces
                  instantly understandable to AI
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emoji Dictionary for AI Communication */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              🤖 Emoji Dictionary for AI Communication
            </CardTitle>
            <CardDescription>
              Essential emojis that instantly communicate meaning to AI
              assistants when explaining structures and interfaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {/* Navigation & UI Elements */}
              <div className='space-y-3'>
                <h4 className='font-semibold text-purple-600 dark:text-purple-400'>
                  Navigation & UI
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>🏠 Home/Dashboard</span>
                    <CopyButton text='🏠' id='emoji-home' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>⚙️ Settings/Config</span>
                    <CopyButton text='⚙️' id='emoji-settings' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>👤 User/Profile</span>
                    <CopyButton text='👤' id='emoji-user' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🔍 Search</span>
                    <CopyButton text='🔍' id='emoji-search' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📱 Mobile View</span>
                    <CopyButton text='📱' id='emoji-mobile' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>💻 Desktop View</span>
                    <CopyButton text='💻' id='emoji-desktop' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🍔 Menu/Hamburger</span>
                    <CopyButton text='🍔' id='emoji-menu' />
                  </div>
                </div>
              </div>

              {/* Actions & States */}
              <div className='space-y-3'>
                <h4 className='font-semibold text-blue-600 dark:text-blue-400'>
                  Actions & States
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>✅ Success/Complete</span>
                    <CopyButton text='✅' id='emoji-success' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>❌ Error/Failed</span>
                    <CopyButton text='❌' id='emoji-error' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>⏳ Loading/Processing</span>
                    <CopyButton text='⏳' id='emoji-loading' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🔄 Refresh/Reload</span>
                    <CopyButton text='🔄' id='emoji-refresh' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>💾 Save/Store</span>
                    <CopyButton text='💾' id='emoji-save' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📤 Upload/Send</span>
                    <CopyButton text='📤' id='emoji-upload' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📥 Download/Receive</span>
                    <CopyButton text='📥' id='emoji-download' />
                  </div>
                </div>
              </div>

              {/* Content Types */}
              <div className='space-y-3'>
                <h4 className='font-semibold text-green-600 dark:text-green-400'>
                  Content Types
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>📝 Text/Form Input</span>
                    <CopyButton text='📝' id='emoji-text' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🖼️ Image/Media</span>
                    <CopyButton text='🖼️' id='emoji-image' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📊 Chart/Data</span>
                    <CopyButton text='📊' id='emoji-chart' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📋 List/Table</span>
                    <CopyButton text='📋' id='emoji-list' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🗂️ Folder/Category</span>
                    <CopyButton text='🗂️' id='emoji-folder' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📄 Document/Page</span>
                    <CopyButton text='📄' id='emoji-document' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🎯 Target/Goal</span>
                    <CopyButton text='🎯' id='emoji-target' />
                  </div>
                </div>
              </div>

              {/* System & Technical */}
              <div className='space-y-3'>
                <h4 className='font-semibold text-orange-600 dark:text-orange-400'>
                  System & Technical
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>🔧 Tools/Utilities</span>
                    <CopyButton text='🔧' id='emoji-tools' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🗄️ Database/Storage</span>
                    <CopyButton text='🗄️' id='emoji-database' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🌐 API/Network</span>
                    <CopyButton text='🌐' id='emoji-api' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🔐 Security/Auth</span>
                    <CopyButton text='🔐' id='emoji-security' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>⚡ Performance/Fast</span>
                    <CopyButton text='⚡' id='emoji-performance' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🚀 Deploy/Launch</span>
                    <CopyButton text='🚀' id='emoji-deploy' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🔔 Notification/Alert</span>
                    <CopyButton text='🔔' id='emoji-notification' />
                  </div>
                </div>
              </div>

              {/* Math & Education */}
              <div className='space-y-3'>
                <h4 className='font-semibold text-purple-600 dark:text-purple-400'>
                  Math & Education
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>🧮 Calculator/Math</span>
                    <CopyButton text='🧮' id='emoji-calculator' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📚 Learning/Books</span>
                    <CopyButton text='📚' id='emoji-books' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🎓 Education/Course</span>
                    <CopyButton text='🎓' id='emoji-education' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📐 Geometry/Design</span>
                    <CopyButton text='📐' id='emoji-geometry' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🔬 Science/Research</span>
                    <CopyButton text='🔬' id='emoji-science' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>💡 Idea/Concept</span>
                    <CopyButton text='💡' id='emoji-idea' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🏆 Achievement/Success</span>
                    <CopyButton text='🏆' id='emoji-achievement' />
                  </div>
                </div>
              </div>

              {/* Communication */}
              <div className='space-y-3'>
                <h4 className='font-semibold text-pink-600 dark:text-pink-400'>
                  Communication
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>💬 Chat/Message</span>
                    <CopyButton text='💬' id='emoji-chat' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>📢 Announcement</span>
                    <CopyButton text='📢' id='emoji-announcement' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>❓ Help/Question</span>
                    <CopyButton text='❓' id='emoji-help' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>ℹ️ Information/Details</span>
                    <CopyButton text='ℹ️' id='emoji-info' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>⚠️ Warning/Caution</span>
                    <CopyButton text='⚠️' id='emoji-warning' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>🎉 Celebration/Success</span>
                    <CopyButton text='🎉' id='emoji-celebration' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>👥 Team/Community</span>
                    <CopyButton text='👥' id='emoji-team' />
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Examples */}
            <div className='mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg'>
              <h4 className='font-semibold mb-4'>
                💡 AI Communication Examples
              </h4>
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <h5 className='font-medium mb-2'>Instead of saying:</h5>
                  <div className='bg-white dark:bg-gray-800 p-3 rounded text-sm font-mono'>
                    "The header has a home link, settings, and user profile"
                  </div>
                </div>
                <div>
                  <h5 className='font-medium mb-2'>Say this:</h5>
                  <div className='bg-white dark:bg-gray-800 p-3 rounded text-sm font-mono'>
                    "Header: 🏠 Home | ⚙️ Settings | 👤 Profile"
                  </div>
                </div>
              </div>
              <div className='mt-4 text-sm text-gray-600 dark:text-gray-400'>
                <strong>Why it works:</strong> AI assistants instantly
                understand the visual hierarchy and purpose of each element,
                leading to more accurate implementations.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools & Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Tools & Resources</CardTitle>
            <CardDescription>
              Helpful tools and references for creating ASCII art
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-semibold mb-3'>Online ASCII Tools</h4>
                <ul className='space-y-2 text-sm'>
                  <li>• ASCII Table Generator (for data tables)</li>
                  <li>• Box Drawing Character Reference</li>
                  <li>• Unicode Symbol Picker</li>
                  <li>• ASCII Art Text Generators</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-3'>Keyboard Shortcuts</h4>
                <ul className='space-y-2 text-sm font-mono'>
                  <li>• Alt + 196 = ─ (horizontal line)</li>
                  <li>• Alt + 179 = │ (vertical line)</li>
                  <li>• Alt + 218 = ┌ (top-left corner)</li>
                  <li>• Alt + 191 = ┐ (top-right corner)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className='text-center mt-12 p-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg'>
          <h3 className='text-lg font-semibold mb-2'>
            Ready to Create Amazing ASCII Art? 🎨
          </h3>
          <p className='text-gray-600 dark:text-gray-300 mb-4'>
            Start with simple boxes and gradually build more complex diagrams.
            Remember: clarity beats complexity every time!
          </p>
          <div className='bg-white dark:bg-gray-800 p-4 rounded font-mono text-sm inline-block'>
            <pre>{`┌─────────────────┐
│  Happy Coding!  │
│       🚀        │
└─────────────────┘`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
