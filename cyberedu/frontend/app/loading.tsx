import { LoadingState } from "@/components/ui/loading-state";

export default function RootLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-12">
      <LoadingState className="max-w-md w-full" label="Загрузка CyberEdu…" />
    </div>
  );
}
