'use client'

import { useState, useRef, useCallback } from 'react'
import { 
  PhotoIcon, 
  ArrowUpTrayIcon, 
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'

interface LogoUploadProps {
  currentLogoUrl?: string
  onLogoUploaded: (logoUrl: string) => void
  onError: (error: string) => void
}

export default function LogoUpload({ currentLogoUrl, onLogoUploaded, onError }: LogoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(currentLogoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      onError('Please select a valid image file (PNG, JPEG, JPG)')
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      onError('File size must be less than 2MB')
      return
    }

    setIsUploading(true)
    onError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        onError('Authentication required')
        return
      }

      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type
      })

      const formData = new FormData()
      formData.append('logo', file)

      console.log('Making request to /api/admin/site-settings/upload-logo')

      const response = await fetch('/api/admin/site-settings/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let errorMessage = 'Upload failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || 'Upload failed'
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          const textResponse = await response.text()
          console.error('Raw response:', textResponse)
          errorMessage = `Upload failed (${response.status}): ${textResponse.substring(0, 100)}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Upload successful:', data)
      setUploadedLogo(data.logo_url)
      onLogoUploaded(data.logo_url)
    } catch (error) {
      console.error('Logo upload error:', error)
      onError(error instanceof Error ? error.message : 'Failed to upload logo')
    } finally {
      setIsUploading(false)
    }
  }

  const removeLogo = () => {
    setUploadedLogo(null)
    onLogoUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Logo Display */}
      {uploadedLogo && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Current Logo</h4>
          <div className="flex items-center space-x-4">
            <img 
              src={uploadedLogo} 
              alt="Site Logo" 
              className="h-16 w-auto object-contain bg-white rounded-lg p-2"
            />
            <button
              onClick={removeLogo}
              className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
              <span className="text-sm">Remove</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-yellow-400 bg-yellow-400/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            <p className="text-gray-300">Uploading logo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            {uploadedLogo ? (
              <CheckCircleIcon className="w-12 h-12 text-green-400" />
            ) : (
              <PhotoIcon className="w-12 h-12 text-gray-400" />
            )}
            
            <div className="space-y-2">
              <p className="text-white font-medium">
                {uploadedLogo ? 'Logo uploaded successfully!' : 'Upload your logo'}
              </p>
              <p className="text-gray-400 text-sm">
                {uploadedLogo 
                  ? 'Your logo is now active on the site' 
                  : 'Drag and drop your logo here, or click to browse'
                }
              </p>
            </div>

            {!uploadedLogo && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowUpTrayIcon className="w-5 h-5" />
                <span>Choose File</span>
              </button>
            )}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>Supported formats: PNG, JPEG, JPG</p>
          <p>Maximum file size: 2MB</p>
          <p>Recommended dimensions: 200x200px or larger</p>
        </div>
      </div>
    </div>
  )
} 