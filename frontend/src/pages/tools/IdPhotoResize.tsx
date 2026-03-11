import { useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import ToolLayout from '../../components/ToolLayout'
import FileUploader from '../../components/FileUploader'
import { fileToDataUrl } from '../../utils/imageUtils'

interface CropArea { x: number; y: number; width: number; height: number }

const PRESETS = [
  { label: '1寸', w: 295, h: 413, desc: '25×35mm' },
  { label: '2寸', w: 413, h: 579, desc: '35×49mm' },
  { label: '身份证', w: 358, h: 441, desc: '26×32mm' },
  { label: '护照', w: 390, h: 567, desc: '33×48mm' },
  { label: '签证', w: 480, h: 600, desc: '40×50mm' },
]

const BG_COLORS = [
  { label: '白底', color: '#ffffff' },
  { label: '红底', color: '#e02020' },
  { label: '蓝底', color: '#1A5DAD' },
]

export default function IdPhotoResize() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [preset, setPreset] = useState(PRESETS[0])
  const [bgColor, setBgColor] = useState(BG_COLORS[0])
  const [result, setResult] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  async function handleFile(files: File[]) {
    const dataUrl = await fileToDataUrl(files[0])
    setImageSrc(dataUrl)
    setResult(null)
  }

  const onCropComplete = useCallback((_: unknown, areaPixels: CropArea) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  async function generatePhoto() {
    if (!imageSrc || !croppedAreaPixels) return
    const img = new Image()
    img.src = imageSrc
    await new Promise(r => (img.onload = r))

    const canvas = document.createElement('canvas')
    canvas.width = preset.w
    canvas.height = preset.h
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = bgColor.color
    ctx.fillRect(0, 0, preset.w, preset.h)

    const { x, y, width, height } = croppedAreaPixels
    ctx.drawImage(img, x, y, width, height, 0, 0, preset.w, preset.h)

    setResult(canvas.toDataURL('image/jpeg', 0.95))
  }

  function download() {
    if (!result) return
    const a = document.createElement('a')
    a.href = result
    a.download = `id-photo-${preset.label}.jpg`
    a.click()
  }

  return (
    <ToolLayout title="证件照裁剪" description="一键生成标准尺寸证件照，支持换底色" icon="🪪">
      {!imageSrc ? (
        <FileUploader
          onFiles={handleFile}
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png'] }}
          label="上传照片"
        />
      ) : (
        <div className="space-y-6">
          {/* Preset selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">选择尺寸</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => setPreset(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    preset.label === p.label
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {p.label}
                  <span className="text-xs ml-1 opacity-70">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background color */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">背景颜色</p>
            <div className="flex gap-3">
              {BG_COLORS.map(bg => (
                <button
                  key={bg.label}
                  onClick={() => setBgColor(bg)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    bgColor.label === bg.label ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                >
                  <span
                    className="inline-block w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: bg.color }}
                  />
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cropper */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">拖拽调整裁剪区域</p>
            <div className="relative w-full h-80 bg-gray-900 rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={preset.w / preset.h}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="mt-3">
              <label className="text-xs text-gray-500">缩放</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="w-full accent-blue-500 mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={generatePhoto}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              生成证件照
            </button>
            <button
              onClick={() => { setImageSrc(null); setResult(null) }}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              重新上传
            </button>
          </div>

          {result && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-sm font-semibold text-gray-700 mb-4">
                {preset.label}（{preset.w}×{preset.h}px）
              </p>
              <img src={result} alt="证件照" className="mx-auto max-h-80 rounded-lg shadow-md border" />
              <button
                onClick={download}
                className="mt-4 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                下载证件照
              </button>
            </div>
          )}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  )
}
