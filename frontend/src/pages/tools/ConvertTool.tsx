import { useState } from 'react'
import axios from 'axios'
import ToolLayout from '../../components/ToolLayout'
import FileUploader from '../../components/FileUploader'
import { downloadBlob, formatBytes } from '../../utils/imageUtils'
import { Loader2, FileDown, AlertCircle } from 'lucide-react'

interface Props {
  title: string
  description: string
  icon: string
  endpoint: string
  accept: Record<string, string[]>
  outputExt: string
  uploadLabel: string
}

export default function ConvertTool({
  title, description, icon, endpoint, accept, outputExt, uploadLabel
}: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(files: File[]) {
    setFile(files[0])
    setError(null)
  }

  async function convert() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''
      const res = await axios.post(apiBase + endpoint, formData, {
        responseType: 'blob',
        timeout: 120000,
      })
      const outputName = file.name.replace(/\.[^.]+$/, `.${outputExt}`)
      downloadBlob(res.data, outputName)
    } catch (e: unknown) {
      const err = e as { response?: { data?: Blob } }
      if (err.response?.data) {
        const text = await (err.response.data as Blob).text()
        setError(text || '转换失败，请检查文件格式')
      } else {
        setError('连接服务器失败，请确保后端服务正在运行')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolLayout title={title} description={description} icon={icon}>
      <FileUploader
        onFiles={handleFile}
        accept={accept}
        label={uploadLabel}
      />

      {file && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl">{icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            onClick={convert}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> 转换中，请稍候...</>
              : <><FileDown size={18} /> 开始转换并下载</>
            }
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            文件将上传到服务器进行转换，完成后立即删除
          </p>
        </div>
      )}
    </ToolLayout>
  )
}
