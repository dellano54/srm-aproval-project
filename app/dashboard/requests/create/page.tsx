'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateRequestSchema } from '../../../../lib/types';
import { z } from 'zod';

type CreateRequestFormData = z.infer<typeof CreateRequestSchema>;

interface UploadedFile {
  url: string;
  filename: string;
  size: number;
}

export default function CreateRequestPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<CreateRequestFormData>({
    resolver: zodResolver(CreateRequestSchema),
    defaultValues: {
      attachments: []
    }
  });

  const onSubmit = async (data: CreateRequestFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const requestData = {
        ...data,
        attachments: uploadedFiles.map(file => file.url)
      };

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create request');
      }

      const result = await response.json();
      router.push(`/dashboard/requests/${result._id}`);
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', file);
        // Upload file
        const response = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload file');
        }
        const result = await response.json();
        setUploadedFiles(prev => [...prev, result]);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Request</h1>
        <p className="text-gray-600">Fill in the details for your new request</p>
      </div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              {...register('title')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
              Purpose
            </label>
            <textarea
              id="purpose"
              rows={4}
              {...register('purpose')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="college" className="block text-sm font-medium text-gray-700">
              College
            </label>
            <input
              type="text"
              id="college"
              {...register('college')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
            {errors.college && (
              <p className="mt-1 text-sm text-red-600">{errors.college.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <input
              type="text"
              id="department"
              {...register('department')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="costEstimate" className="block text-sm font-medium text-gray-700">
              Cost Estimate (₹)
            </label>
            <input
              type="number"
              id="costEstimate"
              {...register('costEstimate', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
            {errors.costEstimate && (
              <p className="mt-1 text-sm text-red-600">{errors.costEstimate.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="expenseCategory" className="block text-sm font-medium text-gray-700">
              Expense Category
            </label>
            <input
              type="text"
              id="expenseCategory"
              {...register('expenseCategory')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
            {errors.expenseCategory && (
              <p className="mt-1 text-sm text-red-600">{errors.expenseCategory.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="sopReference" className="block text-sm font-medium text-gray-700">
              SOP Reference (Optional)
            </label>
            <input
              type="text"
              id="sopReference"
              {...register('sopReference')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
            {errors.sopReference && (
              <p className="mt-1 text-sm text-red-600">{errors.sopReference.message}</p>
            )}
          </div>
        </div>
        {/* Document Attachments Section */}
        <div className="sm:col-span-2">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Document Attachments
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : '+ Add Document'}
            </button>
          </div>
          {uploadedFiles.length > 0 ? (
            <ul className="border rounded-md divide-y">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="flex justify-between items-center p-2">
                  <span className="text-sm truncate flex-1 mr-2">{file.filename}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No files uploaded</p>
          )}
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Request'}
          </button>
        </div>
      </form>
    </div>
  );
}