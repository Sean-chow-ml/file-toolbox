import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wrench } from 'lucide-react'

interface Tool {
  icon: string
  title: string
  desc: string
  path: string
  color: string
  badge?: string
}

const TOOLS: { category: string; items: Tool[] }[] = [
  {
    category: 'PDF 工具',
    items: [
      { icon: '🖼️', title: 'PDF 提取图片', desc: '将每页PDF渲染为高清图片', path: '/tools/pdf-extract-images', color: 'bg-orange-50 hover:bg-orange-100 border-orange-100' },
      { icon: '📄', title: '图片转 PDF', desc: '单张或多张图片合并成PDF', path: '/tools/image-to-pdf', color: 'bg-blue-50 hover:bg-blue-100 border-blue-100' },
      { icon: '📝', title: 'Word 转 PDF', desc: '高质量转换，保持原始排版', path: '/tools/word-to-pdf', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-100', badge: '服务端' },
      { icon: '📋', title: 'PDF 转 Word', desc: '提取文字内容为可编辑文档', path: '/tools/pdf-to-word', color: 'bg-purple-50 hover:bg-purple-100 border-purple-100', badge: '服务端' },
      { icon: '📊', title: 'Excel 转 PDF', desc: '表格转PDF，保持格式', path: '/tools/excel-to-pdf', color: 'bg-green-50 hover:bg-green-100 border-green-100', badge: '服务端' },
    ],
  },
  {
    category: '压缩工具',
    items: [
      { icon: '🗜️', title: '图片压缩', desc: '浏览器内压缩，文件不上传', path: '/tools/image-compress', color: 'bg-pink-50 hover:bg-pink-100 border-pink-100' },
      { icon: '📦', title: 'PDF 压缩', desc: '压缩PDF体积，浏览器内处理', path: '/tools/document-compress', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-100' },
    ],
  },
  {
    category: '图片工具',
    items: [
      { icon: '🪪', title: '证件照裁剪', desc: '1寸/2寸/身份证/护照，一键换底色', path: '/tools/id-photo', color: 'bg-teal-50 hover:bg-teal-100 border-teal-100' },
    ],
  },
]

export default function Home() {
  const [search, setSearch] = useState('')

  const filtered = TOOLS.map(g => ({
    ...g,
    items: g.items.filter(t =>
      t.title.includes(search) || t.desc.includes(search)
    ),
  })).filter(g => g.items.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Wrench size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">文件工具箱</h1>
            <p className="text-xs text-gray-400">免费 · 无广告 · 隐私安全</p>
          </div>
          <div className="ml-auto w-64">
            <input
              type="text"
              placeholder="搜索工具..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-gray-50"
            />
          </div>
        </div>
      </header>

      {/* Hero */}
      {!search && (
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-3">WPS 付费功能，免费使用</h2>
            <p className="text-blue-200 text-lg">PDF处理 · 格式转换 · 图片压缩 · 证件照 · 全在浏览器内完成</p>
          </div>
        </div>
      )}

      {/* Tools Grid */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            没有找到匹配的工具
          </div>
        ) : (
          filtered.map(group => (
            <section key={group.category} className="mb-10">
              <h2 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-4">
                {group.category}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {group.items.map(tool => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    className={`relative ${tool.color} border rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer`}
                  >
                    {tool.badge && (
                      <span className="absolute top-3 right-3 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                        {tool.badge}
                      </span>
                    )}
                    <div className="text-3xl mb-3">{tool.icon}</div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{tool.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{tool.desc}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>文件工具箱 · 所有处理均在浏览器内完成 · 文件不上传至任何服务器（标注"服务端"的功能除外）</p>
      </footer>
    </div>
  )
}
