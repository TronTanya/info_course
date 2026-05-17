export default function RootLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" aria-busy="true" aria-label="Загрузка">
      <div className="size-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" role="status" />
    </div>
  );
}
