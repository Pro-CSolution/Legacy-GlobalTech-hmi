import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minus,
  Plus,
  Hash,
  Search,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import VirtualKeyboard from 'components/VirtualKeyboard/VirtualKeyboard'
import * as S from './PdfViewer.styles'

// Import styles for TextLayer to ensure correct positioning
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'

// Required for pdf.js worker in Vite/Electron
// Using ?url ensures the worker file is bundled and resolves correctly in Electron.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

type Props = {
  fileUrl: string
  initialPage?: number
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// IMPORTANT:
// react-pdf's customTextRenderer must return a STRING (it is injected via innerHTML).
// So highlighting must be done using HTML markup, e.g. <mark>.
function highlightHtml(text: string, pattern: string): string {
  const q = pattern.trim()
  if (!q) return text
  const re = new RegExp(escapeRegExp(q), 'gi')
  return text.replace(re, (match) => `<mark class="pdf-highlight">${match}</mark>`)
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const FIT_MIN_SCALE = 0.2
const FIT_MAX_SCALE = 3
const FIT_PADDING_PX = 24 // internal viewer padding + safety

export const PdfViewer = ({ fileUrl, initialPage = 1 }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(initialPage)

  const [scale, setScale] = useState(1)
  const [fitToWidth, setFitToWidth] = useState(true)
  const [pageWidthAtScale1, setPageWidthAtScale1] = useState<number | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Keyboard & Search states
  const [kbVisible, setKbVisible] = useState(false)
  const [searchKbVisible, setSearchKbVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined

    const update = () => setContainerWidth(el.clientWidth)
    update()

    const ro = new ResizeObserver(() => update())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!fitToWidth) return
    if (!pageWidthAtScale1 || containerWidth <= 0) return
    const target = (containerWidth - FIT_PADDING_PX) / pageWidthAtScale1
    setScale(clamp(target, FIT_MIN_SCALE, FIT_MAX_SCALE))
  }, [fitToWidth, pageWidthAtScale1, containerWidth])

  useEffect(() => {
    setPageNumber(initialPage)
  }, [initialPage, fileUrl])

  // Search Logic
  const performSearch = useCallback(
    async (text: string) => {
      if (!pdfDoc || !text.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      const results: number[] = []

      try {
        const numPages = pdfDoc.numPages
        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ')

          if (pageText.toLowerCase().includes(text.toLowerCase())) {
            results.push(i)
          }
        }
      } catch (error) {
        console.error('Search error:', error)
      }

      setSearchResults(results)
      setIsSearching(false)
      if (results.length > 0) {
        setCurrentMatchIndex(0)
        setPageNumber(results[0])
      }
    },
    [pdfDoc]
  )

  const handleNextMatch = () => {
    if (searchResults.length === 0) return
    const nextIndex = (currentMatchIndex + 1) % searchResults.length
    setCurrentMatchIndex(nextIndex)
    setPageNumber(searchResults[nextIndex])
  }

  const handlePrevMatch = () => {
    if (searchResults.length === 0) return
    const prevIndex = (currentMatchIndex - 1 + searchResults.length) % searchResults.length
    setCurrentMatchIndex(prevIndex)
    setPageNumber(searchResults[prevIndex])
  }

  const zoomPct = useMemo(() => `${Math.round(scale * 100)}%`, [scale])

  const canPrev = pageNumber > 1
  const canNext = numPages > 0 && pageNumber < numPages

  const goPrev = () => setPageNumber((p) => clamp(p - 1, 1, Math.max(1, numPages || 1)))
  const goNext = () => setPageNumber((p) => clamp(p + 1, 1, Math.max(1, numPages || 1)))

  const zoomOut = () => {
    setFitToWidth(false)
    setScale((s) => clamp(Number((s - 0.1).toFixed(2)), 0.65, 3))
  }
  const zoomIn = () => {
    setFitToWidth(false)
    setScale((s) => clamp(Number((s + 0.1).toFixed(2)), 0.65, 3))
  }

  const applyFitWidth = async () => {
    // Ensure the action always "does something" even if fitToWidth is already true.
    setFitToWidth(true)

    if (containerWidth <= 0) return

    // Prefer cached page width if we have it.
    if (pageWidthAtScale1) {
      const target = (containerWidth - FIT_PADDING_PX) / pageWidthAtScale1
      setScale(clamp(target, FIT_MIN_SCALE, FIT_MAX_SCALE))
      return
    }

    // Fallback: compute from current page if possible.
    if (!pdfDoc) return
    try {
      const page = await pdfDoc.getPage(pageNumber)
      const w = page.getViewport({ scale: 1 }).width
      setPageWidthAtScale1(w)
      const target = (containerWidth - FIT_PADDING_PX) / w
      setScale(clamp(target, FIT_MIN_SCALE, FIT_MAX_SCALE))
    } catch {
      // Non-fatal: keep current zoom.
    }
  }

  const onJumpToPage = (value: string) => {
    const next = Math.floor(Number(value))
    if (!Number.isFinite(next)) return
    setPageNumber(clamp(next, 1, Math.max(1, numPages || 1)))
  }

  const onDocumentLoadSuccess = (pdf: PDFDocumentProxy) => {
    setNumPages(pdf.numPages)
    setPdfDoc(pdf)
  }

  // Custom renderer for text layer to highlight search terms
  const textRenderer = useCallback(
    (textItem: { str: string }) => {
      if (!searchText) return textItem.str
      return highlightHtml(textItem.str, searchText)
    },
    [searchText]
  )

  return (
    <S.Container>
      <S.Toolbar>
        <S.ToolbarGroup>
          <S.ToolButton onClick={goPrev} disabled={!canPrev} aria-label="Previous page">
            <ChevronLeft size={20} />
          </S.ToolButton>
          <S.PageIndicator onClick={() => setKbVisible(true)} aria-label="Jump to page">
            <Hash size={18} />
            {pageNumber} / {numPages || '-'}
          </S.PageIndicator>
          <S.ToolButton onClick={goNext} disabled={!canNext} aria-label="Next page">
            <ChevronRight size={20} />
          </S.ToolButton>
        </S.ToolbarGroup>

        <S.ToolbarGroup>
          <S.SearchContainer>
            <S.ToolButton
              onClick={() => setSearchKbVisible(true)}
              $active={Boolean(searchText)}
              aria-label="Search"
            >
              <Search size={18} />
              {isSearching ? (
                <span>...</span>
              ) : searchText ? (
                <span>
                  {searchResults.length > 0 ? currentMatchIndex + 1 : 0}/{searchResults.length}
                </span>
              ) : (
                'Search'
              )}
            </S.ToolButton>
            {searchText && (
              <>
                <S.ToolButton onClick={handlePrevMatch} disabled={searchResults.length === 0}>
                  <ArrowUp size={18} />
                </S.ToolButton>
                <S.ToolButton onClick={handleNextMatch} disabled={searchResults.length === 0}>
                  <ArrowDown size={18} />
                </S.ToolButton>
              </>
            )}
          </S.SearchContainer>
        </S.ToolbarGroup>

        <S.ToolbarGroup>
          <S.InfoText>{zoomPct}</S.InfoText>
          <S.ToolButton onClick={zoomOut} aria-label="Zoom out">
            <Minus size={18} />
          </S.ToolButton>
          <S.ToolButton onClick={zoomIn} aria-label="Zoom in">
            <Plus size={18} />
          </S.ToolButton>
          <S.ToolButton onClick={applyFitWidth} aria-label="Fit width">
            <Maximize2 size={18} />
          </S.ToolButton>
        </S.ToolbarGroup>
      </S.Toolbar>

      <S.Viewer ref={containerRef}>
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<S.InfoText>Loading PDF…</S.InfoText>}
          error={<S.InfoText>Failed to load PDF</S.InfoText>}
        >
          <S.PageWrap>
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading=""
              customTextRenderer={searchText ? textRenderer : undefined}
              onLoadSuccess={(page) => {
                const w = page.getViewport({ scale: 1 }).width
                setPageWidthAtScale1(w)
              }}
            />
          </S.PageWrap>
        </Document>
      </S.Viewer>

      <VirtualKeyboard
        visible={kbVisible}
        mode="numeric"
        label={`Go to page (1-${numPages || 1})`}
        initialValue={String(pageNumber)}
        onConfirm={(val) => {
          onJumpToPage(val)
          setKbVisible(false)
        }}
        onCancel={() => setKbVisible(false)}
      />

      <VirtualKeyboard
        visible={searchKbVisible}
        mode="text"
        label="Search in document"
        initialValue={searchText}
        onConfirm={(val) => {
          setSearchText(val)
          performSearch(val)
          setSearchKbVisible(false)
        }}
        onCancel={() => setSearchKbVisible(false)}
      />
    </S.Container>
  )
}
