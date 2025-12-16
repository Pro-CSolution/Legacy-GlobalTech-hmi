import { ModalBase } from 'components/Modal'
import type { FaultCodeEntry } from 'services'
import * as S from './FaultCodeDetailModal.styles'

type Props = {
  isOpen: boolean
  faultCodeId: number | null
  faultCode: FaultCodeEntry | null
  onClose: () => void
}

const normalize = (v: string | null | undefined) => (v && v.trim().length ? v : 'Not available.')

export const FaultCodeDetailModal = ({ isOpen, faultCodeId, faultCode, onClose }: Props) => {
  const type = faultCode?.type || 'Unknown'
  const title = faultCode?.title || 'Unknown fault code'

  const tone: 'alarm' | 'warning' | 'neutral' =
    String(type).toLowerCase() === 'trip'
      ? 'alarm'
      : String(type).toLowerCase() === 'warning'
        ? 'warning'
        : 'neutral'

  const classes = faultCode?.properties?.class || []
  const autoReset = faultCode?.properties?.auto_reset_param ?? null

  return (
    <ModalBase isOpen={isOpen} onRequestClose={onClose} width={840} ariaLabel="Fault code details">
      <S.Container>
        <S.Header>
          <S.TitleGroup>
            <S.Title>{title}</S.Title>
            <S.Subtitle>
              CODE: {faultCodeId ?? '-'} · TYPE: {String(type).toUpperCase()}
            </S.Subtitle>
          </S.TitleGroup>
          <S.TypePill $tone={tone}>{String(type).toUpperCase()}</S.TypePill>
        </S.Header>

        <S.Body>
          <S.Section>
            <S.SectionTitle>Description</S.SectionTitle>
            <S.SectionText>{normalize(faultCode?.description ?? null)}</S.SectionText>
          </S.Section>

          <S.Section>
            <S.SectionTitle>Possible Causes</S.SectionTitle>
            <S.SectionText>{normalize(faultCode?.causes ?? null)}</S.SectionText>
          </S.Section>

          <S.Section>
            <S.SectionTitle>Recommended Action</S.SectionTitle>
            <S.SectionText>{normalize(faultCode?.action ?? null)}</S.SectionText>
          </S.Section>

          <S.Section>
            <S.SectionTitle>Properties</S.SectionTitle>
            <S.MetaRow>
              <S.Tag>CODE: {faultCodeId ?? '-'}</S.Tag>
              <S.Tag>TYPE: {String(type).toUpperCase()}</S.Tag>
              {autoReset ? <S.Tag>AUTO RESET: {autoReset}</S.Tag> : <S.Tag>AUTO RESET: -</S.Tag>}
              {classes.length > 0 ? (
                classes.map((c) => <S.Tag key={c}>CLASS: {c}</S.Tag>)
              ) : (
                <S.Tag>CLASS: -</S.Tag>
              )}
            </S.MetaRow>
          </S.Section>
        </S.Body>

        <S.Footer>
          <S.CloseButton onClick={onClose}>Close</S.CloseButton>
        </S.Footer>
      </S.Container>
    </ModalBase>
  )
}


