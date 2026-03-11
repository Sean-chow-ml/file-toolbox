import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PdfExtractImages from './pages/tools/PdfExtractImages'
import ImageToPdf from './pages/tools/ImageToPdf'
import WordToPdf from './pages/tools/WordToPdf'
import PdfToWord from './pages/tools/PdfToWord'
import ExcelToPdf from './pages/tools/ExcelToPdf'
import ImageCompress from './pages/tools/ImageCompress'
import DocumentCompress from './pages/tools/DocumentCompress'
import IdPhotoResize from './pages/tools/IdPhotoResize'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools/pdf-extract-images" element={<PdfExtractImages />} />
        <Route path="/tools/image-to-pdf" element={<ImageToPdf />} />
        <Route path="/tools/word-to-pdf" element={<WordToPdf />} />
        <Route path="/tools/pdf-to-word" element={<PdfToWord />} />
        <Route path="/tools/excel-to-pdf" element={<ExcelToPdf />} />
        <Route path="/tools/image-compress" element={<ImageCompress />} />
        <Route path="/tools/document-compress" element={<DocumentCompress />} />
        <Route path="/tools/id-photo" element={<IdPhotoResize />} />
      </Routes>
    </BrowserRouter>
  )
}
