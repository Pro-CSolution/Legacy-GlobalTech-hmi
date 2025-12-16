import { useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, Hash } from 'lucide-react'
import VirtualKeyboard from 'components/VirtualKeyboard/VirtualKeyboard'
import * as S from './PdfViewer.styles'

// Required for pdf.js worker in Vite/Electron
// Using ?url ensures the worker file is bundled and resolves correctly in Electron.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

type Props = {
  fileUrl: string
  initialPage?: number
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const PdfViewer = ({ fileUrl, initialPage = 1 }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(initialPage)

  const [scale, setScale] = useState(1)
  const [fitToWidth, setFitToWidth] = useState(true)
  const [pageWidthAtScale1, setPageWidthAtScale1] = useState<number | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  const [kbVisible, setKbVisible] = useState(false)

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
    const padding = 24 // internal viewer padding + safety
    const target = (containerWidth - padding) / pageWidthAtScale1
    setScale(clamp(target, 0.65, 3))
  }, [fitToWidth, pageWidthAtScale1, containerWidth])

  useEffect(() => {
    setPageNumber(initialPage)
  }, [initialPage, fileUrl])

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

  const applyFitWidth = () => setFitToWidth(true)

  const onJumpToPage = (value: string) => {
    const next = Math.floor(Number(value))
    if (!Number.isFinite(next)) return
    setPageNumber(clamp(next, 1, Math.max(1, numPages || 1)))
  }

  return (
    <S.Container>
      <S.Toolbar>
        <S.ToolbarGroup>
          <S.ToolButton onClick={goPrev} disabled={!canPrev} aria-label="Previous page">
            <ChevronLeft size={20} />
            Prev
          </S.ToolButton>
          <S.ToolButton onClick={goNext} disabled={!canNext} aria-label="Next page">
            Next
            <ChevronRight size={20} />
          </S.ToolButton>

          <S.PageIndicator onClick={() => setKbVisible(true)} aria-label="Jump to page">
            <Hash size={18} />
            {pageNumber} / {numPages || '-'}
          </S.PageIndicator>
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
            Fit
          </S.ToolButton>
        </S.ToolbarGroup>
      </S.Toolbar>

      <S.Viewer ref={containerRef}>
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          loading={<S.InfoText>Loading PDF…</S.InfoText>}
          error={<S.InfoText>Failed to load PDF</S.InfoText>}
        >
          <S.PageWrap>
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading=""
              onLoadSuccess={(page) => {
                // Cache page width at scale=1 so fit-to-width can work accurately.
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
    </S.Container>
  )
}
