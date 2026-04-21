export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <h1>Detail: {id}</h1>
    </div>
  );
}
