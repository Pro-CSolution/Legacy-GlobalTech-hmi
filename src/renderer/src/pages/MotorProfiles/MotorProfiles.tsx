import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ScreenLayout } from 'layouts'
import { Plus, Edit2, Trash2, Layers } from 'lucide-react'
import { Profile } from 'types/profile'
import { getProfiles, createProfile, updateProfile, deleteProfile } from 'services/profileService'
import { HoldButton } from 'components/HoldButton/HoldButton'
import { ProfileEditorModal } from './components/ProfileEditorModal'
import { ApplyProfileOverlay } from './components/ApplyProfileOverlay'
import * as Icons from 'lucide-react'
import { ConfirmModal } from 'components/Modal'

// --- Styled Components ---

const PageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`

const CreateButton = styled.button`
  background: ${({ theme }) => theme.colors.accent.primary};
  color: ${({ theme }) => theme.colors.text.inverse};
  border: none;
  padding: 12px 24px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: transform 0.1s;

  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }
`

const Grid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 24px;
`

const ProfileCard = styled.div<{ $color: string }>`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
  box-shadow: ${({ theme }) => theme.shadows.md};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    bottom: 0;
    background: ${({ $color }) => $color};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

const IconBox = styled.div<{ $color: string }>`
  width: 60px;
  height: 60px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $color }) => $color}22;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
`

const CardTitle = styled.h3`
  margin: 16px 0 8px;
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  color: ${({ theme }) => theme.colors.text.primary};
`

const Stats = styled.div`
  display: flex;
  gap: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
`

const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding-top: 24px;
`

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 10px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.background.primary};
  }
`

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 8px;
`

const PageButton = styled.button`
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

// --- Main Component ---

const PAGE_SIZE = 6

const MotorProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)

  const [applyingProfile, setApplyingProfile] = useState<Profile | null>(null)
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getProfiles()
      const sorted = [...data].sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0
        const db = b.created_at ? new Date(b.created_at).getTime() : 0
        return db - da // newest first
      })
      setProfiles(sorted)
    } catch (err) {
      console.error('Failed to load profiles', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = () => {
    setEditingProfile(null)
    setEditorOpen(true)
  }

  const handleEdit = (p: Profile) => {
    setEditingProfile(p)
    setEditorOpen(true)
  }

  const handleDelete = async () => {
    if (!profileToDelete) return
    try {
      await deleteProfile(profileToDelete.id)
      setProfileToDelete(null)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveProfile = async (data: Partial<Profile>) => {
    if (editingProfile) {
      await updateProfile(editingProfile.id, data)
    } else {
      await createProfile(data as Omit<Profile, 'id' | 'created_at' | 'last_used'>)
    }
    loadData()
  }

  const handleApply = (p: Profile) => {
    setApplyingProfile(p)
  }

  // Pagination Logic
  const totalPages = Math.ceil(profiles.length / PAGE_SIZE)
  const currentProfiles = profiles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <ScreenLayout>
      <PageContainer>
        <Header>
          <Title>
            <Layers size={32} /> Motor Profiles
          </Title>
          <CreateButton onClick={handleCreate}>
            <Plus size={24} /> New Profile
          </CreateButton>
        </Header>

        {loading && <div style={{ color: 'white' }}>Loading...</div>}

        <Grid>
          {currentProfiles.map((p) => {
            const IconRaw = Icons[p.icon as keyof typeof Icons]
            const IconComp = (IconRaw as React.ComponentType<{ size?: number }>) || Icons.HelpCircle
            const deviceCount = new Set(p.parameters.map((param) => param.device_id)).size

            return (
              <ProfileCard key={p.id} $color={p.color}>
                <div>
                  <CardHeader>
                    <IconBox $color={p.color}>
                      <IconComp size={32} />
                    </IconBox>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <ActionButton onClick={() => handleEdit(p)}>
                        <Edit2 size={18} />
                      </ActionButton>
                      <ActionButton onClick={() => setProfileToDelete(p)}>
                        <Trash2 size={18} color="#ef4444" />
                      </ActionButton>
                    </div>
                  </CardHeader>

                  <CardTitle>{p.name}</CardTitle>
                  <Stats>
                    <span>{p.parameters.length} Parameters</span>
                    <span>•</span>
                    <span>
                      {deviceCount} Device{deviceCount !== 1 ? 's' : ''}
                    </span>
                  </Stats>
                </div>

                <Actions>
                  <HoldButton color={p.color} onHoldComplete={() => handleApply(p)}>
                    HOLD TO APPLY
                  </HoldButton>
                </Actions>
              </ProfileCard>
            )
          })}
          {/* Empty Placeholders if needed to maintain grid shape? Not strictly required by grid css */}
        </Grid>

        {totalPages > 1 && (
          <Pagination>
            <PageButton disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </PageButton>
            <span style={{ color: 'white', alignSelf: 'center' }}>
              Page {page} of {totalPages}
            </span>
            <PageButton disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </PageButton>
          </Pagination>
        )}

        <ProfileEditorModal
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          initialProfile={editingProfile}
          onSave={handleSaveProfile}
        />

        {applyingProfile && (
          <ApplyProfileOverlay
            profile={applyingProfile}
            onClose={() => {
              setApplyingProfile(null)
              loadData() // Reload to update 'last used'
            }}
            onCancel={() => setApplyingProfile(null)}
          />
        )}

        <ConfirmModal
          isOpen={!!profileToDelete}
          title="Delete profile"
          message={
            profileToDelete
              ? `Are you sure you want to delete the profile "${profileToDelete.name}"?`
              : ''
          }
          confirmLabel="Delete"
          cancelLabel="Cancel"
          tone="danger"
          onConfirm={handleDelete}
          onCancel={() => setProfileToDelete(null)}
        />
      </PageContainer>
    </ScreenLayout>
  )
}

export default MotorProfiles
