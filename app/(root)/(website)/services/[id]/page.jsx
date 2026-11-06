import ServiceDetails from '@/components/Application/Website/Services/ServiceDetails'

export default async function Page({ params }) {
  const { id } = await params
  return <ServiceDetails id={id} />
}
