import { useRef, useState } from 'react'
import {
  Box, Stack, Typography, IconButton, Chip, Tooltip,
  CircularProgress, Alert, Button,
} from '@mui/material'
import {
  AttachFile as AttachIcon, Delete as DeleteIcon,
  OpenInNew as OpenIcon, Image as ImageIcon,
  PictureAsPdf as PdfIcon, CloudUpload as UploadIcon,
} from '@mui/icons-material'
import { useQueryClient } from '@tanstack/react-query'
import { entriesApi } from '../../api/entries'
import { qk } from '../../hooks'
import type { EntryAttachment } from '../../types'

interface Props {
  entryId: number
  attachments: EntryAttachment[]
  vehicleId: number
  allowUpload?: boolean
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === 'application/pdf') return <PdfIcon sx={{ fontSize: 16, color: 'error.light' }} />
  if (mimeType.startsWith('image/')) return <ImageIcon sx={{ fontSize: 16, color: 'info.light' }} />
  return <AttachIcon sx={{ fontSize: 16 }} />
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AttachmentList({ entryId, attachments, vehicleId, allowUpload = true }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      await entriesApi.uploadAttachment(entryId, file)
      qc.invalidateQueries({ queryKey: qk.entries(vehicleId) })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDelete = async (attachmentId: number) => {
    setDeleting(attachmentId)
    try {
      await entriesApi.deleteAttachment(attachmentId)
      qc.invalidateQueries({ queryKey: qk.entries(vehicleId) })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>{error}</Alert>}

      <Stack gap={0.5}>
        {attachments.map((att) => (
          <Stack
            key={att.id}
            direction="row"
            alignItems="center"
            gap={1}
            sx={{
              px: 1.5, py: 0.75,
              borderRadius: 1,
              backgroundColor: 'action.hover',
              '&:hover': { backgroundColor: 'action.selected' },
            }}
          >
            <FileIcon mimeType={att.mime_type} />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="caption" fontWeight={500} noWrap display="block">
                {att.filename}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {formatBytes(att.file_size)}
              </Typography>
            </Box>
            <Tooltip title="Open file">
              <IconButton
                size="small"
                component="a"
                href={entriesApi.attachmentUrl(att.id)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <OpenIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(att.id)}
                disabled={deleting === att.id}
              >
                {deleting === att.id ? <CircularProgress size={12} /> : <DeleteIcon sx={{ fontSize: 14 }} />}
              </IconButton>
            </Tooltip>
          </Stack>
        ))}
      </Stack>

      {allowUpload && (
        <Box mt={1}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={uploading ? <CircularProgress size={13} /> : <UploadIcon />}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            sx={{ fontSize: '0.72rem' }}
          >
            {uploading ? 'Uploading...' : 'Attach File'}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            Images or PDF, max 20 MB
          </Typography>
        </Box>
      )}
    </Box>
  )
}
