// components/Application/ShopOwner/DragDropUpload.jsx
'use client'

import Image from 'next/image'
import React, { useCallback, useRef, useState } from 'react'

const MAX_FILES = 5
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * DragDropUpload
 *
 * Props:
 *   selectedMedia    – shared array of media objects (also used by MediaModal)
 *   setSelectedMedia – shared setter
 */
const DragDropUpload = ({ selectedMedia, setSelectedMedia }) => {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFiles = useCallback(
    async (fileList) => {
      setError('')

      const files = Array.from(fileList).filter((f) => ACCEPTED_TYPES.includes(f.type))

      if (files.length === 0) {
        setError('Only JPG, PNG, or WEBP images are allowed.')
        return
      }

      const remaining = MAX_FILES - selectedMedia.length
      if (remaining <= 0) {
        setError(`Maximum ${MAX_FILES} images already selected.`)
        return
      }

      const toUpload = files.slice(0, remaining)
      if (toUpload.length < files.length) {
        setError(`Only ${remaining} more image(s) added — max ${MAX_FILES} total.`)
      }

      setUploading(true)

      try {
        const formData = new FormData()
        toUpload.forEach((file) => formData.append('files', file))

        const res = await fetch('/api/shopowner/media/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (!data.success) {
          throw new Error(data.message || 'Upload failed.')
        }

        setSelectedMedia((prev) => [...prev, ...data.data])
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.')
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [selectedMedia, setSelectedMedia]
  )

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = ()  => setDragging(false)
  const onDrop      = (e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }
  const onInputChange = (e) => handleFiles(e.target.files)

  return (
    <div className="space-y-3">
      {/* ── Drop zone ── */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center
          transition-all duration-200 select-none
          ${dragging
            ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20 scale-[1.01]'
            : 'border-gray-300 bg-gray-50 dark:bg-card hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/10'
          }
          ${uploading ? 'opacity-60 pointer-events-none' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={onInputChange}
        />

        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-300 border-t-orange-500" />
              <p className="text-sm font-semibold text-yellow-500">Uploading to Cloudinary…</p>
            </>
          ) : (
            <>
              <div className="rounded-full bg-orange-100 dark:bg-orange-900/40 p-3">
                {dragging ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 3v13m0-13l-3 3m3-3l3 3" />
                  </svg>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {dragging ? 'Drop images here' : 'Drag & drop or click to upload directly'}
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, WEBP · max {MAX_FILES} images · 5 MB each · uploads instantly
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

export default DragDropUpload