import { ChartLine } from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 min-h-screen">
      <ChartLine size={48} className="text-green-500" weight="duotone" />
      <h1 className="text-3xl font-bold text-green-400 tracking-tight">
        Trading Feedback
      </h1>
      <p className="text-sm text-green-700">Pronto para os próximos passos.</p>
    </main>
  );
}
