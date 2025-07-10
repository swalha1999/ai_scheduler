'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Shield, ShieldX, Clock, Trash2, MessageSquare } from 'lucide-react';
import { addContactToWhitelist, removeContactFromWhitelist, blockContact, timeoutContact, deleteContact, updateContact } from '@/app/[locale]/dashboard/contacts/actions';
import { toast } from 'sonner';

interface Contact {
	id: number;
	name?: string | null;
	phone: string;
	preferred_language?: 'ar' | 'he' | 'en' | null;
	notes?: string | null;
}

interface ContactActionsProps {
	contact: Contact;
	isWhitelisted?: boolean;
	isBlocked?: boolean;
	locale: string;
}

export function ContactActions({ contact, isWhitelisted = false, isBlocked = false, locale }: ContactActionsProps) {
	const t = useTranslations('dashboard.contacts');
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	
	// Dialog states
	const [editOpen, setEditOpen] = useState(false);
	const [whitelistOpen, setWhitelistOpen] = useState(false);
	const [blockOpen, setBlockOpen] = useState(false);
	const [timeoutOpen, setTimeoutOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	
	// Form states
	const [editForm, setEditForm] = useState({
		name: contact.name || '',
		preferred_language: contact.preferred_language || 'ar',
		notes: contact.notes || '',
	});
	const [whitelistReason, setWhitelistReason] = useState('');
	const [blockReason, setBlockReason] = useState('');
	const [timeoutHours, setTimeoutHours] = useState('24');
	const [timeoutReason, setTimeoutReason] = useState('');

	const handleEditContact = () => {
		startTransition(async () => {
			const result = await updateContact(contact.id, editForm);
			if (result.success) {
				toast.success(result.message);
				setEditOpen(false);
			} else {
				toast.error(result.message);
			}
		});
	};

	const handleWhitelistAction = () => {
		startTransition(async () => {
			const result = isWhitelisted 
				? await removeContactFromWhitelist(contact.id)
				: await addContactToWhitelist(contact.id, whitelistReason);
			
			if (result.success) {
				toast.success(result.message);
				setWhitelistOpen(false);
				setWhitelistReason('');
			} else {
				toast.error(result.message);
			}
		});
	};

	const handleBlockContact = () => {
		startTransition(async () => {
			const result = await blockContact(contact.id, blockReason);
			if (result.success) {
				toast.success(result.message);
				setBlockOpen(false);
				setBlockReason('');
			} else {
				toast.error(result.message);
			}
		});
	};

	const handleTimeoutContact = () => {
		startTransition(async () => {
			const result = await timeoutContact(contact.id, parseInt(timeoutHours), timeoutReason);
			if (result.success) {
				toast.success(result.message);
				setTimeoutOpen(false);
				setTimeoutReason('');
			} else {
				toast.error(result.message);
			}
		});
	};

	const handleDeleteContact = () => {
		startTransition(async () => {
			const result = await deleteContact(contact.id);
			if (result.success) {
				toast.success(result.message);
				setDeleteOpen(false);
			} else {
				toast.error(result.message);
			}
		});
	};

	const handleViewMessages = () => {
		router.push(`/${locale}/dashboard/contacts/${contact.id}/messages`);
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" disabled={isPending}>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setEditOpen(true)}>
						<Edit className="h-4 w-4 mr-2" />
						{t('table.editContact')}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleViewMessages}>
						<MessageSquare className="h-4 w-4 mr-2" />
						{t('table.viewMessages')}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setWhitelistOpen(true)}>
						<Shield className="h-4 w-4 mr-2" />
						{isWhitelisted ? t('table.removeFromWhitelist') : t('table.addToWhitelist')}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTimeoutOpen(true)}>
						<Clock className="h-4 w-4 mr-2" />
						{t('table.timeoutContact')}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setBlockOpen(true)}>
						<ShieldX className="h-4 w-4 mr-2" />
						{t('table.blockContact')}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-red-600">
						<Trash2 className="h-4 w-4 mr-2" />
						{t('table.deleteContact')}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Edit Contact Dialog */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('editDialog.title')}</DialogTitle>
						<DialogDescription>{t('editDialog.description')}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="name">{t('editDialog.name')}</Label>
							<Input
								id="name"
								value={editForm.name}
								onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
								placeholder={t('editDialog.namePlaceholder')}
							/>
						</div>
						<div>
							<Label htmlFor="language">{t('editDialog.language')}</Label>
							<Select
								value={editForm.preferred_language}
								onValueChange={(value) => setEditForm(prev => ({ ...prev, preferred_language: value as 'ar' | 'he' | 'en' }))}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ar">العربية</SelectItem>
									<SelectItem value="he">עברית</SelectItem>
									<SelectItem value="en">English</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="notes">{t('editDialog.notes')}</Label>
							<Textarea
								id="notes"
								value={editForm.notes}
								onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
								placeholder={t('editDialog.notesPlaceholder')}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditOpen(false)}>
							{t('common.cancel')}
						</Button>
						<Button onClick={handleEditContact} disabled={isPending}>
							{isPending ? t('common.saving') : t('common.save')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Whitelist Dialog */}
			<Dialog open={whitelistOpen} onOpenChange={setWhitelistOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{isWhitelisted ? t('whitelistDialog.removeTitle') : t('whitelistDialog.addTitle')}
						</DialogTitle>
						<DialogDescription>
							{isWhitelisted ? t('whitelistDialog.removeDescription') : t('whitelistDialog.addDescription')}
						</DialogDescription>
					</DialogHeader>
					{!isWhitelisted && (
						<div>
							<Label htmlFor="reason">{t('whitelistDialog.reason')}</Label>
							<Textarea
								id="reason"
								value={whitelistReason}
								onChange={(e) => setWhitelistReason(e.target.value)}
								placeholder={t('whitelistDialog.reasonPlaceholder')}
							/>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setWhitelistOpen(false)}>
							{t('common.cancel')}
						</Button>
						<Button onClick={handleWhitelistAction} disabled={isPending}>
							{isPending ? t('common.processing') : t('common.confirm')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Block Dialog */}
			<Dialog open={blockOpen} onOpenChange={setBlockOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('blockDialog.title')}</DialogTitle>
						<DialogDescription>{t('blockDialog.description')}</DialogDescription>
					</DialogHeader>
					<div>
						<Label htmlFor="blockReason">{t('blockDialog.reason')}</Label>
						<Textarea
							id="blockReason"
							value={blockReason}
							onChange={(e) => setBlockReason(e.target.value)}
							placeholder={t('blockDialog.reasonPlaceholder')}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setBlockOpen(false)}>
							{t('common.cancel')}
						</Button>
						<Button onClick={handleBlockContact} disabled={isPending} variant="destructive">
							{isPending ? t('common.processing') : t('blockDialog.confirm')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Timeout Dialog */}
			<Dialog open={timeoutOpen} onOpenChange={setTimeoutOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('timeoutDialog.title')}</DialogTitle>
						<DialogDescription>{t('timeoutDialog.description')}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="hours">{t('timeoutDialog.duration')}</Label>
							<Select value={timeoutHours} onValueChange={setTimeoutHours}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="1">1 {t('timeoutDialog.hour')}</SelectItem>
									<SelectItem value="6">6 {t('timeoutDialog.hours')}</SelectItem>
									<SelectItem value="24">24 {t('timeoutDialog.hours')}</SelectItem>
									<SelectItem value="72">72 {t('timeoutDialog.hours')}</SelectItem>
									<SelectItem value="168">168 {t('timeoutDialog.hours')} (1 {t('timeoutDialog.week')})</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="timeoutReason">{t('timeoutDialog.reason')}</Label>
							<Textarea
								id="timeoutReason"
								value={timeoutReason}
								onChange={(e) => setTimeoutReason(e.target.value)}
								placeholder={t('timeoutDialog.reasonPlaceholder')}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setTimeoutOpen(false)}>
							{t('common.cancel')}
						</Button>
						<Button onClick={handleTimeoutContact} disabled={isPending}>
							{isPending ? t('common.processing') : t('timeoutDialog.confirm')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('deleteDialog.title')}</DialogTitle>
						<DialogDescription>
							{t('deleteDialog.description', { name: contact.name || contact.phone })}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteOpen(false)}>
							{t('common.cancel')}
						</Button>
						<Button onClick={handleDeleteContact} disabled={isPending} variant="destructive">
							{isPending ? t('common.deleting') : t('deleteDialog.confirm')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
} 