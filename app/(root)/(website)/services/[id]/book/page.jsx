import BookingWizard from '@/components/Application/Website/Services/BookingWizard'

export default async function Page({ params }) {
  const { id } = await params
  return <BookingWizard id={id} />
}
