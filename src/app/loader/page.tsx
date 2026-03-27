import { Loader } from "@/components/ui/loader";

export default function LoaderPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-app-sand px-6 py-12">
			<div className="flex w-full max-w-md flex-col items-center justify-center rounded-[32px] border border-black/5 bg-white/80 px-10 py-16 text-center shadow-[0_24px_80px_rgba(23,15,44,0.08)] backdrop-blur-sm">
				<Loader size={128} />
			</div>
		</main>
	);
}
