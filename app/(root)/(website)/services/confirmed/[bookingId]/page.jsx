import ConfirmedView from '@/components/Application/Website/Services/ConfirmedView'

export default async function Page({ params }) {
  const { bookingId } = await params
  return <ConfirmedView bookingId={bookingId} />
}
