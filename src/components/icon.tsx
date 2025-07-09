import { icons, Icon as LucideIconComponent } from 'lucide-react';
import * as labIcons from '@lucide/lab';
import * as FaIcons from 'react-icons/fa';
import * as IoIcons from 'react-icons/io';
// import { Icon as RadixIcon } from "@radix-ui/react-icons"; // todo: add this

// to add a new icons to the library, add them to the import statement
// and then add them to the getIconNames function below
// the icons will automatically be available in the Icon component
// and add a check in the getIcon function below to return the correct icon as a component

export const Icon = ({
	name,
	color = 'currentColor',
	size = 20,
	className,
}: {
	name: string;
	color?: string;
	size?: number;
	className?: string;
}) => {
	// check if the icon is in the labIcons namespace
	if (name in labIcons) {
		return (
			<LucideIconComponent
				iconNode={labIcons[name as keyof typeof labIcons]}
				color={color}
				size={size}
				className={className}
			/>
		);
	} else if (name in icons) {
		const LucideIcon = icons[name as keyof typeof icons];
		return <LucideIcon color={color} size={size} className={className} />;
	} else if (name in FaIcons) {
		const FaIcon = FaIcons[name as keyof typeof FaIcons];
		return <FaIcon color={color} size={size} className={className} />;
	} else if (name in IoIcons) {
		const IoIcon = IoIcons[name as keyof typeof IoIcons];
		return <IoIcon color={color} size={size} className={className} />;
	}

	// Return a placeholder for icons that aren't found
	return (
		<div
			className={`flex items-center justify-center rounded bg-gray-100 ${className}`}
			style={{ width: size, height: size }}
		>
			?
		</div>
	);
};

export function getIconNames() {
	const iconSources = {
		lucide: icons,
		lab: labIcons,
		fa: FaIcons,
		io: IoIcons,
	};

	return Object.entries(iconSources).flatMap((icons_data) => Object.keys(icons_data[1]));
}

export function checkIconName(name: string) {
	if (getIconNames().includes(name)) {
		return true;
	}
	return false;
}
