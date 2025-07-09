'use client';

import { useState, useRef, type ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ImageUploaderProps {
	fileKey?: string;
	onUploadComplete?: (fileName: string) => void;
	onDelete?: () => void;
	maxSizeMB?: number;
	title?: string;
	acceptedFileTypes?: string;
}

export function ImageUploader({
	fileKey,
	onUploadComplete,
	onDelete,
	maxSizeMB = 5,
	title,
	acceptedFileTypes = 'image/*',
}: ImageUploaderProps) {
	const t = useTranslations('dashboard.account_form');
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const [isDragging, setIsDragging] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [currentFileKey, setCurrentFileKey] = useState<string | undefined>(fileKey);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	const maxSizeBytes = maxSizeMB * 1024 * 1024;

	useEffect(() => {
		if (!fileKey) return;

		setCurrentFileKey(fileKey);

		const fetchPreview = async () => {
			try {
				const response = await fetch('/api/files', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ key: fileKey }),
				});
				const { signedUrl } = await response.json();
				setPreview(signedUrl);
			} catch (error) {
				console.error('Error fetching file preview:', error);
			}
		};

		fetchPreview();
	}, [fileKey]);

	const validateFile = (file: File) => {
		const fileTypeIsValid = file.type.startsWith(acceptedFileTypes.replace('/*', '/'));
		if (!fileTypeIsValid) {
			return false;
		}

		if (file.size > maxSizeBytes) {
			return false;
		}

		return true;
	};

	const handleFileSelection = async (selectedFile: File) => {
		if (!validateFile(selectedFile)) return;

		// If there's an existing file, delete it first
		if (currentFileKey) {
			await handleDeleteFile();
		}

		setFile(selectedFile);

		const reader = new FileReader();
		reader.onload = () => {
			setPreview(reader.result as string);
		};
		reader.readAsDataURL(selectedFile);

		await handleUpload(selectedFile);
	};

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			await handleFileSelection(e.target.files[0]);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			await handleFileSelection(e.dataTransfer.files[0]);
		}
	};

	const handleUpload = async (fileToUpload: File) => {
		if (!fileToUpload) return;

		setIsUploading(true);
		setUploadProgress(0);
		abortControllerRef.current = new AbortController();

		try {
			const response = await fetch('/api/upload', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fileName: fileToUpload.name,
					fileType: fileToUpload.type,
				}),
			});

			const { signedUrl, key } = await response.json();
			await uploadFileWithProgress(
				fileToUpload,
				signedUrl,
				abortControllerRef.current.signal
			);

			// Store the file key for later deletion if needed
			setCurrentFileKey(key);

			onUploadComplete?.(key);
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
			} else {
				console.error('Error uploading file:', error);
			}
		} finally {
			setIsUploading(false);
			abortControllerRef.current = null;
		}
	};

	const uploadFileWithProgress = (
		file: File,
		signedUrl: string,
		signal: AbortSignal
	): Promise<void> => {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.open('PUT', signedUrl);
			xhr.setRequestHeader('Content-Type', file.type);

			xhr.upload.onprogress = (event) => {
				if (event.lengthComputable) {
					const percentComplete = (event.loaded / event.total) * 100;
					setUploadProgress(percentComplete);
				}
			};

			xhr.onload = () => {
				if (xhr.status === 200) {
					resolve();
				} else {
					reject(new Error(`Upload failed with status ${xhr.status}`));
				}
			};

			xhr.onerror = () => {
				reject(new Error('Upload failed'));
			};

			xhr.send(file);

			signal.addEventListener('abort', () => {
				xhr.abort();
				reject(new Error('Upload cancelled'));
			});
		});
	};

	const handleCancelUpload = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
	};

	const handleDeleteFile = async () => {
		if (!currentFileKey) return false;

		setIsDeleting(true);
		try {
			await fetch('/api/files', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ key: currentFileKey }),
			});
			setCurrentFileKey(undefined);
			return true;
		} catch (error) {
			console.error('Error deleting file:', error);
			return false;
		} finally {
			setIsDeleting(false);
		}
	};

	const handleReset = async () => {
		if (!currentFileKey) {
			setFile(null);
			setPreview(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
			return;
		}

		const success = await handleDeleteFile();

		if (success) {
			setFile(null);
			setPreview(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
			onDelete?.();
		}
	};

	return (
		<div className="mx-auto w-full max-w-4xl">
			<Card className="w-full shadow-xl">
				<CardContent className="p-6">
					<h1 className="mb-8 text-center text-3xl font-bold">
						{title || t('invitation_image')}
					</h1>

					<div>
						{!preview ? (
							<div
								className={cn(
									'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center',
									isDragging
										? 'border-primary bg-primary/5'
										: 'border-muted-foreground/25'
								)}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
							>
								<div className="mb-4 rounded-full bg-primary/10 p-4">
									<Upload className="h-6 w-6 text-primary" />
								</div>
								<h3 className="mb-2 text-sm font-semibold">
									{t('invitation_image_description')}
								</h3>
								<p className="mb-4 text-sm text-muted-foreground">
									Supports: JPG, PNG, GIF, WebP (Max {maxSizeMB}MB)
								</p>
								<Button
									variant="outline"
									type="button"
									onClick={() => fileInputRef.current?.click()}
								>
									{t('invitation_image')}
								</Button>
								<input
									ref={fileInputRef}
									type="file"
									accept={acceptedFileTypes}
									className="hidden"
									onChange={handleFileChange}
								/>
							</div>
						) : (
							<div className="space-y-4">
								<div className="relative aspect-video w-full overflow-hidden rounded-lg border">
									<Image
										src={preview}
										alt={t('invitation_image')}
										fill
										className="object-contain"
									/>
									<Button
										size="icon"
										variant="destructive"
										className="absolute right-2 top-2"
										onClick={handleReset}
										type="button"
										disabled={isDeleting}
									>
										{isDeleting ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<X className="h-4 w-4" />
										)}
									</Button>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2 text-sm">
										<ImageIcon className="h-4 w-4" />
										<span className="font-medium">{currentFileKey}</span>
										{file && (
											<span className="text-muted-foreground">
												({Math.round(file.size / 1024)} KB)
											</span>
										)}
									</div>

									{isUploading && (
										<Button
											variant="outline"
											size="sm"
											onClick={handleCancelUpload}
											className="text-destructive"
										>
											Cancel
										</Button>
									)}
								</div>
							</div>
						)}
					</div>

					{isUploading && (
						<div className="mt-8">
							<div className="mb-4 h-2 w-full rounded-full bg-muted">
								<div
									className="h-2 rounded-full bg-primary transition-all duration-300"
									style={{ width: `${uploadProgress}%` }}
								></div>
							</div>
							<div className="flex items-center justify-between">
								<p className="text-sm text-muted-foreground">
									{uploadProgress.toFixed(2)}% uploaded
								</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
