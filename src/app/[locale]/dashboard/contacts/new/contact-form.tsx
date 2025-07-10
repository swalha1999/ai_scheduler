'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createContact } from '../actions';

interface ContactFormProps {
	locale: string;
}

export function ContactForm({ locale }: ContactFormProps) {
	const router = useRouter();
	const t = useTranslations('dashboard.contacts.new');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		preferred_language: 'ar' as 'ar' | 'he' | 'en',
		notes: '',
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const result = await createContact(formData);
			
			if (result.success) {
				toast.success(result.message);
				router.push(`/${locale}/dashboard/contacts`);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			console.error('Error creating contact:', error);
			toast.error(t('form.error'));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Name Field */}
			<div className="space-y-2">
				<Label htmlFor="name">{t('form.name')}</Label>
				<Input
					id="name"
					type="text"
					value={formData.name}
					onChange={(e) => handleInputChange('name', e.target.value)}
					placeholder={t('form.namePlaceholder')}
					required
					disabled={isSubmitting}
				/>
			</div>

			{/* Phone Field */}
			<div className="space-y-2">
				<Label htmlFor="phone">{t('form.phone')}</Label>
				<Input
					id="phone"
					type="tel"
					value={formData.phone}
					onChange={(e) => handleInputChange('phone', e.target.value)}
					placeholder={t('form.phonePlaceholder')}
					required
					disabled={isSubmitting}
				/>
				<p className="text-xs text-muted-foreground">
					{t('form.phoneHint')}
				</p>
			</div>

			{/* Language Field */}
			<div className="space-y-2">
				<Label htmlFor="language">{t('form.language')}</Label>
				<Select
					value={formData.preferred_language}
					onValueChange={(value: 'ar' | 'he' | 'en') => handleInputChange('preferred_language', value)}
					disabled={isSubmitting}
				>
					<SelectTrigger>
						<SelectValue placeholder={t('form.languagePlaceholder')} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ar">{t('form.languageArabic')}</SelectItem>
						<SelectItem value="he">{t('form.languageHebrew')}</SelectItem>
						<SelectItem value="en">{t('form.languageEnglish')}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Notes Field */}
			<div className="space-y-2">
				<Label htmlFor="notes">{t('form.notes')}</Label>
				<Textarea
					id="notes"
					value={formData.notes}
					onChange={(e) => handleInputChange('notes', e.target.value)}
					placeholder={t('form.notesPlaceholder')}
					rows={4}
					disabled={isSubmitting}
				/>
			</div>

			{/* Submit Button */}
			<div className="flex justify-end gap-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={isSubmitting}
				>
					{t('form.cancel')}
				</Button>
				<Button
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? t('form.creating') : t('form.create')}
				</Button>
			</div>
		</form>
	);
} 