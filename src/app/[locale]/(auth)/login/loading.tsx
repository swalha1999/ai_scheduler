import { LoginFormSkeleton } from './components';

export default function Loading() {
	return (
		<>
			<div className="mb-8 text-center">
				<div className="mx-auto h-10 w-56 rounded-lg bg-primary/20"></div>
			</div>
			<div className="space-y-6">
				<LoginFormSkeleton />
			</div>
			<div className="mt-6 flex justify-center gap-4 text-center">
				<div className="h-6 w-36 rounded-lg bg-primary/20"></div>
			</div>
			<div className="mt-8 flex justify-center">
				<div className="h-10 w-48 rounded-full bg-primary/20"></div>
			</div>
		</>
	);
}
