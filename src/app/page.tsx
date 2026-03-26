import { Btn } from "@/components/ui/btn";
import { Pipeline, Statistics } from "@/components/dashboard";
import { Plus } from "lucide-react";

export default async function Home() {
  return (
    <main className="min-h-svh">
      <div className="w-full">
        <section className="w-full">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-4xl leading-none md:hidden">
              Jobi<span className="text-app-primary">.sh</span>
            </h1>
            <Btn className="md:hidden" href="/jobb/new" icon={Plus}>
              Lägg till jobb
            </Btn>
          </div>
        </section>
        <Pipeline jobs={[]} />
        <Statistics applications={[]} />
      </div>
    </main>
  );
}
