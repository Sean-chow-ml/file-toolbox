import imageCompression from 'browser-image-compression'
import { jsPDF } from 'jspdf'

export async function compressImage(
  file: File,
  maxSizeMB: number,
  maxWidthOrHeight: number
): Promise<File> {
  return imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  })
}

export async function imagesToPdf(files: File[]): Promise<Blob> {
  const pdf = new jsPDF({ unit: 'px', compress: true })
  let first = true

  for (const file of files) {
    const dataUrl = await fileToDataUrl(file)
    const img = await loadImage(dataUrl)
    const ratio = img.naturalWidth / img.naturalHeight

    if (!first) pdf.addPage()
    first = false

    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    let w = pageW
    let h = w / ratio
    if (h > pageH) {
      h = pageH
      w = h * ratio
    }
    const x = (pageW - w) / 2
    const y = (pageH - h) / 2
    pdf.addImage(dataUrl, 'JPEG', x, y, w, h)
  }

  return pdf.output('blob')
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target!.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
