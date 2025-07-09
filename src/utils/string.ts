type ContactWithFamily = {
	previousFamilyName: string | null;
	firstName: string;
	middleName: string | null;
	id: number;
	title: string | null;
	phone: string | null;
	personalNumber: number | null;
	familyId: number | null;
	family: {
		name: string;
	} | null;
} | undefined;

export const getFullName = (contact: ContactWithFamily): string => {
	if (!contact) {
		return '';
	}
	const fullContactName = `${contact.title} ${contact.firstName}${contact.middleName ? ` ${contact.middleName}` : ''} ${contact.previousFamilyName ? `${contact.previousFamilyName}-` : ''}${contact.family?.name}`;
	return fullContactName;
};
