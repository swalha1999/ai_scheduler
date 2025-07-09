'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
	Accessibility,
	Type,
	Minus,
	Plus,
	Contrast,
	Palette,
	Link,
	BookOpen,
	Volume2,
	X,
} from 'lucide-react';

const AccessibilityButton = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [fontSize, setFontSize] = useState(16);
	const [isGrayscale, setIsGrayscale] = useState(false);
	const [isHighContrast, setIsHighContrast] = useState(false);
	const [isInverted, setIsInverted] = useState(false);
	const [isLinksHighlighted, setIsLinksHighlighted] = useState(false);
	const [isReadableFont, setIsReadableFont] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const t = useTranslations('a11y');
	const menuRef = useRef<HTMLDivElement>(null);

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	const increaseTextSize = () => {
		setFontSize((prevSize) => prevSize + 2);
	};

	const decreaseTextSize = () => {
		setFontSize((prevSize) => Math.max(prevSize - 2, 12));
	};

	const toggleGrayscale = () => {
		setIsGrayscale(!isGrayscale);
	};

	const toggleHighContrast = () => {
		setIsHighContrast(!isHighContrast);
	};

	const toggleInvertColors = () => {
		setIsInverted(!isInverted);
	};

	const toggleHighlightLinks = () => {
		setIsLinksHighlighted(!isLinksHighlighted);
	};

	const toggleReadableFont = () => {
		setIsReadableFont(!isReadableFont);
	};

	const toggleTextToSpeech = () => {
		setIsSpeaking(!isSpeaking);
		if (!isSpeaking) {
			const text = document.body.innerText;
			const utterance = new SpeechSynthesisUtterance(text);
			window.speechSynthesis.speak(utterance);
		} else {
			window.speechSynthesis.cancel();
		}
	};

	useEffect(() => {
		const applyStyles = () => {
			document.documentElement.style.fontSize = `${fontSize}px`;
			document.documentElement.style.filter = `
        ${isGrayscale ? 'grayscale(100%)' : ''}
        ${isHighContrast ? 'contrast(150%)' : ''}
        ${isInverted ? 'invert(100%)' : ''}
      `;
			if (isReadableFont) {
				document.documentElement.style.setProperty('--font-family', 'Arial, sans-serif');
			} else {
				document.documentElement.style.removeProperty('--font-family');
			}

			const links = document.getElementsByTagName('a');
			Array.from(links).forEach((link) => {
				link.style.textDecoration = isLinksHighlighted ? 'underline' : '';
				link.style.fontWeight = isLinksHighlighted ? 'bold' : '';
			});
		};

		applyStyles();

		return () => {
			document.documentElement.style.fontSize = '';
			document.documentElement.style.filter = '';
			document.documentElement.style.removeProperty('--font-family');
			const links = document.getElementsByTagName('a');
			Array.from(links).forEach((link) => {
				link.style.textDecoration = '';
				link.style.fontWeight = '';
			});
		};
	}, [fontSize, isGrayscale, isHighContrast, isInverted, isLinksHighlighted, isReadableFont]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		// use mousedown and touchstart to catch both mouse and touch events
		document.addEventListener('mousedown', handleClickOutside);
		// eslint-disable-next-line
		document.addEventListener('touchstart', handleClickOutside as EventListener);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			// eslint-disable-next-line
			document.removeEventListener('touchstart', handleClickOutside as EventListener);
		};
	}, [isOpen]);

	return (
		<div className="fixed left-0 top-1/2 z-50 flex -translate-y-1/2 flex-col" ref={menuRef}>
			<button
				onClick={toggleMenu}
				className="rounded-r bg-black p-2 text-white transition-colors hover:bg-gray-800"
			>
				<Accessibility className="h-6 w-6" />
			</button>
			{isOpen && (
				<div className="mt-1.5 rounded-r border border-black bg-white p-2.5 shadow-lg">
					<div className="mb-2 flex items-center justify-between">
						<h3 className="text-sm font-semibold">{t('accessibility')}</h3>
						<button onClick={toggleMenu} className="rounded p-1 hover:bg-gray-100">
							<X className="h-4 w-4" />
						</button>
					</div>
					<ul className="m-0 list-none space-y-1 p-0">
						<li>
							<button
								onClick={increaseTextSize}
								className="flex w-full items-center gap-2 rounded p-1.5 text-left text-black hover:bg-gray-100"
							>
								<Plus className="h-4 w-4" />
								{t('increaseTextSize')}
							</button>
						</li>
						<li>
							<button
								onClick={decreaseTextSize}
								className="flex w-full items-center gap-2 rounded p-1.5 text-left text-black hover:bg-gray-100"
							>
								<Minus className="h-4 w-4" />
								{t('decreaseTextSize')}
							</button>
						</li>
						<li>
							<button
								onClick={toggleGrayscale}
								className="flex w-full items-center gap-2 rounded p-1.5 text-left text-black hover:bg-gray-100"
							>
								<Type className="h-4 w-4" />
								{t('grayscale')}
							</button>
						</li>
						<li>
							<button
								onClick={toggleHighContrast}
								className="flex w-full items-center gap-2 rounded p-1.5 text-left text-black hover:bg-gray-100"
							>
								<Contrast className="h-4 w-4" />
								{t('highContrast')}
							</button>
						</li>
						<li>
							<button
								onClick={toggleInvertColors}
								className="flex w-full items-center gap-2 rounded p-1.5 text-left text-black hover:bg-gray-100"
							>
								<Palette className="h-4 w-4" />
								{t('invertColors')}
							</button>
						</li>
						<li>
							<button
								onClick={toggleHighlightLinks}
								className="flex w-full items-center gap-2 rounded p-1.5 text-left text-black hover:bg-gray-100"
							>
								<Link className="h-4 w-4" />
								{t('highlightLinks')}
							</button>
						</li>
						<li>
							<button
								onClick={toggleReadableFont}
								className="flex w-full items-center gap-2 rounded p-1.5 text-left text-black hover:bg-gray-100"
							>
								<BookOpen className="h-4 w-4" />
								{t('readableFont')}
							</button>
						</li>
						<li>
							<button
								onClick={toggleTextToSpeech}
								className="flex w-full items-center gap-2 rounded p-1.5 text-left text-black hover:bg-gray-100"
							>
								<Volume2 className="h-4 w-4" />
								{t('textToSpeech')}
							</button>
						</li>
					</ul>
				</div>
			)}
		</div>
	);
};

export default AccessibilityButton;
